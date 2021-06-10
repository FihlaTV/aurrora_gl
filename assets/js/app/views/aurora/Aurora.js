Class(function Aurora() {
    Inherit(this, Object3D);
    const _this = this;

    const COUNT = 40;

    //*** Constructor
    (function () {
        initGeometry();
        _this.startRender(loop);
    })();

    function initGeometry() {
        let plane = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry(1.0, 1,0));
        let geom = new THREE.InstancedBufferGeometry();
        for (let key in plane.attributes) {
            geom.addAttribute(key, plane.attributes[key]);
        }

        let position = new Float32Array(COUNT * 3);
        let attribs = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
            position[i * 3 + 0] = 0;
            position[i * 3 + 1] = 0;
            position[i * 3 + 2] = Math.range(i, 0, COUNT, -1.0, 1.0) * 0.2;

            attribs[i * 3 + 0] = i / COUNT;
            attribs[i * 3 + 1] = Math.random(0, 1, 4);
            attribs[i * 3 + 2] = Math.random(0, 1, 4);
        }

        geom.addAttribute('offset', new THREE.InstancedBufferAttribute(position, 3, 1));
        geom.addAttribute('attribs', new THREE.InstancedBufferAttribute(attribs, 3, 1));

        initMesh(geom);
    }

    function initMesh(geom) {
        let colors = new UniformColors(['#00ea8d', '#008aea']);

        let shader = _this.initClass(Shader, 'Aurora', {
            tFluid: {value: LiquidFluid.instance().rt.texture},
            uColors: colors.uniform,
            uTime: World.TIME,
            transparent: true,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide,
        });

        let mesh = new THREE.Mesh(geom, shader.material);
        mesh.rotation.x = Math.radians(30);

        let wrapper = new THREE.Group();
        wrapper.rotation.x = Math.radians(90);
        wrapper.add(mesh);

        FX.Atmosphere.aurora.addAurora(mesh);

        _this.add(wrapper);
    }

    function loop() {
        _this.group.quaternion.copy(World.CAMERA.quaternion);
    }

    //*** Event handlers


    //*** Public methods

});