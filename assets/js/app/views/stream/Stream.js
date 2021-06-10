Class(function Stream() {
    Inherit(this, Object3D);
    const _this = this;

    //*** Constructor
    (function () {
        initMesh();
        // initSpline();
    })();

    function initMesh() {
        let geom = Utils3D.loadBufferGeometry('geometry/stream');
        let shader = _this.initClass(Shader, 'Stream', {
            tIceNormal: {value: Utils3D.getRepeatTexture('assets/images/ice/normal.jpg')},
            tIceCube: {value: Utils3D.getCubemap('assets/images/ice/reflect.jpg')},
            uTime: World.TIME,
            receiveLight: true
        });
        shader.lights.push(World.LIGHT);
        let mesh = new THREE.Mesh(geom, shader.material);
        _this.add(mesh);
    }

    function initSpline() {
        let points = Assets.JSON['geometry/points'];
        let array = [];
        for (let i = 0; i < points.length-3; i++) array[i] = new Vector3().fromArray(points[i]);
        array[array.length-1].y -= 0.1;
        array[0].z -= 0.05;
        array[0].y -= 0.05;

        let curve = new THREE.CatmullRomCurve3(array);
        let geometry = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
        let material = new THREE.MeshNormalMaterial();
        let mesh = new THREE.Mesh(geometry, material);

        let data = Utils3D.geomToExport(new THREE.BufferGeometry().fromGeometry(geometry));
        Dev.writeFile('assets/geometry/stream.json?compress', data);

        _this.add(mesh);
    }

    //*** Event handlers

    //*** Public methods

});