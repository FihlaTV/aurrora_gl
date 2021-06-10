Class(function TestScene() {
    Inherit(this, Object3D);
    const _this = this;

    const COUNT = 20;

    //*** Constructor
    (async function () {
        // _this.add(Utils3D.createDebug(0.5));
        World.SCENE.add(_this.group);

        // initInstance(new THREE.BufferGeometry().fromGeometry(new THREE.IcosahedronGeometry(0.1, 1)));

        initPlane();
        // _this.initClass(Aurora);
        // initAntimatter();
    })();

    function initPlane() {
        let shader = _this.initClass(Shader, 'WorldQuad', {
            tMap: {value: LiquidFluid.instance().rt.texture}
        });
        let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), shader.material);
        World.SCENE.add(mesh);
    }

    function initInstance(shape) {
        let geom = new THREE.InstancedBufferGeometry();
        for (var key in shape.attributes) {
            geom.addAttribute(key, shape.attributes[key]);
        }

        let v3 = new Vector3();
        let position = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
            v3.set(Math.random(-100, 100), 0, Math.random(-100, 100)).normalize().multiplyScalar(Math.random(0.6, 0.75, 4));
            position[i * 3 + 0] = v3.x;
            position[i * 3 + 1] = 0;
            position[i * 3 + 2] = v3.z;
        }

        geom.addAttribute('offset', new THREE.InstancedBufferAttribute(position, 3, 1));

        let shader = _this.initClass(Shader, 'InstanceTest', {wireframe: true});

        let mesh = new THREE.Mesh(geom, shader.material);
        mesh.frustumCulled = false;
        _this.add(mesh);
    }

    function initAntimatter() {
        let _antimatter = _this.initClass(Antimatter, Math.pow(128, 2), World.RENDERER);
        _antimatter.ready().then(() => {
            _this.add(_antimatter.getMesh());

            // let count = _antimatter.geometry.attributes.position.count;
            // _antimatter.geometry.addAttribute('scale', new THREE.BufferAttribute(new Float32Array(count), 1));

            // _antimatter.shader.uniforms.color = {type: 'c', value: new THREE.Color(0x26d3b0)};
            // _antimatter.shader.material.blending = THREE.AdditiveBlending;
            // _antimatter.shader.material.transparent = true;
            // _antimatter.shader.material.depthWrite = false;

            let pass = _this.initClass(AntimatterPass, 'TestMove');
            _antimatter.addPass(pass);

            // _antimatter.update();
            // _antimatter.update();
            _this.startRender(_ => _antimatter.update());
        });
    }


    //*** Event handlers

    //*** Public methods

});