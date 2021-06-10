Class(function Crystals() {
    Inherit(this, Object3D);
    const _this = this;

    //*** Constructor
    (function () {
        initMesh();
    })();

    async function initMesh() {
        let geom = Utils3D.loadBufferGeometry('geometry/crystals');
        let shader = _this.initClass(Shader, 'Crystals', {
            tNormal: {value: Utils3D.getTexture('assets/images/crystal/normal.jpg')},
            tRough: {value: Utils3D.getTexture('assets/images/crystal/roughness.jpg')},
        });
        let mesh = new THREE.Mesh(geom, shader.material);

        FX.Crystals.instance().add(mesh);

        await _this.wait(100);
        mesh.matrixAutoUpdate = false;
        _this.group.updateMatrixWorld();
        mesh.matrixWorld.copy(_this.group.matrixWorld);
    }

    //*** Event handlers

    //*** Public methods

});