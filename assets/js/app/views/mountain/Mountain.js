Class(function Mountain() {
    Inherit(this, Object3D);
    const _this = this;
    var _mesh;

    //*** Constructor
    (function () {
        initMesh();
    })();

    async function initMesh() {
        let geom = Utils3D.loadBufferGeometry('geometry/plane');
        let shader = _this.initClass(Shader, 'Mountain', {
            tMask: {value: Utils3D.getTexture('assets/images/mountain/mask.jpg')},
            tDiffuse: {value: Utils3D.getRepeatTexture('assets/images/mountain/diffuse.jpg')},
            tNormal: {value: Utils3D.getRepeatTexture('assets/images/mountain/normal.jpg')},
            tNoise: {value: Utils3D.getRepeatTexture('assets/images/snow/noise.jpg')},
            tSnow: {value: Utils3D.getRepeatTexture('assets/images/snow/diffuse.jpg')},
            tSnowNormal: {value: Utils3D.getRepeatTexture('assets/images/snow/normal.jpg')},
            tSnowCube: {value: Utils3D.getCubemap('assets/images/snow/reflect.jpg')},
            uColor0: {value: new THREE.Color()},
            uColor1: {value: new THREE.Color()},
            tSky: FX.Atmosphere.sky.texture,
            tAurora: FX.Atmosphere.aurora.texture,
            uAtmosphereBlend: {value: 0.5},
            uAuroraStrength: {value: 0.5},
            receiveLight: true
        });

        shader.lights.push(World.LIGHT);
        let mesh = new THREE.Mesh(geom, shader.material);
        _mesh = mesh;
        _this.add(mesh);

        ShaderUIL.add(shader);
        
        FX.SSAO.instance().addObject(mesh);

        // let occlusion = _this.initClass(Shader, 'Mountain', 'MountainOcclusion', {
        //     tMask: {value: Utils3D.getTexture('assets/images/mountain/mask.jpg')},
        //     receiveLight: true,
        //     side: THREE.DoubleSide
        // });
        // occlusion.lights.push(World.LIGHT);
        // let oclMesh = new THREE.Mesh(geom, occlusion.material);
        // FX.Crystals.instance().add(oclMesh);
        //
        // await _this.wait(100);
        // oclMesh.matrixAutoUpdate = false;
        // _this.group.updateMatrixWorld();
        // oclMesh.matrixWorld.copy(_this.group.matrixWorld);

    }

});