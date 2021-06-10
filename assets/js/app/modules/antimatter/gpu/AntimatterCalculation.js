Class(function AntimatterCalculation() {
    Inherit(this, Component);
    var _this, _gpuGeom, _renderer, _size;
    var _scene, _mesh, _camera, _copy, _geometry;

    var _frames = 0;
    var _output = {type: 't', value: null};
    var _callbacks = [];

    this.passes = [];

    function initPasses() {
        _camera = new THREE.OrthographicCamera(_size / - 2, _size / 2, _size / 2, _size / - 2, 1, 1000);
        _geometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);

        _scene = new THREE.Scene();

        _mesh = new THREE.Mesh(_geometry, new THREE.MeshBasicMaterial());
        _scene.add(_mesh);

        var copyShader = AntimatterCalculation.getCopyShader();
        _copy = new THREE.Mesh(_geometry, copyShader.material);
        _scene.add(_copy);
        _copy.visible = false;
    }

    function copy(input, output) {
        _copy.visible = true;
        _mesh.visible = false;
        _copy.material.uniforms.tDiffuse.value = input;
        _renderer.render(_scene, _camera, output);
        _copy.visible = false;
        _mesh.visible = true;
    }

    function postRender(callback) {
        _callbacks.push(callback);
    }

    //*** Event handlers

    //*** Public methods
    this.init = function(geometry, renderer, size) {
        _this = this;

        _gpuGeom = geometry.attributes.position.array;
        _renderer = renderer;
        _size = size;

        initPasses();
    }

    this.addPass = function(pass, index) {
        _this = this;

        var add = function(pass, index) {
            if (typeof index == 'number') {
                _this.passes.splice(index, 0, pass);
                return;
            }
            _this.passes.push(pass);
        }

        if (_this.passes.length) add(pass, index);
        else postRender(function() {
            add(pass, index);
        });
    }

    this.findPass = function(name) {
        for (var i = 0; i < _this.passes.length; i++) {
            var pass = _this.passes[i];
            if (pass.name == name) return pass;
        }
    }

    this.removePass = function(pass) {
        _this = this;

        if (typeof pass == 'number') {
            _this.passes.splice(pass);
        } else {
            _this.passes.remove(pass);
        }
    }

    this.update = function() {
        _this = this;

        if (!_this.mesh) return;// console.warn('Trying to calculate Antimatter before generating Mesh');

        var output = _output.value || _this.vertices.texture;
        for (var i = 0; i < _this.passes.length; i++) {
            var pass = _this.passes[i];
            var needsInit = !pass.init;
            var firstRender = !pass.first;
            if (needsInit) pass.initialize(_size, _this.particleCount);

            pass.first = true;

            _mesh.material = pass.shader.material;
            _mesh.material.uniforms.tInput.value = pass.lockIO ? (firstRender ? pass.origin || _this.vertices.texture : pass.output) : output;

            _mesh.material.uniforms.tValues.value = firstRender ? (i == _this.passes.length-1 || (pass.origin ? pass.origin.texture || pass.origin || _this.vertices.texture : null)) : pass.output;
            _mesh.material.uniforms.tPrev.value = firstRender ? (i == _this.passes.length-1 ? _this.vertices.texture : null) : pass.getRead();

            _mesh.material.uniforms.time.value = Render.TIME;

            var rt = firstRender ? pass.getRT(0) : pass.getWrite();
            output = pass.output;
            _renderer.render(_scene, _camera, rt);
            copy(rt, output);

            if (firstRender) {
                copy(rt, pass.getRT(1));
                copy(rt, pass.getRT(2));
                pass.setRead(2);
                pass.setWrite(1);
                if (i == 0 && _this.passes.length > 1) return;
            } else {
                pass.swap();
            }
        }

        if (!output) return;
        _output.value = output;
        _this.mesh.material.uniforms.tPos = _output;

        if (_callbacks.length) {
            _callbacks.forEach(function(c) {
                c();
            });
            _callbacks.length = 0;
        }
    }

    this.onDestroy = function() {
        _geometry.dispose();
        _this.vertices.destroy();

        _this.passes.forEach(function (pass) {
            pass.first = false;
            if (!_this.persistPasses) pass && pass.destroy && pass.destroy();
        });

        _this.mesh.material.dispose();
        _this.mesh.geometry.dispose();
    }

    this.getOutput = function() {
        return _output;
    }
}, function() {
    var _shader;
    AntimatterCalculation.getCopyShader = function() {
        if (!_shader) {
            _shader = new Shader('AntimatterCopy', 'AntimatterCopy');
            _shader.uniforms = {
                tDiffuse: {type: 't', value: null}
            };
        }

        return _shader;
    }
});