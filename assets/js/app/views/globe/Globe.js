Class(function Globe() {
    Inherit(this, Object3D);
    const _this = this;

    //*** Constructor
    (function () {
        initMesh();
    })();

    function initMesh() {
        let geom = new THREE.IcosahedronBufferGeometry(1.5, 3);
        let shader = _this.initClass(Shader, 'Globe', {
            tRefl: {value: Utils3D.getEquiRect('assets/images/common/reflection.jpg')},
        });

        let mesh = new THREE.Mesh(geom, shader.material);
        mesh.frustumCulled = false;
        mesh.scale.setScalar(Global.SCALE);
        FX.Globe.instance().addObject(mesh);

        _this.events.sub(RenderGL, RenderGL.RENDER, _ => {
            mesh.quaternion.copy(World.CAMERA.quaternion);
            mesh.position.copy(World.POSITION);
        });
    }

    //*** Event handlers

    //*** Public methods

});