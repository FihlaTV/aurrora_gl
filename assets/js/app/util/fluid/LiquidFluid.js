Class(function LiquidFluid() {
    Inherit(this, Component);
    var _this = this;

    const DIMENSIONS = {width: 256, height: 256};

    var _renderer, _camera, _tween;
    var _inside, _all, _cursor;
    var _velocityFBO0, _velocityFBO1, _divergenceFBO, _pressureFBO0, _pressureFBO1;
    var _advectVelocityKernel, _addForceKernel, _divergenceKernel, _jacobiKernel, _subtractPressureGradientKernel, _drawKernel;
    var _advectVelocityKernelScene, _addForceKernelScene, _divergenceKernelScene, _jacobiKernelScene, _subtractPressureGradientKernelScene, _drawKernelScene;
    var _x0, _y0;
    var _lerp = new Vector2();
    var _webcam = new Vector2(DIMENSIONS.width/2, DIMENSIONS.height/2);
    var _webcamLerp = new Vector2(DIMENSIONS.width/2, DIMENSIONS.height/2);
    var _timeout;
    var _count = 0;
    var _resolution = 1;

    var h = Math.round(Math.range(1, 0, 10, 35, 0));
    var s = Math.round(Math.range(1, 0, 10, 0, 65));
    var l = Math.round(Math.range(1, 0, 10, 55, 20));
    var offset = Math.round(Math.range(1, 0, 10, 30, 0));
    var _options = {
        iterations: 4,
        mouse_force: 0.4,
        resolution: _resolution,
        cursor_size: 150 * _resolution,
        step: 1/60,
        color1: 'hsl(0, 69%, 60%)',
        color2: 'hsl(0, 77%, 20%)',
    };

    var _movement = new Vector2(DIMENSIONS.width/2, DIMENSIONS.height/2);

    this.rt = Utils3D.createRT(DIMENSIONS.width, DIMENSIONS.height);

    //*** Constructor
    (function () {
        _this.rt.texture.wrapS = _this.rt.texture.wrapT = THREE.RepeatWrapping;
        initRenderer();
        initGeometries();
        initFBOs();
        initShaders();
        _this.startRender(loop);
        // addHandlers();
    })();

    function initRenderer() {
        _renderer = World.RENDERER;

        // _renderer.autoClear = false;
        // _renderer.setPixelRatio(1);
        // _renderer.setSize(DIMENSIONS.width * _options.resolution, DIMENSIONS.height * _options.resolution);

        _camera = new THREE.PerspectiveCamera(45, DIMENSIONS.width / DIMENSIONS.height, 1, 10000);

        _movement.wiggle = new WiggleBehavior(_movement);
        _movement.wiggle.speed = 0.85;
        _movement.wiggle.scale = 0.3;
        _movement.wiggle.alpha *= 3;
        _movement.wiggle.startRender();
    }

    function initGeometries() {
        var px_x = 1.0 / (DIMENSIONS.width * _options.resolution);
        var px_y = 1.0 / (DIMENSIONS.height * _options.resolution);

        _inside = new THREE.PlaneBufferGeometry(2.0 - px_x * 2.0 * 2.0, 2.0 - px_y * 2.0 * 2.0);
        _all = new THREE.PlaneBufferGeometry(2, 2);
        _cursor = new THREE.PlaneBufferGeometry(px_x * _options.cursor_size * 2.0 * 2.0, px_y * _options.cursor_size * 2.0 * 2.0);
    }

    function initFBOs() {
        var type = THREE.FloatType;
        var parameters = {minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBuffer: false, type: type};
        var width = DIMENSIONS.width * _options.resolution;
        var height = DIMENSIONS.height * _options.resolution;
        _velocityFBO0 = new THREE.WebGLRenderTarget(width, height, parameters);
        _velocityFBO1 = new THREE.WebGLRenderTarget(width, height, parameters);
        _divergenceFBO = new THREE.WebGLRenderTarget(width, height, parameters);
        _pressureFBO0 = new THREE.WebGLRenderTarget(width, height, parameters);
        _pressureFBO1 = new THREE.WebGLRenderTarget(width, height, parameters);
        _this.texture = new THREE.WebGLRenderTarget(width, height, parameters);
    }

    function createScene(geometry, material) {
        var scene = new THREE.Scene();
        var mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        scene.add(mesh);
        return scene;
    }

    function initShaders() {
        var px_x = 1.0 / (DIMENSIONS.width * _options.resolution);
        var px_y = 1.0 / (DIMENSIONS.height * _options.resolution);
        var px = new THREE.Vector2(px_x, px_y);
        var px1 = new THREE.Vector2(1, DIMENSIONS.width / DIMENSIONS.height);
        _advectVelocityKernel = new Shader('kernel', 'advect');
        _advectVelocityKernel.uniforms = {
            px: {type: 'v2', value: px},
            px1: {type: 'v2', value: px1},
            scale: {type: 'f', value: 1},
            velocity: {type: 't', value: _velocityFBO0},
            source: {type: 't', value: _velocityFBO0},
            dt: {type: 'f', value: _options.step},
        };
        _advectVelocityKernelScene = createScene(_inside, _advectVelocityKernel.material);

        _addForceKernel = new Shader('cursor', 'addForce');
        _addForceKernel.uniforms = {
            px: {type: 'v2', value: px},
            force: {type: 'v2', value: new THREE.Vector2(0.5, 0.2)},
            center: {type: 'v2', value: new THREE.Vector2(0.1, 0.4)},
            scale: {type: 'v2', value: new THREE.Vector2(_options.cursor_size * px_x, _options.cursor_size * px_y)},
        };
        _addForceKernel.material.blending = THREE.AdditiveBlending;
        _addForceKernel.material.transparent = true;
        _addForceKernelScene = createScene(_cursor, _addForceKernel.material);

        _divergenceKernel = new Shader('kernel', 'divergence');
        _divergenceKernel.uniforms = {
            px: {type: 'v2', value: px},
            velocity: {type: 't', value: _velocityFBO1},
        };
        _divergenceKernelScene = createScene(_all, _divergenceKernel.material);

        _jacobiKernel = new Shader('kernel', 'jacobi');
        _jacobiKernel.uniforms = {
            pressure: {type: 't', value: _pressureFBO0},
            divergence: {type: 't', value: _divergenceFBO},
            alpha: {type: 'f', value: -1},
            beta: {type: 'f', value: 0.25},
            px: {type: 'v2', value: px},
        };
        _jacobiKernelScene = createScene(_all, _jacobiKernel.material);

        _subtractPressureGradientKernel = new Shader('kernel', 'subtractPressureGradient');
        _subtractPressureGradientKernel.uniforms = {
            scale: {type: 'f', value: 1},
            pressure: {type: 't', value: _pressureFBO0},
            velocity: {type: 't', value: _velocityFBO1},
            px: {type: 'v2', value: px},
        };
        _subtractPressureGradientKernelScene = createScene(_all, _subtractPressureGradientKernel.material);

        _drawKernel = new Shader('kernel', 'visualize');
        _drawKernel.uniforms = {
            pressure: {type: 't', value: _pressureFBO0},
            velocity: {type: 't', value: _velocityFBO0},
            color1: {type: 'c', value: new THREE.Color(_options.color1)},
            color2: {type: 'c', value: new THREE.Color(_options.color2)},
            px: {type: 'v2', value: px},
        };
        _drawKernelScene = createScene(_all, _drawKernel.material);
    }

    function updatetShaders() {
        var px_x = 1.0 / (DIMENSIONS.width * _options.resolution);
        var px_y = 1.0 / (DIMENSIONS.height * _options.resolution);
        var px = new THREE.Vector2(px_x, px_y);
        var px1 = new THREE.Vector2(1, DIMENSIONS.width / DIMENSIONS.height);

        _advectVelocityKernel.uniforms.px.value = px;
        _advectVelocityKernel.uniforms.px1.value = px1;
        _advectVelocityKernel.uniforms.velocity.value = _velocityFBO0;
        _advectVelocityKernel.uniforms.source.value = _velocityFBO0;

        _addForceKernel.uniforms.px.value = px;
        _addForceKernel.uniforms.scale.value = new THREE.Vector2(_options.cursor_size * px_x, _options.cursor_size * px_y);

        _divergenceKernel.uniforms.px.value = px;
        _divergenceKernel.uniforms.velocity.value = _velocityFBO1;

        _jacobiKernel.uniforms.pressure.value = _pressureFBO0;
        _jacobiKernel.uniforms.divergence.value = _divergenceFBO;
        _jacobiKernel.uniforms.px.value = px;

        _subtractPressureGradientKernel.uniforms.pressure.value = _pressureFBO0;
        _subtractPressureGradientKernel.uniforms.velocity.value = _velocityFBO1;
        _subtractPressureGradientKernel.uniforms.px.value = px;

        _drawKernel.uniforms.pressure.value = _pressureFBO0;
        _drawKernel.uniforms.velocity.value = _velocityFBO0;
        _drawKernel.uniforms.px.value = px;
    }

    function loop(t) {
        // if (_this.last) {
        //     var delta = (t - _this.last)/1000;
        //     window.FPS = 1/delta;
        // }

        _this.last = t;

        var x = Number(_movement.x.toFixed(4));
        var y = Number(_movement.y.toFixed(4));

        // Adjust renderer
        var autoClear = _renderer.autoClear;
        _renderer.autoClear = false;

        // var pixelRatio = _renderer.getPixelRatio();
        // _renderer.setPixelRatio(1);

        var px_x = 1.0 / (DIMENSIONS.width * _options.resolution);
        var px_y = 1.0 / (DIMENSIONS.height * _options.resolution);

        if (_x0 == null) {
            _x0 = x * _options.resolution;
            _y0 = y * _options.resolution;
        }

        var x1 = x * _options.resolution;
        var y1 = y * _options.resolution;
        var xd = x1 - _x0;
        var yd = y1 - _y0;

        _x0 = x1;
        _y0 = y1;

        if(_x0 === 0 && _y0 === 0) xd = yd = 0;

        _renderer.render(_advectVelocityKernelScene, _camera, _velocityFBO1);

        _addForceKernel.uniforms.force.value.set(
            xd * px_x * _options.cursor_size * _options.mouse_force,
            -yd * px_y * _options.cursor_size * _options.mouse_force
        );
        _addForceKernel.uniforms.center.value.set(_x0 * px_x * 2 - 1.0, (_y0 * px_y * 2 - 1.0) * -1);

        // _renderer.state.setBlending(THREE.AdditiveBlending);
        _renderer.render(_addForceKernelScene, _camera, _velocityFBO1);
        // _renderer.state.setBlending(null);

        _renderer.render(_divergenceKernelScene, _camera, _divergenceFBO);

        var p0 = _pressureFBO0,
            p1 = _pressureFBO1,
            p_ = p0;

        for(var i = 0; i < _options.iterations; i++) {
            _jacobiKernel.uniforms.pressure.value = p0;
            _renderer.render(_jacobiKernelScene, _camera, p1);

            p_ = p0;
            p0 = p1;
            p1 = p_;
        }

        _renderer.render(_subtractPressureGradientKernelScene, _camera, _velocityFBO0);
        _renderer.render(_drawKernelScene, _camera, _this.rt);
        _renderer.autoClear = autoClear;
        // _renderer.setPixelRatio(pixelRatio);
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.sub(Events.RESIZE, resize);
    }

    function resize() {
        initFBOs();
        updatetShaders();

        var px_x = 1.0 / (DIMENSIONS.width * _options.resolution);
        var px_y = 1.0 / (DIMENSIONS.height * _options.resolution);

        var newInside = new THREE.PlaneBufferGeometry(2.0 - px_x * 2.0 * 2.0, 2.0 - px_y * 2.0 * 2.0);
        var newAll = new THREE.PlaneBufferGeometry(2, 2);
        var newCursor = new THREE.PlaneBufferGeometry(px_x * _options.cursor_size * 2.0 * 2.0, px_y * _options.cursor_size * 2.0 * 2.0);

        _inside.attributes.position.array = newInside.attributes.position.array;
        _all.attributes.position.array = newAll.attributes.position.array;
        _cursor.attributes.position.array = newCursor.attributes.position.array;

        _inside.attributes.position.needsUpdate = true;
        _all.attributes.position.needsUpdate = true;
        _cursor.attributes.position.needsUpdate = true;
    }


    //*** Public methods

}, 'singleton');
