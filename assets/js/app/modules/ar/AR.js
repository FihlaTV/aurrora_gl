Class(function AR() {
    Inherit(this, Component);
    const _this = this;
    var _ar;

    this.TRACKING_CHANGE = 'ar_tracking_change';
    this.FIRST_TRANSFORM = 'ar_first_transform';

    //*** Constructor
    defer(_ => {
        if (window.AURA) {
            if (Device.system.os == 'android') _ar = ARCore;
            if (Device.system.os == 'ios') _ar = ARKit;
        }

        if (_ar) {
            _this.events.sub(_ar, _ar.FIRST_TRANSFORM, firstTransform);
            _this.events.sub(_ar, _ar.TRACKING_CHANGE, trackingChange);
        }
    });

    //*** Event handlers
    function firstTransform() {
        _this.events.fire(_this.FIRST_TRANSFORM);
    }

    function trackingChange() {
        _this.trackingState = _ar.trackingState;
        _this.trackingReason = _ar.trackingReason;
        _this.events.fire(_this.TRACKING_CHANGE, {state: _this.trackingState, reason: _this.trackingReason});
    }

    //*** Public methods
    this.get('cameraTexture', () => {
        if (!_ar) return {value: Utils3D.getTexture('assets/images/uv.jpg')};
        return {value: _ar.cameraTexture};
    });

    this.get('uvScale', _ => {
        if (!_ar) return {value: new THREE.Vector2(1, 1)};
        return {value: _ar.uvScale};
    });

    this.get('orientation', _ => {
        return _ar ? _ar.orientation : 'portrait';
    });

    this.findSurface = function(obj) {
        if (!ar) return Promise.resolve([]);
        return _ar.findSurface(obj);
    }

    this.resetOrigin = function() {
        if (_ar) _ar.resetOrigin();
    }
}, 'static');