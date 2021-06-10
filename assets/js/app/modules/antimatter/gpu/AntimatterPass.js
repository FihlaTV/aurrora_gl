Class(function AntimatterPass(_shader, _uni, _clone) {
    var _this = this;

    this.UILPrefix = 'antimatter_'+_shader;

    var _uniforms = {
        tInput: {type: 't', value: null},
        tPrev: {type: 't', value: null},
        tValues: {type: 't', value: null},
        time: {type: 'f', value: 0},
        fSize: {type: 'f', value: 64},
        fTotalNum: {type: 'f', value: 64},
    };

    var _rts = [];
    var _read = 0;
    var _write = 0;

    this.uniforms = _uniforms;
    this.output = initRT(64);
    this.name = _shader;
    this.id = Utils.timestamp();

    //*** Constructor
    (function () {
        if (_uni) {
            for (var key in _uni) {
                _uniforms[key] = _uni[key];
            }
        }
    })();

    function prepareShader(size) {
        var utils = Shaders.getShader('antimatter.glsl');
        var fragment = Shaders.getShader(_shader + '.fs');

        fragment = fragment.replace('@SIZE', size);

        let shader = [
            'uniform sampler2D tInput;',
            'uniform sampler2D tPrev;',
            'uniform sampler2D tValues;',
            'uniform float fSize;',
            'uniform float fTotalNum;',
            'uniform float time;',
            'vec2 getUV() { return (gl_FragCoord.xy / fSize); }',
            'bool notUsed() { return (gl_FragCoord.x * gl_FragCoord.y) > fTotalNum; }',
            utils,
            fragment
        ].join('\n');

        if (_this.onCreateShader) {
            shader = _this.onCreateShader(shader);
        }

        return shader;
    }

    function initRT(size) {
        var type = Device.system.os == 'android' ? THREE.FloatType : THREE.HalfFloatType;
        var parameters = {minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBuffer: false, type: type};
        var rt = new THREE.WebGLRenderTarget(size, size, parameters);
        rt.texture.generateMipmaps = false;
        return rt;
    }

    //*** Event handlers

    //*** Public methods
    this.addInput = function(name, attribute) {
        var uniform = (function() {
            if (typeof attribute === 'object' && !attribute.height && typeof attribute.type === 'string') return attribute;
            if (attribute instanceof AntimatterAttribute) return {type: 't', value: attribute.texture};
            return {type: 't', value: attribute};
        })();

        _uniforms[name] = uniform;
        return _uniforms[name];
    }

    this.getRT = function(index) {
        return _rts[index];
    }

    this.getRead = function() {
        return _rts[_read];
    }

    this.getWrite = function() {
        return _rts[_write];
    }

    this.setRead = function(index) {
        _read = index;
    }

    this.setWrite = function(index) {
        _write = index;
    }

    this.swap = function() {
        _write++;
        if (_write > 2) _write = 0;

        _read++;
        if (_read > 2) _read = 0;
    }

    this.initialize = function(size, num) {
        if (_this.init) return;
        _this.init = true;

        for (var i = 0; i < 3; i++) {
            _rts.push(initRT(size));
        }

        _this.output.setSize(size, size);

        _uniforms.fTotalNum.value = num;

        if (!(_shader instanceof Shader)) {
            _shader = new Shader('AntimatterPass', prepareShader(size));
            _shader.uniforms = _uniforms;
            _shader.id = Utils.timestamp();
        }
        _this.shader = _shader;
        _shader.uniforms.fSize.value = size;
    }

    this.setUniform = function(key, value) {
        if (_shader && _shader.uniforms) _shader.uniforms[key].value = value;
    }

    this.tween = function(key, value, time, ease, delay, callback, update) {
        tween(_shader.uniforms[key], {value: value}, time, ease, delay, callback, update);
    }

    this.clone = function() {
        return new AntimatterPass(_shader, _uni);
    }

    this.destroy = function() {
        _rts.forEach(function(rt) {
            rt && rt.dispose && rt.dispose();
        });
    }
});