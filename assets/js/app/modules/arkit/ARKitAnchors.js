Class(function ARKitAnchors(_scene) {
    Inherit(this, Component);
    const _this = this;
    var _plane, _material;

    var _anchors = {};

    this.planes = [];
    this.group = new THREE.Group();

    //*** Constructor
    (function () {
        AssetLoader.waitForLib('THREE', initGeometry);
        _this.group.visible = false;
        _scene.add(_this.group);
        addListeners();
    })();

    function initGeometry() {
        _plane = new THREE.PlaneBufferGeometry(1, 1, 4, 4);
        _plane.rotateX(Math.radians(-90));
        _material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
    }

    function updateTransform(mesh, transform) {
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorld.fromArray(transform);
        mesh.matrixWorld.decompose(mesh.position, mesh.quaternion, mesh.scale);
    }

    //*** Event handlers
    function addListeners() {
        AURA.addAnchor = addAnchor;
        AURA.removeAnchor = removeAnchor;
        AURA.updateAnchor = updateAnchor;
    }

    function updateAnchor(id, transform) {
        let mesh = _anchors[id];
        updateTransform(mesh, transform);
    }

    function addAnchor(id, transform) {
        let mesh = new THREE.Mesh(_plane, _material);
        _anchors[id] = mesh;
        _this.planes.push(mesh);
        _this.group.add(mesh);
        updateTransform(mesh, transform);
    }

    function removeAnchor(id, transform) {
        let mesh = _anchors[id];
        _this.group.remove(mesh);
        _this.planes.remove(mesh);
    }

    //*** Public methods
    this.set('debug', v => {
        _this.group.visible = v;
    });

    this.get('debug', () => {
        return _this.group.visible;
    });
});