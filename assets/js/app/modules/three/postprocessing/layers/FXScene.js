Class(function FXScene(_parentNuke, _type) {
    Inherit(this, Component);
    var _this = this;
    var _nuke, _rt;

    var _scene = new THREE.Scene();
    var _id = Utils.timestamp();
    var _objects = [];

    this.resolution = 1;
    this.autoVisible = true;
    this.enabled = true;
    this.scene = _scene;

    //*** Constructor
    (function () {

    })();

    function initRT() {
        _rt = Utils3D.createRT(_nuke.stage.width * _this.resolution * _nuke.dpr, _nuke.stage.height * _this.resolution * _nuke.dpr, _this.rtType);
        _this.rt = _rt;
    }

    //*** Event handlers
    function addListeners() {
        _this.events.sub(Events.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        _rt.setSize && _rt.setSize(_nuke.stage.width * _this.resolution * _nuke.dpr, _nuke.stage.height * _this.resolution * _nuke.dpr);
    }

    //*** Public methods
    this.create = function(nuke) {
        _this = this;
        _this.scene = _scene;
        _this.nuke = _nuke = _this.initClass(Nuke, nuke.stage, {renderer: nuke.renderer, camera: nuke.camera, scene: _scene, dpr: nuke.dpr, useDrawBuffers: false});
        initRT();
        addListeners();
    }

    this.setSize = function(width, height) {
        if (!_nuke) return;
        if (_rt.width == width && _rt.height == height) return;
        _this.events.unsub(Events.RESIZE, resizeHandler);
        _rt && _rt.setSize(width * _this.resolution * _nuke.dpr, height * _this.resolution * _nuke.dpr);
        _nuke.setSize(width * _this.resolution * _nuke.dpr, height * _this.resolution * _nuke.dpr);
    }

    this.addObject = function(object) {
        let clone = object.clone();
        object['clone_' + _id] = clone;
        _scene.add(clone);
        _objects.push(object);
        return clone;
    }

    this.removeObject = function(object) {
        _scene.remove(object['clone_' + _id]);
        _objects.remove(object);
        delete object['clone_' + _id];
    }

    this.render = this.draw = function() {
        var clearColor = null;
        var alpha = 1;
        if (_this.clearColor) {
            clearColor = _nuke.renderer.getClearColor().getHex();
            _nuke.renderer.setClearColor(_this.clearColor);
        }

        if (_this.clearAlpha > -1) {
            alpha = _nuke.renderer.getClearAlpha();
            _nuke.renderer.setClearAlpha(_this.clearAlpha);
        }

        for (var i = _objects.length-1; i > -1; i--) {
            var obj = _objects[i];
            var clone = obj['clone_' + _id];

            if (_this.autoVisible) {
                clone.visible = true;

                var parent = obj;
                while (parent) {
                    if (parent.visible == false || (parent.material && parent.material.visible == false)) {
                        clone.visible = false;
                    }
                    parent = parent.parent;
                }
            }

            if (_this.forceRender) {
                clone.material.visible = true;
            }

            // updateTopParent(obj);
            obj.updateMatrixWorld();
            if (!obj.ignoreMatrix) {
                Utils3D.decompose(obj, clone);
                if (clone.overrideScale) clone.scale.setScalar(clone.overrideScale);
            }
        }

        _nuke.rtt = _rt;
        _nuke.render();

        if (_this.clearColor) {
            _nuke.renderer.setClearColor(clearColor);
        }

        if (_this.clearAlpha > -1) {
            _nuke.renderer.setClearAlpha(_this.clearAlpha);
        }
    }

    this.setDPR = function(dpr) {
        if (!_nuke) return;
        _nuke.dpr = dpr;
        resizeHandler();
    }

    if (_parentNuke instanceof Nuke) this.create(_parentNuke, _type);
});