Class(function SceneView() {
    Inherit(this, Object3D);
    const _this = this;

    //*** Constructor
    (function () {
        World.POSITION = new THREE.Vector3();
        if (Device.mobile) {
            Global.PARTICLE_SCALE = 0.1;
            Global.SCALE = 0.1;
            _this.group.scale.setScalar(Global.SCALE);
        } else {
            Global.SCALE = 1;
            Global.PARTICLE_SCALE = 1;
        }

        initMesh();
        // initWorld();
        addListeners();
        World.SCENE.add(_this.group);
    })();

    function initMesh() {
        let island = _this.initClass(Island, null);
        let wrapper = new THREE.Group();
        wrapper.add(island.group);
        wrapper.prefix = 'island';
        MeshUIL.add(wrapper);

        _this.add(wrapper);
        _this.initClass(Globe);

        _this.initClass(Dome);
    }

    function initWorld() {
        let world = _this.initClass(WorldScale);
        world.group.scale.setScalar(10);
    }

    //*** Event handlers
    function addListeners() {
        if (Device.mobile) _this.events.sub(Mouse.input, Interaction.END, click);
    }

    function click() {
        World.POSITION.copy(World.CAMERA.position);
        _this.group.position.copy(World.CAMERA.position);
    }

    //*** Public methods

});