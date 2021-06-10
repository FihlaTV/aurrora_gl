Class(function Antimatter(_num, _renderer) {
    Inherit(this, AntimatterCalculation);
    var _this = this;
    var _buffer, _geometry;
    var _cursor = 0;

    var _size = findSize();

    this.particleCount = _num;

    //*** Constructor
    (function () {
        if (!window.Shader) throw 'Antimatter requires hydra-three';
        defer(createBuffer);
    })();

    function findSize() {
        var values = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
        for (var i = 0; i < values.length; i++) {
            var p2 = values[i];
            if (p2 * p2 >= _num) return p2;
        }
    }

    function createBuffer() {
        AntimatterUtil.createBufferArray(_size, _num, function(geometry, vertices) {
            _this.vertices = _this.vertices || new AntimatterAttribute(vertices, 4);

            _geometry = new THREE.BufferGeometry();
            _geometry.addAttribute('position', new THREE.BufferAttribute(geometry, 3));
            _this.vertices.geometry = _geometry;

            _this.init(_geometry, _renderer, _size);
        });
    }

    //*** Event handlers

    //*** Public methods
    this.createFloatArray = function(components) {
        return new Float32Array(_size * _size * (components || 3));
    }

    this.ready = function(callback) {
        return _this.wait(_this, 'vertices');
    }

    this.getMesh = function() {
        var shader = _this.createShader(_this.fragmentShader || 'void main() { gl_FragColor = vec4(1.0); }');
        _this.mesh = new THREE.Points(_geometry, shader.material);
        _this.mesh.frustumCulled = false;
        _this.shader = shader;
        _this.geometry = _geometry;
        return _this.mesh;
    }

    this.createShader = function(fs) {
        var uniforms = _this.uniforms || {};
        var shader = new Shader(_this.vertexShader || 'AntimatterPosition', fs);
        shader.uniforms = THREE.UniformsUtils.merge([
            {
                tPos: {type: 't', value: _this.vertices.texture},
            },
            uniforms
        ]);
        return shader;
    }

    this.getLookupArray = function() {
        return new Float32Array(_this.vertices.geometry.attributes.position.array);
    }
});
