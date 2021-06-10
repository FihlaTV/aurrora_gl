Class(function Raycaster(_camera) {
    Inherit(this, Component);
    const _this = this;

    let _mouse = new THREE.Vector3();
    let _raycaster = new THREE.Raycaster();
    let _debug = null;

    this.testVisibility = true;

    //*** Constructor
    (function () {

    })();

    function ascSort( a, b ) {
        return a.distance - b.distance;
    }

    function intersectObject( object, raycaster, intersects, recursive ) {
        if (_this.testVisibility) {
            if (object.visible === false) return;
            let parent = object.parent;
            while (parent) {
                if (parent.visible === false) return;
                parent = parent.parent
            }
        }

        if (!object.raycast) return;
        object.raycast( raycaster, intersects );
        if ( recursive === true ) {
            let children = object.children;
            for ( let i = 0, l = children.length; i < l; i ++ ) {
                intersectObject( children[ i ], raycaster, intersects, true );
            }
        }
    }

    function intersect(objects) {
        if (!Array.isArray(objects)) objects = [objects];
        let intersects = [];
        objects.forEach(object => {
            intersectObject( object, _raycaster, intersects, false );
        });
        intersects.sort( ascSort );
        if (_debug) updateDebug();
        return intersects;
    }

    function updateDebug() {
        let vertices = _debug.geometry.vertices;

        vertices[0].copy(_raycaster.ray.origin.clone());
        vertices[1].copy(_raycaster.ray.origin.clone().add(_raycaster.ray.direction.clone().multiplyScalar(10000)));

        _debug.geometry.verticesNeedUpdate = true;
    }

    //*** Event handlers

    //*** Public methods
    this.set('camera', function(camera) {
        _camera = camera;
    });

    this.set('pointsThreshold', function (value) {
        _raycaster.params.Points.threshold = value;
    });

    this.get('ray', () => {
        return _raycaster.ray;
    });

    this.debug = function(scene) {
        let geom = new THREE.Geometry();
        geom.vertices.push(new THREE.Vector3(-100, 0, 0));
        geom.vertices.push(new THREE.Vector3(100, 0, 0));

        let mat = new THREE.LineBasicMaterial({color: 0xff0000});
        _debug = new THREE.Line(geom, mat);
        scene.add(_debug);
    };

    this.checkHit = function(objects, mouse) {
        mouse = mouse || Mouse;

        let rect = _this.rect || Stage;

        if (mouse === Mouse && rect === Stage) {
            _mouse.copy(Mouse.tilt);
        } else {
            _mouse.x = (mouse.x / rect.width) * 2 - 1;
            _mouse.y = -(mouse.y / rect.height) * 2 + 1;
        }

        _raycaster.setFromCamera(_mouse, _camera);

        return intersect(objects);
    };

    this.checkFromValues = function(objects, origin, direction) {
        _raycaster.set(origin, direction, 0, Number.POSITIVE_INFINITY);

        return intersect(objects);
    };
});