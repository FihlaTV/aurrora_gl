Class(function IslandSnow(_flat) {
    Inherit(this, Object3D);
    const _this = this;

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {
        let geom = getGeom();
        let shader = _this.initClass(Shader, 'IslandSnow', {
            tMask: {value: Utils3D.getTexture('assets/images/snow/mask.jpg')},
            tNormal: {value: Utils3D.getRepeatTexture('assets/images/snow/normal.jpg')},
            tNoise: {value: Utils3D.getRepeatTexture('assets/images/snow/noise.jpg')},
            tDiffuse: {value: Utils3D.getRepeatTexture('assets/images/snow/diffuse.jpg')},
            tCube: {value: Utils3D.getCubemap('assets/images/snow/reflect.jpg')},
            tSky: FX.Atmosphere.sky.texture,
            tAurora: FX.Atmosphere.aurora.texture,
            uTime: World.TIME,
            uAtmosphereBlend: {value: 0.5},
            uAuroraStrength: {value: 0.5},
        });
        let mesh = new THREE.Mesh(geom, shader.material);
        _this.add(mesh);
        ShaderUIL.add(shader);
        FX.SSAO.instance().addObject(mesh);
    }

    function getGeom() {
        let geom = new THREE.PlaneBufferGeometry(2, 2, 40, 40);
        geom.rotateX(Math.radians(-90));

        let position = geom.attributes.position.array;
        let count = position.length / 3;
        for (let i = 0; i < count; i++) {
            let x = position[i * 3 + 0];
            let y = position[i * 3 + 1];
            let z = position[i * 3 + 2];
            let s = 2;

            let noise = Math.range(Noise.simplex3(x*s, y*s, z*s), -1.0, 1.0, 0.0, 1.0);
            y += 0.4 * noise * (_flat ? 0.5 : 1);

            position[i * 3 + 1] = y;
        }

        geom.computeFaceNormals();
        geom.computeVertexNormals();

        return geom;
    }

    //*** Event handlers

    //*** Public methods

});