Class(function ARKit() {
    Inherit(this, Component);
    const _this = this;
    var _rt, _interface, _cameraTexture, _nullGroup, _cameraGroup, _cameraMesh;
    var _quaternion, _euler;

    var _cameraShaders = {};
    this.lightIntensity = {type: 'f', value: 0};
    this.FIRST_TRANSFORM = 'arkit_first_transform';
    this.TRACKING_CHANGE = 'arkit_tracking_change';

    //*** Constructor
    (function () {
        if (window.AURA) addListeners();
    })();

    //*** Event handlers
    function addListeners() {
        AURA.setRotation = setRotation;
        AURA.setProjectionMatrix = setProjectionMatrix;
        AURA.setTransform = setTransform;
        AURA.setLightIntensity = setLightIntensity;
        AURA.setTrackingState = setTrackingState;
        AURA.setTrackingOrientation = setOrientation;
    }

    function resizeHandler() {
        _rt.setSize(Stage.width, Stage.height);
        _this.renderer.setSize(Stage.width, Stage.height);
        getUVScale();
    }

    function setRotation(value) {
        _this.rotation && _this.rotation.fromArray(value);
        // _this.worldCamera && _this.worldCamera.rotation.copy(_this.rotation);
    }

    function setProjectionMatrix(value) {
        if (_this.worldCamera) {
            _this.worldCamera.projectionMatrix.fromArray(value);
            _this.worldCamera.fov = Math.atan(1 / value[5]) * 2 * (180 / Math.PI);
        }
    }

    function setTransform(value) {
        if (_this.worldCamera) {
            _cameraGroup.matrixWorld.fromArray(value);
            _cameraGroup.matrixWorld.decompose(_cameraGroup.position, _cameraGroup.quaternion, _cameraGroup.scale);
            _nullGroup.updateMatrix();
            _nullGroup.updateMatrixWorld();
            Utils3D.decompose(_cameraGroup, _this.worldCamera);

            _this.worldCamera.quaternion.multiply(_quaternion);

            if (!_this.flag('firstSet')) {
                _this.flag('firstSet', true);
                _this.events.fire(_this.FIRST_TRANSFORM);
            }
        }
    }

    function setLightIntensity(value) {
        _this.lightIntensity.value = Math.range(value, 500, 1000, 0.5, 1.0);
    }

    function setTrackingState(state) {
        let lastState = _this.trackingState;
        _this.trackingState = state;
        if (state.includes('limited')) {
            let reason = state.split('/')[1];
            _this.trackingState = 'limited';
            _this.trackingReason = reason;
        }

        if (_this.trackingState != lastState) {
            _this.events.fire(_this.TRACKING_CHANGE);
        }
    }

    function setOrientation(orientation) {
        if (!_cameraMesh) return;
        _this.orientation = orientation;
        _cameraMesh.material = _cameraShaders[orientation].material;

        switch (orientation) {
            case 'portrait': _euler.z = Math.radians(90); break;
            case 'portraitUpsideDown': _euler.z = Math.radians(-90); break;
            case 'landscapeLeft': _euler.z = 0; break;
            case 'landscapeRight': _euler.z = Math.radians(180); break;
        }

        _quaternion.setFromEuler(_euler);
    }

    function getUVScale() {
        if (!_this.uvScale) _this.uvScale = new THREE.Vector2();

        let scale = _this.uvScale;
        if (!Mobile.System || !Mobile.System.model.includes('iPad')) {
            scale.x = scale.y = 1;
        } else {
            if (Stage.width > Stage.height) {
                scale.x = 1.2;
                scale.y = 1;
            } else {
                scale.x = 1;
                scale.y = 1.3;
            }
        }

        return scale;
    }

    //*** Public methods
    this.init = function() {
        _this.renderer = new THREE.WebGLRenderer({canvas: window._canvas});
        _this.worldCamera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
        _this.rotation = new THREE.Euler();
        _this.scene = new THREE.Scene();
        _this.renderer.setPixelRatio(Device.pixelRatio);
        _this.renderer.setSize(Stage.width, Stage.height);

        _this.anchors = new ARKitAnchors(_this.scene);

        _interface = ARInterface.create();
        _nullGroup = new THREE.Group();
        _cameraGroup = new THREE.Group();
        _nullGroup.add(_cameraGroup);

        _quaternion = new THREE.Quaternion();
        _euler = new THREE.Euler();

        let lum = Utils3D.getTexture('AURA_LUMINANCE');
        let chroma = Utils3D.getTexture('AURA_CHROMA');

        ['landscapeLeft', 'landscapeRight', 'portraitUpsideDown', 'portrait'].forEach(name => {
            let cameraShader = _this.initClass(Shader, 'ARKitCamera', `ARKitCamera${name.capitalize()}`, {
                depthWrite: false,
                tChroma: {type: 't', value: lum},
                tLum: {type: 't', value: chroma}
            });

            _cameraShaders[name] = cameraShader;
        });

        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(40, 1, 0.02, 100);
        _rt = Utils3D.createRT(Stage.width, Stage.height);
        _cameraTexture = _rt.texture;

        let geom = new THREE.PlaneBufferGeometry(2, 2);
        let mesh = new THREE.Mesh(geom, _cameraShaders.landscapeLeft.material);
        mesh.frustumCulled = false;
        scene.add(mesh);
        _cameraMesh = mesh;

        let copyShader = _this.initClass(Shader, 'ARKitCameraCopy', {
            tMap: {type: 't', value: _rt.texture},
            uScale: {type: 'v2', value: getUVScale()},
            depthWrite: false,
        });

        mesh = new THREE.Mesh(geom, copyShader.material);
        mesh.frustumCulled = false;
        _this.scene.add(mesh);

        _this.startRender(() => {
            lum.version = chroma.version = Render.TIME;
            lum.needsUpdate = true;
            chroma.needsUpdate = true;
            _this.renderer.render(scene, camera, _rt);
        });

        _this.events.sub(Events.RESIZE, resizeHandler);
    }

    this.resetOrigin = function() {
        AURA.resetOrigin();
    }

    this.findSurface = function(obj = Mouse) {
        if (!_interface) return Promise.resolve([]);
        let results = _interface.searchWithParams({x: obj.x / Stage.width, y: obj.y / Stage.height});
        results.forEach((array, i) => {
            let position = new THREE.Vector3();
            let rotation = new THREE.Quaternion();
            let scale = new THREE.Vector3();
            let matrix = new THREE.Matrix4();
            matrix.fromArray(array);
            matrix.decompose(position, rotation, scale);
            results[i] = position;
        });
        return Promise.resolve(results);
    }

    this.get('cameraTexture', () => {
        return _cameraTexture;
    });
}, 'static');