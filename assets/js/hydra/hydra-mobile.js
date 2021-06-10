

Class(function Mobile() {
    Inherit(this, Component);
    Namespace(this);
    const _this = this;

    Hydra.ready(() => {
        if (!Device.mobile) return;

        addHandlers();

        
        if (Device.system.browser == 'safari' && !Device.mobile.native) __body.css({height: '101%'}).div.scrollTop = 0;
    });

    function addHandlers() {
        _this.events.sub(Events.RESIZE, resize);
        if (!Device.mobile.native) window.addEventListener('touchstart', preventNativeScroll, {passive: false});
    }

    function preventNativeScroll(e) {
        if (_this.isAllowNativeScroll) return;

        let target = e.target;

        
        if (target.nodeName == 'INPUT' || target.nodeName == 'TEXTAREA' || target.nodeName == 'SELECT' || target.nodeName == 'A') return;

        
        let prevent = true;
        while (target.parentNode && prevent) {
            if (target._scrollParent) prevent = false;
            target = target.parentNode;
        }
        if (prevent) e.preventDefault();
    }

    function resize() {
        updateOrientation();
        checkResizeRefresh();

        
        if (!_this.isAllowNativeScroll) document.body.scrollTop = 0;
    }

    function updateOrientation() {
        _this.orientation = Stage.width > Stage.height ? 'landscape' : 'portrait';
        if (!_this.orientationSet) return;
        if (!window.Fullscreen.isOpen && !Device.mobile.pwa) return;
        if (window.screen && window.screen.orientation.lock) window.screen.orientation.lock(_this.orientationSet);
    }

    const checkResizeRefresh = (function() {
        let _lastWidth;
        return function() {
            if (_this.isPreventResizeReload) return;
            if (_lastWidth == Stage.width) return;
            _lastWidth = Stage.width;
            if (Device.system.os !== 'ios' && !(Device.system.os == 'android' && Device.system.version >= 7)) return;

            
            if (Device.mobile.tablet && !(Math.max(Stage.width, Stage.height) > 800)) window.location.reload();
        }
    })();

    
    
    this.vibrate = function(duration) {
        navigator.vibrate && navigator.vibrate(duration);
    };

    
    this.fullscreen = function() {

        
        if (!Device.mobile || Device.mobile.native || Device.mobile.pwa || Dev.emulator) return;

        if (!window.Fullscreen) throw `Mobile.fullscreen requires Fullscreen module`;

        
        if (Device.system.os !== 'android') return;
        __window.bind('touchend', () => {
             Fullscreen.open();
        });

        if (_this.ScreenLock && _this.ScreenLock.isActive) window.onresize();
    };

    
    this.setOrientation = function(orientation, isForce) {
        
        if (_this.System && _this.NativeCore.active) return _this.System.orientation = _this.System[orientation.toUpperCase()];

        _this.orientationSet = orientation;

        updateOrientation();

        if (!isForce) return;
        if (!_this.ScreenLock) throw `Mobile.setOrientation isForce argument requires ScreenLock module`;
        if (orientation === 'any') _this.ScreenLock.unlock();
        else _this.ScreenLock.lock();
    };

    
    this.allowNativeScroll = function() {
        _this.isAllowNativeScroll = true;
    };

    
    this.preventResizeReload = function() {
        _this.isPreventResizeReload = true;
    };

    
    this._addOverflowScroll = function($obj) {
        $obj.div._scrollParent = true;
        if (Device.mobile.native) return;
        $obj.div._preventEvent = function(e) {
            e.stopPropagation();
        };
        $obj.bind('touchmove', $obj.div._preventEvent);
    };

    
    this._removeOverflowScroll = function($obj) {
        $obj.unbind('touchmove', $obj.div._preventEvent);
    };

    this.get('phone', () => {
        throw 'Mobile.phone is removed. Use Device.mobile.phone';
    });

    this.get('tablet', () => {
        throw 'Mobile.tablet is removed. Use Device.mobile.tablet';
    });

    this.get('os', () => {
        throw 'Mobile.os is removed. Use Device.system.os';
    });

}, 'Static');
