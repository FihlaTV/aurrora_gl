Class(function RenderGL() {
    Inherit(this, Component);
    const _this = this;
    const _evt = {stage: null, camera: null};

    var _dpr = null;

    this.NORMAL = 'normal';
    this.WEBVR = 'webvr';
    this.STEREO = 'stereo';
    this.ARKIT = 'ARKit';
    this.ARCORE = 'ARCore';
    this.AR = 'AR';
    this.DAYDREAM = 'daydream';
    this.GEARVR = 'gearVR';

    this.RENDER = 'rendergl_render';
    this.READY = 'render_gl_ready';

    //*** Constructor
    (function() {
        _this.events.sub(Events.RESIZE, resizeHandler);
    })();

    //*** Event handlers
    function onRenderEye(stage, camera) {
        _evt.stage = stage;
        _evt.camera = camera;
        _this.events.fire(_this.RENDER, _evt);
    }

    function resizeHandler() {
        _this.renderer && _this.renderer.setSize(Stage.width, Stage.height);
    }

    //*** Public methods
    this.set('DPR', v => {
        _dpr = v;
        if (_this.renderer) _this.renderer.setSize(Stage.width, Stage.height);
    });

    this.get('DPR', v => {
        return _dpr;
    });

    this.initialize = function(type, params = {}) {
        if (_this.camera) _this.camera.destroy();
        if (_this.renderer) _this.renderer.destroy();

        if (type == _this.AR) {
            if (Device.system.os == 'ios') type = _this.ARKIT;
            else type = _this.ARCORE;
        }

        if (type == _this.ARKIT) {
            if (!window.ARKit) throw 'RenderGL.ARKIT requires ARKit module';
            ARKit.init();
        }

        if (type == _this.ARCORE) {
            if (!window.ARCore) throw 'RenderGL.ARCORE requires ARCore module';
            ARCore.init();
        }

        if (!_this.threeRenderer) {
            let camera = new THREE.PerspectiveCamera(45, Stage.width / Stage.height, 0.01, 200);

            _this.threeRenderer = (function() {
                if (window.ARKit && window.ARKit.renderer) return ARKit.renderer;
                if (window.ARCore && window.ARCore.renderer) return ARCore.renderer;

                if (window._canvas) params.canvas = window._canvas;

                let renderer = new THREE.WebGLRenderer(params);
                renderer.setSize(Stage.width, Stage.height);
                renderer.setPixelRatio(World.DPR);
                return renderer;
            })();

            _this.scene = (function() {
                if (window.ARKit && window.ARKit.scene) return ARKit.scene;
                if (window.ARCore && window.ARCore.scene) return ARCore.scene;
                return new THREE.Scene();
            })();

            _this.nuke = _this.initClass(Nuke, Stage, {renderer: _this.threeRenderer, scene: _this.scene, camera: camera, dpr: World.DPR});
        }

        _dpr = _dpr || World.DPR || 1;
        switch (type) {
            case _this.WEBVR:
                _this.renderer = _this.initClass(VRRenderer, _this.threeRenderer, _this.nuke);
                _this.camera = _this.initClass(VRCamera);
                break;

            case _this.STEREO:
                _this.renderer = _this.initClass(VRStereoRenderer, _this.threeRenderer, _this.nuke);
                _this.camera = _this.initClass(VRStereoCamera);
                break;

            case _this.NORMAL:
                _this.renderer = _this.initClass(RenderGLRenderer, _this.threeRenderer, _this.nuke);
                _this.camera = _this.initClass(RenderGLCamera);
                break;

            case _this.ARKIT:
                _this.renderer = _this.initClass(RenderGLRenderer, ARKit.renderer, _this.nuke);
                _this.camera = ARKit;
                break;

            case _this.ARCORE:
                _this.renderer = _this.initClass(RenderGLRenderer, ARCore.renderer, _this.nuke);
                _this.camera = ARCore;
                break;

            case _this.DAYDREAM:
                _this.renderer = _this.initClass(DaydreamRenderer, _this.threeRenderer, _this.nuke);
                _this.camera = _this.initClass(DaydreamCamera);
                break;
        }

        _this.type = type;

        _this.nuke.camera = _this.camera.worldCamera;

        _this.renderer.onRenderEye = onRenderEye;

        defer(() => {
            _this.events.fire(_this.READY);
        });
    }

    this.render = function(scene, camera, renderTarget, forceClear) {
        _this.renderer.render(scene || _this.scene, camera || _this.camera.worldCamera, renderTarget, forceClear);
    }

    this.startRender = function() {
        Render.start(_this.render);
    }

    this.stopRender = function() {
        Render.stop(_this.render);
    }

    this.requestPresent = function(bool) {
        _this.renderer.requestPresent && _this.renderer.requestPresent(bool);
    }

    this.setSize = function(width, height) {
        _this.events.unsub(Events.RESIZE, resizeHandler);
        _this.renderer.setSize(width, height);
    }

    this.set('onRenderEye', callback => {
        _this.renderer.onRenderEye = callback;
    });
}, 'static');
