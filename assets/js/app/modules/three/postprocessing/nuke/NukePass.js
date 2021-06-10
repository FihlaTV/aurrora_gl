Class(function NukePass(_fs, _uniforms, _pass) {
    Inherit(this, Component);
    var _this = this;

    this.UILPrefix = typeof _fs == 'string' ? _fs : Utils.getConstructorName(_fs);

    function prefix(code) {
        if (!code) throw `No shader ${_fs} found`;
        let pre = '';
        pre += 'precision highp float;\n';
        pre += 'precision highp int;\n';

        if (!code.includes('uniform sampler2D tDiffuse')) {
            pre += 'uniform sampler2D tDiffuse;\n';
            pre += 'varying vec2 vUv;\n';
        }

        code = pre + code;

        return code;
    }

    function getVS() {
        return `
        precision highp float;
        precision highp int;

        varying vec2 vUv;

        attribute vec2 uv;
        attribute vec3 position;

        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
        `;
    }

    //*** Public methods
    this.init = function(fs) {
        if (_this.pass) return;
        _this = this;

        let name = fs || this.constructor.toString().match(/function ([^\(]+)/)[1];
        let fragmentShader = Array.isArray(fs) ? fs.join('') : null;

        _this.uniforms = _uniforms || {};
        _this.uniforms.tDiffuse = {type: 't', value: null};

        if (_this.uniforms.unique) _this.UILPrefix += '_' + _this.uniforms.unique + '_';

        if (window.UILStorage) {
            for (let key in _this.uniforms) {
                if (key === 'unique') continue;
                _this.uniforms[key] = UILStorage.parse(_this.UILPrefix + key) || _this.uniforms[key];
            }
        }

        _this.pass = new THREE.RawShaderMaterial({
            uniforms: _this.uniforms,
            vertexShader: getVS(),
            fragmentShader: fragmentShader || prefix(Shaders.getShader(name + '.fs'))
        });

        _this.uniforms = _this.pass.uniforms;
    };

    this.set = function(key, value) {
        TweenManager.clearTween(_this.uniforms[key]);
        this.uniforms[key].value = value;
    };

    this.tween = function(key, value, time, ease, delay, callback, update) {
        tween(_this.uniforms[key], {value: value}, time, ease, delay, callback, update);
    };

    this.clone = function() {
        if (!_this.pass) _this.init(_fs);
        return new NukePass(null, null, _this.pass.clone());
    }

    if (typeof _fs === 'string') {
        _this.init(_fs);
    } else if (_pass) {
        _this.pass = _pass;
        _this.uniforms = _pass.uniforms;
    }
});