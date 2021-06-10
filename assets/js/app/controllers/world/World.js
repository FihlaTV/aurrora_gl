Class(function World() {
    Inherit(this, Component);
    const _this = this;
    let _renderer, _scene, _camera, _nuke, _controls;

    World.DPR = Device.mobile ? 2 : 1;

    //*** Constructor
    (function () {
        initWorld();
        initControls();
        addHandlers();
        VFX.instance();
        _this.startRender(loop);
    })();

    function initWorld() {
        RenderGL.initialize(Device.mobile ? RenderGL.AR : RenderGL.NORMAL, {powerPreference: 'high-performance'});
        _renderer = RenderGL.threeRenderer;
        _scene = RenderGL.scene;
        _camera = RenderGL.camera.worldCamera;
        _nuke = RenderGL.nuke;

        World.SCENE = _scene;
        World.RENDERER = _renderer;
        World.ELEMENT = $(_renderer.domElement);
        World.CAMERA = _camera;
        World.NUKE = _nuke;
        World.QUAD = new THREE.PlaneBufferGeometry(2, 2);

        World.LIGHT = new THREE.PointLight();
        World.LIGHT.position.set(200, 0, 100);
        World.LIGHT.prefix = 'LIGHT';
        MeshUIL.add(World.LIGHT);

        World.TIME = {ignoreUIL: true, type: 'f', value: 0};
        World.RESOLUTION = {ignoreUIL: true, type: 'v2', value: new THREE.Vector2(Stage.width * World.DPR, Stage.height * World.DPR)};
    }

    function initControls() {
        _controls = new THREE.OrbitControls(_camera, World.ELEMENT.div);

        if (RenderGL.type == RenderGL.NORMAL) {
            _camera.position.set(0.0, 0.0, 6.0);
            _camera.target = new THREE.Vector3(0.0, 0.0, 0.0);
            _camera.lookAt(_camera.target);
            _controls.target = _camera.target;
        } else {
            _controls.enabled = false;
        }

        World.CONTROLS = _controls;
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.sub(Events.RESIZE, resize);
    }

    function resize() {
        _renderer.setSize(Stage.width, Stage.height);
        _camera.aspect = Stage.width / Stage.height;
        _camera.updateProjectionMatrix();
        World.RESOLUTION.value.set(Stage.width * World.DPR, Stage.height * World.DPR);
    }

    function loop(t, delta) {
        World.TIME.value += delta * 0.001;
        if (_controls && _controls.enabled) _controls.update();
        RenderGL.render();
    }

    //*** Public methods

}, function() {
    var _instance;

    World.instance = function() {
        if (!_instance) _instance = new World();
        return _instance;
    };

});
