Class(function ARCore() {
    Inherit(this, Component);
    const _this = this;
    var _cameraTexture, _cameraMesh;
    var _nullGroup, _cameraGroup;

    var _cameraShaders = {};

    this.lightIntensity = {type: 'f', value: 0};

    this.FIRST_TRANSFORM = 'arcore_first_transform';
    this.TRACKING_CHANGE = 'arcore_tracking_change';

    //*** Constructor
    (function () {
        if (window.gAR) addListeners();
    })();

    //*** Event handlers
    function addListeners() {
        gAR.onPose = handlePose;
        gAR.onOrientation = handleOrientation;
        gAR.setTrackingState = setTrackingState;
    }

    function handlePose() {
        if (_this.worldCamera) {
            _this.worldCamera.projectionMatrix.fromArray(gAR.projectionMatrix);
            _cameraGroup.position.fromArray(gAR.translation);
            _cameraGroup.quaternion.fromArray(gAR.quaternion);
            _nullGroup.updateMatrix();
            _nullGroup.updateMatrixWorld();
            Utils3D.decompose(_cameraGroup, _this.worldCamera);
            _this.worldCamera.fov = Math.atan(1 / _this.worldCamera.projectionMatrix[5]) * 2 * (180 / Math.PI);
            _this.lightIntensity.value = gAR.lightIntensity;

            if (!_this.flag('firstSet')) {
                _this.flag('firstSet', true);
                _this.events.fire(_this.FIRST_TRANSFORM);
            }
        }
    }

    function handleOrientation() {
        let shader = _cameraShaders[gAR.orientation];
        if (_cameraMesh) _cameraMesh.material = shader.material;
    }

    function setTrackingState(state) {
        _this.trackingState = state;
        _this.events.fire(_this.TRACKING_CHANGE);
    }

    //*** Public methods
    this.init = function() {
        _this.renderer = new THREE.WebGLRenderer({canvas: window._canvas});
        _this.worldCamera = new THREE.PerspectiveCamera(100, Stage.width / Stage.height, 0.1, 1000);
        _this.scene = new THREE.Scene();
        _this.renderer.setPixelRatio(World.DPR);
        _this.renderer.setSize(Stage.width, Stage.height);

        _nullGroup = new THREE.Group();
        _cameraGroup = new THREE.Group();
        _nullGroup.add(_cameraGroup);

        // _nullGroup.rotation.x = Math.radians(-90);

        let texture = Utils3D.getTexture('AURA_CAMERA');
        let geom = new THREE.PlaneBufferGeometry(2, 2);

        ['landscapeLeft', 'landscapeRight', 'portraitUpsideDown', 'portrait'].forEach(name => {
            let shader = _this.initClass(Shader, `ARCoreCamera${name.capitalize()}`, 'ARCoreCamera', {
                tMap: {value: texture},
                depthWrite: false,
            });
            _cameraShaders[name] = shader;
        });

        let shader = _cameraShaders['landscapeLeft'];

        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(40, 1, 0.02, 1000);
        _rt = Utils3D.createRT(Math.round(Stage.width * World.DPR), Math.round(Stage.height * World.DPR));
        _cameraTexture = _rt.texture;

        let mesh = new THREE.Mesh(geom, shader.material);
        mesh.frustumCulled = false;
        _cameraMesh = mesh;
        scene.add(mesh);

        let copyShader = _this.initClass(Shader, 'ARCoreCopy', {
            depthWrite: false,
            tMap: {type: 't', value: _cameraTexture},
        });

        mesh = new THREE.Mesh(geom, copyShader.material);
        mesh.frustumCulled = false;
        _this.scene.add(mesh);

        defer(_ => gAR.setTextureId(texture.id + 1));

        _this.startRender(() => {
            _this.renderer.render(scene, camera, _rt);
            texture.version = Render.TIME;
            texture.needsUpdate = true;
        });
    }

    this.findSurface = function(obj = Mouse) {
        let promise = Promise.create();
        gAR.findSurface({x: obj.x / Stage.width, y: obj.y / Stage.height}, data => {

        });
        return promise;
    }

    this.resetOrigin = function() {
        gAR.resetOrigin();
    }

    this.get('cameraTexture', () => {
        return _cameraTexture || Utils3D.getTexture('assets/images/uv.jpg');
    });

    this.get('uvScale', _ => {
        return new THREE.Vector2(1, 1);
    });
}, 'static');