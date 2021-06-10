Class(function ScreenProjection(_camera) {
    Inherit(this, Component);
    var _this = this;

    var _v3 = new THREE.Vector3();
    var _v32 = new THREE.Vector3();
    var _value = new THREE.Vector3();

    //*** Constructor
    (function () {

    })();

    //*** Event handlers

    //*** Public methods
    this.set('camera', function(v) {
        _camera = v;
    });

    this.unproject = function(mouse, distance) {
        var rect = _this.rect || Stage;
        _v3.set((mouse.x / rect.width) * 2 - 1, -(mouse.y / rect.height) * 2 + 1, 0.5);
        _v3.unproject(_camera);

        var pos = _camera.position;
        _v3.sub(pos).normalize();
        var dist = distance || -pos.z / _v3.z;
        _value.copy(pos).add(_v3.multiplyScalar(dist));

        return _value;
    }

    this.project = function(pos, screen) {
        screen = screen || Stage;

        if (pos instanceof THREE.Object3D) {
            pos.updateMatrixWorld();
            _v32.set(0, 0, 0).setFromMatrixPosition(pos.matrixWorld);
        } else {
            _v32.copy(pos);
        }

        _v32.project(_camera);
        _v32.x = (_v32.x + 1) / 2 * screen.width;
        _v32.y = -(_v32.y - 1) / 2 * screen.height;

        return _v32;
    }
});