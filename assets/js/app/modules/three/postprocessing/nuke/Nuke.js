Class(function Nuke(_stage, _params) {
    Inherit(this, Component);
    var _this = this;

    if (!_params.renderer) console.error('Nuke :: Must define renderer');

    _this.stage = _stage;
    _this.renderer = _params.renderer;
    _this.camera = _params.camera;
    _this.scene = _params.scene;
    _this.rtt = _params.rtt; // optional, if available, renders finally to this and not canvas
    _this.enabled = _params.enabled == false ? false : true;
    _this.passes = _params.passes || [];
    _this.useDrawBuffers = typeof _params.useDrawBuffers !== 'undefined' ? _params.useDrawBuffers : Device.graphics.webgl.detect('draw_buffers');

    var _dpr = _params.dpr || 1;
    var _rts = {};
    var _rtStack = [];
    var _rttPing, _rttPong, _nukeScene, _nukeMesh, _rttCamera, _rttBuffer;
    var _drawBuffers = [];

    //*** Constructor
    (function () {
        initNuke();
        addListeners();
    })();

    function initNuke() {
        var width = _this.stage.width * _dpr;
        var height = _this.stage.height * _dpr;
        _rttPing = Nuke.getRT(width, height, false);
        _rttPong = Nuke.getRT(width, height, false);
        _rttBuffer = Nuke.getRT(width, height, _this.useDrawBuffers);

        _rttCamera = new THREE.OrthographicCamera( _this.stage.width / - 2, _this.stage.width / 2, _this.stage.height / 2, _this.stage.height / - 2, 1, 1000 );

        _nukeScene = new THREE.Scene();
        _nukeMesh = new THREE.Mesh(Nuke.getPlaneGeom(), new THREE.MeshBasicMaterial());
        _nukeScene.add(_nukeMesh);
    }

    function finalRender(scene, camera) {
        if (_this.rtt) {
            _this.renderer.render(scene, camera || _this.camera, _this.rtt);
        } else {
            _this.renderer.render(scene, camera || _this.camera);
        }

        _this.postRender && _this.postRender();
    }

    //*** Event handlers
    function addListeners() {
        _this.events.sub(Events.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        var width = _this.stage.width * _dpr;
        var height = _this.stage.height * _dpr;
        _rttPing.dispose();
        _rttPong.dispose();

        _rttPing.setSize(width, height);
        _rttPong.setSize(width, height);
        _rttBuffer.setSize(width, height);

        _rttCamera.left = _this.stage.width / - 2;
        _rttCamera.right = _this.stage.width / 2;
        _rttCamera.top = _this.stage.height / 2;
        _rttCamera.bottom = _this.stage.height / - 2;
        _rttCamera.updateProjectionMatrix();
    }

    //*** Public methods
    _this.add = function(pass, index) {
        if (!pass.pass) {
            defer(function() {
                _this.add(pass, index);
            });
            return;
        }

        if (typeof index == 'number') {
            _this.passes.splice(index, 0, pass);
            return;
        }
        _this.passes.push(pass);
    };

    _this.remove = function(pass) {
        if (typeof pass == 'number') {
            _this.passes.splice(pass);
        } else {
            _this.passes.remove(pass);
        }
    };

    _this.renderToTexture = function(clear, rtt) {
        _this.renderer.render(_this.scene, _this.camera, rtt || _rttPing, typeof clear == 'boolean' ? clear : true);
    }

    _this.render = function() {
        if (!_this.enabled || !_this.passes.length) {
            finalRender(_this.scene);
            return;
        }

        _this.renderer.render(_this.scene, _this.camera, _rttBuffer, true);

        var usedBuffer = false;
        var pingPong = true;
        for (var i = 0; i < _this.passes.length - 1; i++) {
            _nukeMesh.material = _this.passes[i].pass;

            usedBuffer = true;

            _nukeMesh.material.uniforms.tDiffuse.value = i == 0 ? _rttBuffer.texture : (pingPong ? _rttPing.texture : _rttPong.texture);
            _this.renderer.render(_nukeScene, _rttCamera, pingPong ? _rttPong : _rttPing);

            pingPong = !pingPong;
        }

        _nukeMesh.material = _this.passes[_this.passes.length - 1].pass;
        _nukeMesh.material.uniforms.tDiffuse.value = !usedBuffer ? _rttBuffer.texture : (pingPong ? _rttPing.texture : _rttPong.texture);
        finalRender(_nukeScene, _rttCamera);
    };

    _this.setSize = function(width, height) {
        _this.events.unsub(Events.RESIZE, resizeHandler);
        if (!_rts[width + '_' + height]) {
            var rttPing = Nuke.getRT(width * _dpr, height * _dpr, _this.useDrawBuffers);
            var rttPong = Nuke.getRT(width * _dpr, height * _dpr, false);
            var rttBuffer = Nuke.getRT(width * _dpr, height * _dpr, false);
            _rts[width + '_' + height] = {ping: rttPing, pong: rttPong, name: width + '_' + height, buffer: rttBuffer};

            _rtStack.push(_rts[width + '_' + height]);
            if (_rtStack.length > 3) {
                let rts = _rtStack.shift();
                delete _rts[rts.name];
                rts.ping.dispose();
                rts.pong.dispose();
                rts.buffer.dispose();
            }
        }

        var rts = _rts[width + '_' + height];
        _rttPing = rts.ping;
        _rttPong = rts.pong;
        _rttBuffer = rts.buffer;

        if (_rttBuffer && _rttBuffer.attachments) {
            _rttBuffer.attachments = [_rttBuffer.attachments[0]];
            for (let i = 0; i < _drawBuffers.length; i++) _rttBuffer.attachments.push(_drawBuffers[i]);
        }
    }

    _this.attachDrawBuffer = function(texture) {
        _drawBuffers.push(texture);

        if (_rttBuffer && _rttBuffer.attachments) {
            _rttBuffer.attachments = [_rttBuffer.attachments[0]];
            for (let i = 0; i < _drawBuffers.length; i++) _rttBuffer.attachments.push(_drawBuffers[i]);
        }

        return _drawBuffers.length;
    }

    _this.set('dpr', function(v) {
        _dpr = v || Device.pixelRatio;
        resizeHandler();
    });

    _this.get('dpr', function() {
        return _dpr;
    });

    _this.get('output', function() {
        return _nukeMesh.material.uniforms ? _nukeMesh.material.uniforms.tDiffuse.value : null;
    });

}, function() {
    var _plane;
    var _rts = {};
    Nuke.getPlaneGeom = function() {
        if (!_plane) _plane = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
        return _plane;
    }

    Nuke.getRT = function(width, height, multi) {
        if (!multi) {
            return Utils3D.createRT(width, height);
        } else {
            return Utils3D.createMultiRT(width, height);
        }
    }
});