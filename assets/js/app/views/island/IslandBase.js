Class(function IslandBase() {
    Inherit(this, Object3D);
    const _this = this;

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {
        let geom = Utils3D.loadBufferGeometry('geometry/island');
        let shader = _this.initClass(Shader, 'IslandBase', {
            tSoil0: {value: Utils3D.getRepeatTexture('assets/images/soil/diffuse0.jpg')},
            tSoil1: {value: Utils3D.getRepeatTexture('assets/images/soil/diffuse1.jpg')},
            tSoilNormal0: {value: Utils3D.getRepeatTexture('assets/images/soil/normal0.jpg')},
            tSoilNormal1: {value: Utils3D.getRepeatTexture('assets/images/soil/normal1.jpg')},
            tIceNormal: {value: Utils3D.getRepeatTexture('assets/images/ice/normal.jpg')},
            tIceRef: {value: Utils3D.getRepeatTexture('assets/images/ice/reflect.jpg')},
            uSoilColor0: {value: new THREE.Color()},
            uSoilColor1: {value: new THREE.Color()},
            uMagma0: {value: new THREE.Color()},
            uMagma1: {value: new THREE.Color()},
            uResolution: World.RESOLUTION,
            tSky: FX.Atmosphere.sky.texture,
            uAtmosphereBlend: {value: 0.2},
            receiveLight: true
        });

        shader.lights.push(World.LIGHT);

        ShaderUIL.add(shader);

        let mesh = new THREE.Mesh(geom, shader.material);
        _this.add(mesh);
        FX.SSAO.instance().addObject(mesh);
    }

    //*** Event handlers

    //*** Public methods

});