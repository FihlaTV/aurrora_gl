Mobile.Class(function Aura() {
    Inherit(this, Mobile.BaseModule);
    const _this = this;

    var _id = Utils.timestamp();

    this.RELAY = 'aura_relay';
    this.CAMERA_PERMISSION = 'aura_camera_permission';

    this.GL = window.AURA || !Mobile.NativeCore.active;
    this.UI = window.webkit || !Mobile.NativeCore.active;

    //*** Constructor
    (function () {
        Hydra.ready(() => {
            if (Utils.query('p')) return;
            addListeners();
            if (_this.GL && window.Container) Container.instance();
            if (_this.UI && window.UI) UI.instance();
            if (Utils.query('ar')) _this.wait(World, 'ELEMENT', _ => _this.hideUI());
            _this.send('setDPR', {width: Stage.width * 2, height: Stage.height * 2});
        });
    })();

    //*** Event handlers
    function addListeners() {
        _this.events.sub(RenderGL, RenderGL.READY, init);
    }

    function init() {
        // if (!Mobile.NativeCore.active) World.ELEMENT.transform({y: 9999}).setZ(99999);
    }

    //*** Public methods
    this.showUI = function() {
        if (Mobile.NativeCore.active) {
            _this.send('showUI');
        } else {
            if (!World.ELEMENT) return;
            World.ELEMENT.tween({y: Stage.height}, 500, 'easeOutCubic', () => {
                World.ELEMENT.transform({y: 9999});
            });
        }
    }

    this.hideUI = function() {
        if (Mobile.NativeCore.active) {
            _this.send('hideUI');
        } else {
            if (!World.ELEMENT) return;
            World.ELEMENT.transform({y: Stage.height});
            World.ELEMENT.tween({y: 0}, 500, 'easeOutCubic');
        }
    }

    this.relay = function(data) {
        data.aid = _id;
        _this.send('relay', data);

        if (!Mobile.NativeCore.active) {
            data.aid = null;
            _this.incoming(data);
        }
    }

    this.incoming = function(data) {
        if (data.aid == _id) return;

        if (data.fn == 'cameraPermission') {
            _this.cameraPermissionTime = Date.now();
            _this.hasCameraPermission = data.permission;
            _this.events.fire(_this.CAMERA_PERMISSION, {granted: data.permission});
        } else {
            _this.events.fire(_this.RELAY, data, true);
        }
    }
    
    this.garbageCollect = function() {
        if (window.garbageCollect) window.garbageCollect();
    }
    
    this.lockOrientation = function() {
        this.send('lockOrientation', {locked: true});
    }

    this.unlockOrientation = function() {
        this.send('lockOrientation', {locked: false});
    }
}, 'static');