/**
 * @name Shader
 * @example
 * let shader = _this.initClass(Shader, 'Background', {
 *     transparent: true,
 *     depthTest: false,
 *     uTime: World.TIME,
 *     uMouse: {value: new Vec2()},
 * };
 *
 * shader.fragmentShader = shader.fragmentShader.replace('NUM_ITER', '10.0');
 *
 * let mesh = new THREE.Mesh(geometry, shader.material);
 */

Class(function Shader(_vertexShader, _fragmentShader, _params) {
    Inherit(this, Component);
    const _this = this;
    let _material;

    this.receiveShadow = false;
    this.receiveLight = false;
    this.lights = [];
    this.persists = false;

    this.uniforms = {};
    this.properties = {};

    this.vsName = _vertexShader;
    this.fsName = _fragmentShader || _vertexShader;

    //*** Constructor
    (function () {
        if (typeof _fragmentShader !== 'string') {
            _params = _fragmentShader;
            _fragmentShader = _vertexShader;
        }

        _params = _params || {};

        // Store UIL prefix to store and retrieve uniform overrides
        _this.UILPrefix = `${_vertexShader}_${_fragmentShader}_${(_params.unique ? _params.unique + '_' : '')}`;

        parseParams();
        parseShaders();
    })();

    function parseParams() {
        for (let key in _params) {

            // Custom params
            if (key == 'useShaderMaterial') {
                _this.useShaderMaterial = _params[key];
            } else if (key == 'receiveShadow') {
                _this.receiveShadow = _params[key];
            } else if (key == 'receiveLight') {
                _this.receiveLight = _params[key];
            } else if (key == 'noAttributes') {
                _this.noAttributes = _params[key];
            } else if (key == 'defines') {
                _this.defines = _params[key];
            } else if (key == 'lights') {
                _this.lights = _params[key];

            // Add shader uniforms
            } else if (_params[key].value !== undefined) {

                // Retrieve UIL overrides if exists
                if (window.UILStorage) {
                    _this.uniforms[key] = UILStorage.parse(_this.UILPrefix + key) || _params[key];
                } else {
                    _this.uniforms[key] = _params[key];
                }

            // Add any THREEjs properties (transparent, blending etc)
            } else {
                if (key == 'unique') continue;
                _this.properties[key] = _params[key];
            }
        }
    }

    function parseShaders() {

        /**
         * @name this.vertexShader
         * @memberof Shader
         */
        _this.vertexShader = process(Shaders.getShader(_vertexShader + '.vs') || _vertexShader, 'vs');

        /**
         * @name this.fragmentShader
         * @memberof Shader
         */
        _this.fragmentShader = process(Shaders.getShader(_fragmentShader + '.fs') || _fragmentShader, 'fs');
    }

    function process(code, type) {
        let header = '';
        if (_this.useShaderMaterial || _this.receiveShadow) {
            if (type == 'fs') {
                header = [
                    'uniform mat4 modelViewMatrix;',
                ].join('\n');
            }
        } else {
            if (type == 'vs') {
                header = [
                    'precision highp float;',
                    'precision highp int;',

                    _this.noAttributes ? '' : 'attribute vec2 uv;',
                    _this.noAttributes ? '' : 'attribute vec3 position;',
                    _this.noAttributes ? '' : 'attribute vec3 normal;',

                    'uniform mat4 modelViewMatrix;',
                    'uniform mat4 projectionMatrix;',
                    'uniform mat4 modelMatrix;',
                    'uniform mat4 viewMatrix;',
                    'uniform mat3 normalMatrix;',
                    'uniform vec3 cameraPosition;',
                ].join('\n');
            } else {
                header = [
                    code.includes('samplerExternalOES') ? '#extension GL_OES_EGL_image_external : require' : '',
                    code.includes('dFdx') ? '#extension GL_OES_standard_derivatives : enable' : '',
                    code.includes(['gl_FragData', '#drawbuffer']) && World.NUKE.useDrawBuffers && !code.includes('fxlayer') ? '#extension GL_EXT_draw_buffers : require' : '',
                    'precision highp float;',
                    'precision highp int;',

                    'uniform mat4 modelViewMatrix;',
                    'uniform mat4 projectionMatrix;',
                    'uniform mat4 modelMatrix;',
                    'uniform mat4 viewMatrix;',
                    'uniform mat3 normalMatrix;',
                    'uniform vec3 cameraPosition;',
                ].join('\n');
            }
        }

        header += '\n__ACTIVE_THEORY_LIGHTS__\n\n';

        if (window.AURA) header += '#define AURA\n';

        code = header + code;

        let threeChunk = function(a, b) {
            return THREE.ShaderChunk[b] + '\n';
        };

        return code.replace(/#s?chunk\(\s?(\w+)\s?\);/g, threeChunk);
    }

    function addLightingCode() {
        let lightCode = (function() {
            if (!_this.receiveLight) return '';

            let lighting = Lighting.getLighting(_this);
            let numLights = lighting.position.length;

            if (numLights == 0) {
                if (!Shader.disableWarnings) console.warn('Lighting enabled but 0 lights added. Be sure to add them before calling shader.material');
                return '';
            }

            return [
                `#define NUM_LIGHTS ${numLights}`,
                `uniform vec3 lightPos[${numLights}];`,
                `uniform vec3 lightColor[${numLights}];`,
                `uniform float lightIntensity[${numLights}];`,
                `uniform float lightDistance[${numLights}];`,
                ``,
            ].join('\n');
        })();

        _this.vertexShader = _this.vertexShader.replaceAll('__ACTIVE_THEORY_LIGHTS__', lightCode);
        _this.fragmentShader = _this.fragmentShader.replaceAll('__ACTIVE_THEORY_LIGHTS__', lightCode);
    }

    function updateMaterialLight(lighting) {
        _material.uniforms.lightPos = {type: 'v3v', value: lighting.position};
        _material.uniforms.lightColor = {type: 'fv', value: lighting.color};
        _material.uniforms.lightIntensity = {type: 'fv1', value: lighting.intensity};
        _material.uniforms.lightDistance = {type: 'fv1', value: lighting.distance};

        _this.startRender(updateLights);
    }

    function updateLights() {
        if (_material.visible !== false) Lighting.update(_this, true);
    }

    //*** Event handlers

    //*** Public methods

    /**
     * Getting this.material for the first time compiles the
     * lighting code and creates the THREEjs material.
     * @name this.material
     * @memberof Shader
     * @returns {THREE.Material}
     */
    this.get('material', function() {
        if (!_material) {
            let params = {};

            addLightingCode();

            params.vertexShader = _this.vertexShader;
            params.fragmentShader = _this.fragmentShader;

            // Merge uniforms
            params.uniforms = _this.uniforms;

            if (_this.receiveShadow) {
                for (let key in THREE.UniformsLib.lights) {
                    params.uniforms[key] = THREE.UniformsLib.lights[key];
                }
            }

            // Add threejs material properties
            for (let key in _this.properties) {
                params[key] = _this.properties[key];
            }

            _material = _this.receiveShadow || _this.useShaderMaterial ? new THREE.ShaderMaterial(params) : new THREE.RawShaderMaterial(params);
            _material.shader = _this;
            _this.uniforms = _material.uniforms;

            _material.defines = _this.defines;

            if (_this.receiveLight) updateMaterialLight(_this.__lighting);
            if (_this.receiveShadow) {
                _material.lights = true;
                if (params.fragmentShader.includes('dFdx')) _material.extensions.derivatives = true
            }
        }

        return _material;
    });

    /**
     * @name this.set
     * @memberof Shader
     *
     * @function
     * @param {String} key
     * @param {*} [value]
     * @returns {*} value of uniform
     */
    this.set = function(key, value) {
        if (typeof value !== 'undefined') _this.uniforms[key].value = value;
        return _this.uniforms[key].value;
    };

    /**
     * @name this.tween
     * @memberof Shader
     *
     * @function
     * @param {String} key
     * @param {*} value
     * @param {Number} time
     * @param {String} ease
     * @param {Number} [delay]
     * @returns {Tween}
     */
    this.tween = function(key, value, time, ease, delay, callback, update) {
        return tween(_this.uniforms[key], {value: value}, time, ease, delay, callback, update);
    };

    this.getValues = function() {
        let out = {};
        for (let key in _this.uniforms) {
            out[key] = _this.uniforms[key].value;
        }
        return out;
    };

    this.clone = function() {
        let shader = new Shader(_vertexShader, _fragmentShader, _params);
        shader.receiveLight = _this.receiveLight;
        shader.receiveShadow = _this.receiveShadow;
        shader.properties = _this.properties;
        for (let key in _this.uniforms) {
            shader.uniforms[key] = {type: _this.uniforms[key].type, value: _this.uniforms[key].value};
        }
        return shader;
    }

    this.copyUniformsTo = function(shader) {
        for (let key in _this.uniforms) {
            shader.uniforms[key] = {type: _this.uniforms[key].type, value: _this.uniforms[key].value};
        }
    }

    this.updateLighting = function() {
        let lighting = Lighting.getLighting(_this, true);
        _material.uniforms.lightPos.value = lighting.position;
        _material.uniforms.lightColor.value = lighting.color;
        _material.uniforms.lightIntensity.value = lighting.intensity;
        _material.uniforms.lightDistance.value = lighting.distance;
    };

    this.onDestroy = function() {
        if (!_this.persists) _material && _material.dispose && _material.dispose();
    };

}, () => {
    // TODO: make extending three shaders to work with any shader type
    Shader.CustomBasicMaterial = function(vertexShader, fragmentShader, uniforms) {
        if (typeof fragmentShader !== 'string') {
            uniforms = fragmentShader;
            fragmentShader = vertexShader;
        }

        function MeshCustomMaterial(parameters) {
            THREE.MeshBasicMaterial.call( this );
            this.uniforms = THREE.UniformsUtils.merge([
                THREE.ShaderLib.basic.uniforms,
                uniforms
            ]);
            setFlags(this);
            this.setValues(parameters);
        }

        MeshCustomMaterial.prototype = Object.create( THREE.MeshBasicMaterial.prototype );
        MeshCustomMaterial.prototype.constructor = MeshCustomMaterial;
        MeshCustomMaterial.prototype.isMeshBasicMaterial = true;

        MeshCustomMaterial.prototype.copy = function ( source ) {
            THREE.MeshBasicMaterial.prototype.copy.call( this, source );
            this.uniforms = THREE.UniformsUtils.clone(source.uniforms);
            setFlags(this);
            return this;
        };

        function setFlags (material) {
            material.vertexShader = Shaders.getShader(vertexShader + '.vs') || vertexShader;
            material.fragmentShader = Shaders.getShader(fragmentShader + '.fs') || fragmentShader;
            material.type = 'MeshCustomMaterial';
        }

        return MeshCustomMaterial;
    };

    Shader.CustomStandardMaterial = function(vertexShader, fragmentShader, uniforms) {
        if (typeof fragmentShader !== 'string') {
            uniforms = fragmentShader;
            fragmentShader = vertexShader;
        }

        function MeshCustomMaterial(parameters) {
            THREE.MeshStandardMaterial.call( this );
            this.uniforms = THREE.UniformsUtils.merge([
                THREE.ShaderLib.standard.uniforms,
                uniforms
            ]);
            setFlags(this);
            this.setValues(parameters);
        }

        MeshCustomMaterial.prototype = Object.create( THREE.MeshStandardMaterial.prototype );
        MeshCustomMaterial.prototype.constructor = MeshCustomMaterial;
        MeshCustomMaterial.prototype.isMeshStandardMaterial = true;

        MeshCustomMaterial.prototype.copy = function ( source ) {
            THREE.MeshStandardMaterial.prototype.copy.call( this, source );
            this.uniforms = THREE.UniformsUtils.clone(source.uniforms);
            setFlags(this);
            return this;
        };

        function setFlags (material) {
            material.vertexShader = Shaders.getShader(vertexShader + '.vs') || vertexShader;
            material.fragmentShader = Shaders.getShader(fragmentShader + '.fs') || fragmentShader;
            material.type = 'MeshCustomMaterial';
        }

        return MeshCustomMaterial;
    };
});