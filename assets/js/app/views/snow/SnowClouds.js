Class(function SnowClouds() {
    Inherit(this, Object3D);
    const _this = this;

    const COUNT = 200;

    //*** Constructor
    (function () {
        initGeometry();
    })();

    function initGeometry() {
        let plane = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry(0.4, 0.4));
        let geom = new THREE.InstancedBufferGeometry();
        for (let key in plane.attributes) {
            geom.addAttribute(key, plane.attributes[key]);
        }

        let position = new Float32Array(COUNT * 3);
        let attribs = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
            position[i * 3 + 0] = Math.random(-0.6, 0.6, 4);
            position[i * 3 + 1] = Math.random(0.9, 1.1, 4);
            position[i * 3 + 2] = Math.random(-0.6, 0.6, 4);

            attribs[i * 3 + 0] = Math.random(0, 1, 4);
            attribs[i * 3 + 1] = Math.random(0, 1, 4);
            attribs[i * 3 + 2] = Math.random(0, 1, 4);
        }

        geom.addAttribute('offset', new THREE.InstancedBufferAttribute(position, 3, 1));
        geom.addAttribute('attribs', new THREE.InstancedBufferAttribute(attribs, 3, 1));

        initMesh(geom);
    }

    function initMesh(geom) {
        let shader = _this.initClass(Shader, 'SnowClouds', {
            uQuaternion: {value: new Vector4()},
            tMap: {value: Utils3D.getTexture('assets/images/snow/cloud.jpg')},
            uTime: World.TIME,
            transparent: true,
            depthWrite: false,
            receiveLight: true,
        });
        shader.lights.push(World.LIGHT);
        let mesh = new THREE.Mesh(geom, shader.material);
        _this.add(mesh);

        _this.startRender(_ => {
            shader.uniforms.uQuaternion.value.set(
                World.CAMERA.quaternion.x,
                World.CAMERA.quaternion.y,
                World.CAMERA.quaternion.z,
                World.CAMERA.quaternion.w,
            );
        });
    }

    //*** Event handlers

    //*** Public methods

});