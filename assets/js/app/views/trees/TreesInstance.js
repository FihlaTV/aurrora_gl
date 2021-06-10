Class(function TreesInstance(_index) {
    Inherit(this, Object3D);
    const _this = this;

    const COUNT = 30;

    //*** Constructor
    (function () {
        initGeom();
    })();

    function initGeom() {
        let geom = Utils3D.loadBufferGeometry('geometry/tree'+_index);
        let s = 0.06;
        geom.translate(0, 0.5, 0);
        geom.scale(s, s, s);

        initInstance(geom);
    }

    function initInstance(shape) {
        let geom = new THREE.InstancedBufferGeometry();
        for (var key in shape.attributes) {
            geom.addAttribute(key, shape.attributes[key]);
        }

        let v3 = new Vector3();
        let position = new Float32Array(COUNT * 3);
        let attribs = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
            v3.set(Math.random(-100, 100), 0, Math.random(-100, 100)).normalize().multiplyScalar(Math.random(0.6, 0.75, 4));
            position[i * 3 + 0] = v3.x;
            position[i * 3 + 1] = 0;
            position[i * 3 + 2] = v3.z;

            let x = position[i * 3 + 0];
            let y = position[i * 3 + 1];
            let z = position[i * 3 + 2];
            let s = 2;

            let noise = Math.range(Noise.simplex3(v3.x*s, v3.y*s, v3.z*s), -1.0, 1.0, 0.0, 1.0);
            position[i * 3 + 1] = 0.05 * noise;

            attribs[i * 3 + 0] = Math.random(0, 1, 4);
            attribs[i * 3 + 1] = Math.random(0, 1, 4);
            attribs[i * 3 + 2] = Math.random(0, 1, 4);
        }

        geom.addAttribute('offset', new THREE.InstancedBufferAttribute(position, 3, 1));
        geom.addAttribute('attribs', new THREE.InstancedBufferAttribute(attribs, 3, 1));

        initMesh(geom);
    }

    function initMesh(geom) {
        let shader = _this.initClass(Shader, 'Trees', {
            tMask: {value: Utils3D.getTexture('assets/images/trees/mask.jpg')},
            tDiffuse: {value: Utils3D.getRepeatTexture('assets/images/trees/diffuse.jpg')},
            tNoise: {value: Utils3D.getRepeatTexture('assets/images/snow/noise.jpg')},
            tSnow: {value: Utils3D.getRepeatTexture('assets/images/snow/diffuse.jpg')},
            tSnowNormal: {value: Utils3D.getRepeatTexture('assets/images/snow/normal.jpg')},
            tSnowCube: {value: Utils3D.getCubemap('assets/images/snow/reflect.jpg')},
            uColor0: {value: new THREE.Color(0x384136)},
            uColor1: {value: new THREE.Color(0x91F856)},
            uAtmosphereBlend: {value: 0.5},
            uAuroraStrength: {value: 0.5},
            tSky: FX.Atmosphere.sky.texture,
            tAurora: FX.Atmosphere.aurora.texture,
            unique: 't_'+_index,
            receiveLight: true
        });
        shader.lights.push(World.LIGHT);

        let mesh = new THREE.Mesh(geom, shader.material);
        mesh.frustumCulled = false;
        _this.add(mesh);

        ShaderUIL.add(shader);
        FX.SSAO.instance().addObject(mesh);
    }

    //*** Event handlers

    //*** Public methods

});