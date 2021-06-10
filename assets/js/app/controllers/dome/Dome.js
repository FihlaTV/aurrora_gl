Class(function Dome() {
    Inherit(this, Object3D);
    const _this = this;

    //*** Constructor
    (function () {
        initMesh();
        initParticles();
    })();

    function initMesh() {
        let geom = new THREE.IcosahedronBufferGeometry(1.5, 3);
        let shader = _this.initClass(Shader, 'Dome', {
            uNoiseScale: {value: 0.6},
            uNoiseSpeed: {value: 0.3},
            uHueOffset: {value: 0.3},
            uTime: World.TIME,
            uColor: {value: new THREE.Color()},
            uDark: {value: 1},
            tCamera: AR.cameraTexture,
            uResolution: World.RESOLUTION,
            tGlobe: {value: FX.Globe.instance().rt.texture},
            uFresnel: {value: 0.4},
            side: THREE.BackSide,
        });
        let mesh = new THREE.Mesh(geom, shader.material);
        _this.add(mesh);

        ShaderUIL.add(shader);

        // FX.Atmosphere.sky.addObject(mesh);
    }

    function initParticles() {
        let geom = new THREE.BufferGeometry();
        let v3 = new Vector3();
        let count = 100;
        let position = new Float32Array(count * 3);
        let attribs = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            v3.set(Math.random(-1, 1, 4), Math.random(-1, 1, 4), Math.random(-1, 1, 4)).normalize().multiplyScalar(Math.random(1.1, 1.4, 4));

            position[i * 3 + 0] = v3.x;
            position[i * 3 + 1] = v3.y;
            position[i * 3 + 2] = v3.z;

            attribs[i * 3 + 0] = Math.random(0, 1, 4);
            attribs[i * 3 + 1] = Math.random(0, 1, 4);
            attribs[i * 3 + 2] = Math.random(0, 1, 4);
        }

        geom.addAttribute('position', new THREE.BufferAttribute(position, 3));
        geom.addAttribute('attribs', new THREE.BufferAttribute(attribs, 3));

        let shader = _this.initClass(Shader, 'Stars', {
            uSize: {value: 0.045 * World.DPR * Global.PARTICLE_SCALE},
            tFlare: {value: Utils3D.getTexture('assets/images/stars/flare.jpg')},
            tCenter: {value: Utils3D.getTexture('assets/images/stars/center.jpg')},
            tMap: {value: Utils3D.getTexture('assets/images/stars/map.jpg')},
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        ShaderUIL.add(shader);

        let mesh = new THREE.Points(geom, shader.material);
        _this.add(mesh);

        _this.startRender(_ => {
           mesh.rotation.y += 0.002;
        });
    }

    //*** Event handlers

    //*** Public methods

});