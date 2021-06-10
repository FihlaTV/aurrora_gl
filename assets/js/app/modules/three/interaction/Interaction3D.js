Class(function Interaction3D(_camera) {
    Inherit(this, Component);
    const _this = this;
    let _hover, _click;

    _camera = _camera || World.CAMERA;
    let _ray = _this.initClass(Raycaster, _camera);

    let _meshes = [];
    const _event = {};

    this.cursor = 'auto';

    (function() {
        addHandlers();
        _this.enabled = true;
    })();

    function parseMeshes(meshes) {
        if (meshes.length === undefined) meshes = [meshes];
        let output = [];
        meshes.forEach(checkMesh);
        function checkMesh(obj) {
            if (obj.type = 'Mesh' && obj.isHitMesh) {
                obj.mouseEnabled = function(visible) {
                    if (visible) {
                        if (!~_meshes.indexOf(obj)) _meshes.push(obj);
                    } else {
                        _meshes.remove(obj);
                    }
                };
                output.push(obj);
            }
            if (obj.children.length) obj.children.forEach(checkMesh);
        }
        return output;
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.sub(Mouse.input, Interaction.START, start);
        _this.events.sub(Mouse.input, Interaction.MOVE, move);
        _this.events.sub(Mouse.input, Interaction.CLICK, click);
    }

    function start() {
        if (!_this.enabled) return;
        let hit = move();
        if (hit) {
            _click = hit.object;
            _click.time = Render.TIME;
        } else {
            _click = null;
        }
    }

    function move() {
        if (!_this.enabled) {
            Stage.css('cursor', _this.cursor);
            return;
        }
        let hit = _ray.checkHit(_meshes)[0];

        if (hit) {
            let mesh = hit.object;
            if (_hover !== mesh) {
                if (_hover) triggerHover('out', _hover);

                _hover = mesh;
                triggerHover('over', _hover);

                Stage.css('cursor', 'pointer');
            }
            return hit;
        } else {
            if (_hover) {
                triggerHover('out', _hover);
                _hover = null;
                Stage.css('cursor', _this.cursor);
            }
            return false;
        }
    }

    function click() {
        if (!_this.enabled) return;
        if (!_click) return;
        let hit = _ray.checkHit(_meshes, Mouse)[0];
        if (hit && hit.object === _click) {
            triggerClick(_click);
        }
        _click = null;
    }

    function triggerHover(action, mesh) {
        _event.action = action;
        _event.mesh = mesh;
        _this.events.fire(Interaction3D.HOVER, _event, true);
        _hover.__hoverCallback && _hover.__hoverCallback(_event);
    }

    function triggerClick(mesh) {
        _event.action = 'click';
        _event.mesh = mesh;
        _this.events.fire(Interaction3D.CLICK, _event, true);
        _click.__clickCallback && _click.__clickCallback(_event);
    }

    //*** Public methods
    this.set('camera', c => {
        _ray.camera = c;
    });

    this.add = function(meshes, hover, click, isParse) {
        if (meshes.length === undefined || isParse) meshes = parseMeshes(meshes);

        meshes.forEach(mesh => {
            if (hover) mesh.__hoverCallback = hover;
            if (click) mesh.__clickCallback = click;
            _meshes.push(mesh);
        });
    };

    this.remove = function(meshes, isParse) {
        if (meshes.length === undefined || isParse) meshes = parseMeshes(meshes);
        meshes.forEach(mesh => {
            if (_hover == mesh)
                for (let i = _meshes.length - 1; i >= 0; i--) {
                    if (mesh === _meshes[i]) _meshes.splice(i, 1);
                }
        });
    };

    this.set('testVisibility', v => _ray.testVisibility = v);


}, () => {
    Interaction3D.HOVER = 'interaction3d_hover';
    Interaction3D.CLICK = 'interaction3d_click';
});