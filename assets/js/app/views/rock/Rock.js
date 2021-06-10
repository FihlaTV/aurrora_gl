Class(function Rock(_index) {
    Inherit(this, Object3D);
    const _this = this;

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {
        let geom = Utils3D.loadBufferGeometry('geometry/rock'+_index);
        let shader = _this.initClass(Shader, 'Rock', {
            tDiffuse: {value: Utils3D.getRepeatTexture('assets/images/trees/diffuse.jpg')},
            tNoise: {value: Utils3D.getRepeatTexture('assets/images/snow/noise.jpg')},
            tSnow: {value: Utils3D.getRepeatTexture('assets/images/snow/diffuse.jpg')},
            tSnowNormal: {value: Utils3D.getRepeatTexture('assets/images/snow/normal.jpg')},
            tSnowCube: {value: Utils3D.getCubemap('assets/images/snow/reflect.jpg')},
            uColor0: {value: new THREE.Color(0x686963)},
            uColor1: {value: new THREE.Color(0xD7D5C7)},
            unique: 'rock_'+_index,
            receiveLight: true
        });
        shader.lights.push(World.LIGHT);
        let mesh = new THREE.Mesh(geom, shader.material);
        _this.add(mesh);
        ShaderUIL.add(shader);
    }

    //*** Event handlers

    //*** Public methods

});