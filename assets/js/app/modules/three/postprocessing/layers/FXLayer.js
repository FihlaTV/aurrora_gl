Class(function FXLayer(_parentNuke, _type) {
    Inherit(this, Component);
    var _this = this;
    var _nuke, _rt;

    var _scene = new THREE.Scene();
    var _objects = [];
    var _rts = {};
    var _textureIndex = -1;

    var _id = Utils.timestamp();
    var _name = Utils.getConstructorName(_this);
    var _useDrawBuffers = true;

    this.resolution = 1;
    this.autoVisible = true;
    this.enabled = true;

    function editShader(mesh) {
        let modifyShader = (shader, name) => {
            let _ = shader.material;
            let fs = shader.fragmentShader;
            let marker = '#drawbuffer '+name;
            if (fs.includes(marker)) {
                let split = fs.split(marker+' ');
                fs = split[0] + split[1];
            }

            while (fs.includes('#drawbuffer')) {
                fs = fs.split('\n');
                for (let i = 0; i < fs.length; i++) {
                    if (fs[i].includes('#drawbuffer')) fs[i] = '';
                }
                fs = fs.join('\n');
            }

            shader.fragmentShader = shader.material.fragmentShader = fs;
        };

        let shader = mesh.material.shader.clone();
        for (let key in mesh.material.uniforms) {
            shader.uniforms[key] = mesh.material.uniforms[key];
        }

        modifyShader(mesh.material.shader, 'Color');
        modifyShader(shader, _this.name || _name);

        mesh.material = shader.material;
    }

    function editDBShader(mesh) {
        let modifyMarker = (fs, name, index) => {
            let marker = '#drawbuffer '+name;
            if (fs.includes(marker)) {
                let split = fs.split(marker+' ');
                split[1] = split[1].replace('gl_FragColor', `gl_FragData[${index}]`);
                fs = split[0] + split[1];
            }

            return fs;
        };

        let shader = mesh.material.shader;
        let fs = shader.fragmentShader;

        fs = modifyMarker(fs, 'Color', 0);
        fs = modifyMarker(fs, _this.name || _name, _textureIndex);

        shader.fragmentShader = shader.material.fragmentShader = fs;
    }

    //*** Event handlers
    function addListeners() {
        _this.events.sub(Events.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        _rt.setSize && _rt.setSize(_nuke.stage.width * _this.resolution * _nuke.dpr, _nuke.stage.height * _this.resolution * _nuke.dpr);
    }

    function initRT() {
        if (_useDrawBuffers) {
            let texture = new THREE.Texture();
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBAFormat;
            if (!!_this.rtType) texture.type = _this.rtType;
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            _textureIndex = _parentNuke.attachDrawBuffer(texture);
            _rt = {texture};
        } else {
            _rt = Utils3D.createRT(_nuke.stage.width * _this.resolution * _nuke.dpr, _nuke.stage.height * _this.resolution * _nuke.dpr, _this.rtType);
        }
        _this.rt = _rt;
    }

    function updateTopParent(obj) {
        var parent = obj.parent;
        while (parent) {
            parent.updateMatrixWorld();
            parent = parent.parent;
        }
    }

    //*** Public methods
    this.create = function(nuke, type) {
        if (!nuke) return;
        if (!!type) _this.rtType = type;
        _useDrawBuffers = nuke.useDrawBuffers;
        _this = this;
        _this.scene = _scene;
        _nuke = _this.initClass(Nuke, nuke.stage, {renderer: nuke.renderer, camera: nuke.camera, scene: _scene, dpr: nuke.dpr, useDrawBuffers: false});
        _nuke.parentNuke = nuke;
        _parentNuke = nuke;
        _this.nuke = _nuke;
        initRT();
        addListeners();
    }

    this.addObject = this.add = function(object) {
        if (!_nuke) return;
        if (!_useDrawBuffers) {
            var clone = object.clone();
            object['clone_' + _id] = clone;
            _scene.add(clone);
            _objects.push(object);
            editShader(clone);
        } else {
            editDBShader(object);
        }
        return clone;
    }

    this.removeObject = function(object) {
        if (!_nuke) return;
        _scene.remove(object['clone_' + _id]);
        _objects.remove(object);
        delete object['clone_' + _id];
    }

    this.render = this.draw = function(stage, camera) {
        if (!_nuke || !_this.enabled || _useDrawBuffers) return;
        if (!_parentNuke.enabled || !_objects.length) return;

        if (stage) {
            _nuke.stage = stage;
            _this.setSize(stage.width, stage.height);
        }

        if (camera) {
            _nuke.camera = camera;
        } else {
            _nuke.camera = _nuke.parentNuke.camera;
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
            if (!obj.ignoreMatrix) Utils3D.decompose(obj, clone);
        }

        _nuke.rtt = _rt;
        _nuke.render();
    }

    this.addPass = function(pass) {
        if (!_nuke) return;
        _nuke.add(pass);
    }

    this.removePass = function(pass) {
        if (!_nuke) return;
        _nuke.remove(pass);
    }

    this.setSize = function(width, height) {
        if (!_nuke) return;
        if (_rt.width == width && _rt.height == height) return;
        _this.events.unsub(Events.RESIZE, resizeHandler);
        _rt && _rt.setSize(width * _this.resolution * _nuke.dpr, height * _this.resolution * _nuke.dpr);
        _nuke.setSize(width * _this.resolution * _nuke.dpr, height * _this.resolution * _nuke.dpr);
    }

    this.setDPR = function(dpr) {
        if (!_nuke) return;
        _nuke.dpr = dpr;
        resizeHandler();
    }

    this.getObjects = function() {
        return _objects;
    }

    if (_parentNuke instanceof Nuke) this.create(_parentNuke, _type);
});

Namespace('FX');