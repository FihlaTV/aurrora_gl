Mobile.Class(function BaseModule() {
    Inherit(this, Component);
    var _this = this;
    var _name;

    var _callbacks = {};

    
    (function () {
        _name = _this.constructor.toString().match(/function ([^\(]+)/)[1];
        Mobile.NativeCore.register(_name, _this);
        defer(() => _this.send('init'));
    })();

    

    
    this.init = function() {
    }

    this.send = function(fn, data = {}, callback) {
        let promise = Promise.create();

        if (typeof fn === 'object') {
            callback = data;
            data = fn;
            fn = data.fn;
        }

        if (typeof data === 'function' || typeof data === 'boolean') {
            callback = data;
            data = {};
        }

        if (callback) promise.then(callback);

        if (!_name) throw 'Must call init on module before sending data';

        data._id = Utils.timestamp();
        data.fn = fn;
        data.nativeModule = _name;

        if (callback) {
            _callbacks[data._id] = callback === true ? promise : callback;
        }

        Mobile.NativeCore.send(data);

        return promise;
    }

    this.receive = function(data) {
        var id = data._id;
        var callback = _callbacks[id];

        if (callback) {
            if (callback.resolve) callback.resolve(data);
            else callback(data);
            delete _callbacks[id];
        } else {
            _this.incoming(data);
        }
    }

    this.incoming = function() {
        
    }
});
Mobile.Class(function NativeCore() {
    Inherit(this, Component);
    var _this = this;
    var _api;

    var _references = {};

    this.active = false;

    
    (function () {
        initAPI();
    })();

    function initAPI() {
        if (window.nativeHydra) _api = window.nativeHydra;
        if (window.webkit && window.webkit.messageHandlers) _api = window.webkit.messageHandlers.nativeHydra;

        if (_api) _this.active = true;
    }

    

    
    this.send = function(data) {
        if (!this.active) return;
        data = JSON.stringify(data);

        if (_api) _api && _api.postMessage && _api.postMessage(data);
    }

    this.receive = function(data) {
        if (data.jsModule) _references[data.jsModule].receive(data);
    }

    this.register = function(name, ref) {
        _references[name] = ref;
    }
}, 'Static');
Mobile.Class(function NativeServiceWorker() {
    Inherit(this, Component);
    const _this = this;

    var _offlineQueue = [];

    
    (function () {
        if (Mobile.NativeCore.active) {
            override('get');
            override('post');
            Hydra.ready(addListeners);
        }
    })();

    function safe(cmd = {}) {
        if (typeof cmd !== 'string') cmd = JSON.stringify(cmd);
        cmd = cmd.replace(/:/g, '');
        cmd = cmd.replace(/-/g, '');
        cmd = cmd.replace(/_/g, '');
        cmd = cmd.replace(/\//g, '');
        cmd = cmd.replace(/&/g, '');
        cmd = cmd.replace(/{/g, '');
        cmd = cmd.replace(/}/g, '');
        cmd = cmd.replace(/\./g, '');
        cmd = cmd.replace(/"/g, '');
        cmd = cmd.replace(/\?/g, '');
        cmd = cmd.replace(/ /g, '');
        return cmd;
    }

    function override(fn) {
        const _fn = window[fn];
        window[fn] = function(url, body, options) {
            if (fn == 'get') {
                options = body;
                body = null;
            }

            let cacheOffline = options && options.cacheOffline;
            if (options) delete options.cacheOffline;

            if ((Mobile.System.CONNECTIVITY && !cacheOffline) || !url.includes('http')) return fn == 'get' ? _fn(url, options) : _fn(url, body, options);
            
            let promise = Promise.create();

            let fileName = `${safe(url)}_${safe(options)}.json`;
            if (Mobile.System.CONNECTIVITY) {
                const FETCH = fn == 'get' ? _fn(url, options) : _fn(url, body, options);
                FETCH.then(data => {
                    Mobile.Files.write(fileName, data);
                    promise.resolve(data);
                }).catch(e => promise.reject(e));
            } else {
                if (!Mobile.System.CONNECTIVITY && cacheOffline && fn == 'post') {
                    if (cacheOffline) options.cacheOffline = true;
                    _offlineQueue.push({url, body, options});
                    promise.resolve('PENDING');
                    Mobile.Storage.set('sw_offline_queue', _offlineQueue);
                } else {
                    Mobile.Files.read(fileName).then(data => {
                        if (data) {
                            promise.resolve(data);
                        } else {
                            promise.reject('OFFLINE');
                        }
                    });
                }
            }

            return promise;
        }
    }

    
    function addListeners() {
        Mobile.Storage.get('sw_offline_queue', q => {
            if (q) _offlineQueue = q;
            if (Mobile.System.CONNECTIVITY && _offlineQueue.length) connectivity({connected: true});
        });

        _this.events.sub(Mobile.Events.INTERNET_STATUS, connectivity);
    }

    function connectivity(e) {
        if (e.connected) {
            _offlineQueue.forEach(obj => {
                post(obj.url, obj.body, obj.options);
            });

            _offlineQueue.length = 0;
            Mobile.Storage.set('sw_offline_queue', _offlineQueue);
        }
    }

    

}, 'static');
Mobile.Class(function Events() {
    var _this = this;

    this.ACTIVE_STATUS = 'mobile_active_status';
    this.RESIGN_ACTIVE = 'mobile_resign_active';
    this.NOTIFICATION = 'mobile_notification';
    this.DEEPLINK = 'mobile_deeplink';
    this.INTERNET_STATUS = 'mobile_internet_status';
    this.GEOLOCATION_STATUS = 'mobile_geo_status';
    this.GEOLOCATION_AUTH = 'mobile_geo_auth';
    this.GEOLOCATION_ERROR = 'mobile_geo_error';
    this.GEOLOCATION_UPDATE = 'mobile_geo_update';
    this.GEOLOCATION_HEADING = 'mobile_geo_heading';

}, 'Static');
Mobile.Class(function Files() {
    Inherit(this, Mobile.BaseModule);
    var _this = this;

    
    (function () {
        _this.init();
    })();

    

    
    this.write = function(file, content, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        if (typeof content !== 'string') content = JSON.stringify(content);
        this.send('writeFile', {file, content}, function(data) {
            if (callback) callback(data.success);
        });

        return promise;
    }

    this.read = function(file, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        this.send('readFile', {file}, function(data) {
            try {
                if (data.content && file.includes('json')) data.content = JSON.parse(data.content);
            } catch(e) {

            }
            callback(data.content);
        });

        return promise;
    }

    this.unlink = function(file, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        this.send('deleteFile', {file}, function(data) {
            if (callback) callback(data.success);
        });

        return promise;
    }

    this.getPath = function(file, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        this.send('getPath', {file}, function(data) {
            callback(data.path);
        });

        return promise;
    }

    this.download = function(url, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        var fileName = url.split('/');
        fileName = fileName[fileName.length-1];

        this.send('downloadFile', {url, fileName}, function(data) {
            callback(data.success);
        });

        return promise;
    }
}, 'Static');
Mobile.Class(function Geolocation() {
    Inherit(this, Mobile.BaseModule);
    var _this = this;

    this.COORDS = {};
    this.HEADING = {magnetic: 0, trueHeading: 0};

    this.BEST = 'ACCURACY_BEST';
    this.BEST_NAV = 'ACCURACY_BEST_NAV';
    this.NEAREST_TEN = 'ACCURACY_NEAREST_TEN';
    this.HUNDRED = 'ACCURACY_HUNDRED';
    this.KILOMETER = 'ACCURACY_KILOMETER';
    this.THREE_KILOMETER = 'ACCURACY_THREE_KILOMETER';

    
    (function () {
        getLastLocation();
    })();

    function getLastLocation() {
        _this.send('getLastLocation', data => {
            if (!data.error) {
                _this.COORDS.latitude = data.lat;
                _this.COORDS.longitude = data.lng;
                _this.events.fire(Mobile.Events.GEOLOCATION_UPDATE, _this.COORDS);
            }
        });
    }

    function handleStatus(e) {
        _this.events.fire(Mobile.Events.GEOLOCATION_STATUS, {type: e.locationStatus});
    }

    function handleAuth(e) {
        _this.ACTIVE = e.status == 'ALLOWED';
        _this.events.fire(Mobile.Events.GEOLOCATION_AUTH, {status: e.status});
    }

    function handleError(e) {
        _this.events.fire(Mobile.Events.GEOLOCATION_ERROR);
    }

    function handlePermission(e) {
        _this.ACTIVE = e.status == 'ALLOWED';
        _this.TYPE = e.type;
    }

    function handleUpdate(e) {
        _this.COORDS.latitude = e.lat;
        _this.COORDS.longitude = e.lng;
        _this.COORDS.altitude = e.altitude;
        _this.events.fire(Mobile.Events.GEOLOCATION_UPDATE, _this.COORDS);
    }

    function handleUpdateHeading(e) {
        _this.HEADING.magnetic = e.magneticHeading;
        _this.HEADING.trueHeading = e.trueHeading;
        _this.events.fire(Mobile.Events.GEOLOCATION_HEADING, _this.HEADING);
    }

    

    
    this.set('accuracy', function(val) {
        if (!val) throw 'Accuracy not defined!'
        this.send('setAccuracy', {accuracy: val || 'ACCURACY_BEST'});
    });

    this.set('distanceFilter', distance => {
        this.send('setDistanceFilter', {distance});
    });


    this.activate = function(always) {
        this.send('activate', {always: !!always});
    }

    this.requestPermission = function(always) {
        this.send('requestPermission', {always: !!always});
    }

    this.stop = function() {
        this.send('stop');
    }

    this.activateHeading = function() {
        this.send('activateHeading');
    }

    this.stopHeading = function() {
        this.send('stopHeading');
    }

    this.requestLocation = function() {
        getLastLocation();
        this.send('requestLocation');
    }

    this.checkPermission = function(callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;
        this.send('permission', function(data) {
            handlePermission(data);
            callback && callback({type: data.type, enabled: data.status == 'ALLOWED'});
        });
        return promise;
    }

    this.incoming = function(e) {
        switch (e.fn) {
            case "status": handleStatus(e); break;
            case "authorization": handleAuth(e); break;
            case "failError": handleError(e); break;
            case "permission": handlePermission(e); break;
            case "update": handleUpdate(e); break;
            case "updateHeading": handleUpdateHeading(e); break;
        }
    }
}, 'static');
Mobile.Class(function Notifications() {
    Inherit(this, Mobile.BaseModule);
    var _this = this;

    this.FIRED = 'mobile_notification_fired';

    
    (function () {
        _this.init();
    })();

    function firedNotification(data) {
        if (typeof data.userInfo === 'string' && data.userInfo.strpos('{')) data.userInfo = JSON.parse(data.userInfo);

        if (data.userInfo._time) {
            var latency = Date.now() - data.userInfo._time;
            if (latency < data.userInfo._scheduled + 100) return;
        }

        _this.events.fire(Mobile.Events.NOTIFICATION, {data: data.userInfo});
        _this.DATA = data.userInfo;
    }

    function handleDeeplink(data) {
        if (!data.path || !data.path.length) return;

        _this.events.fire(Mobile.Events.DEEPLINK, {path: data.path});
        _this.DEEPLINK = data.path;
    }

    

    
    this.enable = function() {
        this.send({fn: 'enable'});
    }

    this.localNotification = function(action, body, data = {}, time = 0) {
        data._time = Date.now();
        data._scheduled = time * 1000;
        this.send('localNotification', {body, time, action, localData: data});
    }

    this.alert = function(title, message, actions, config, callback) {
        if (actions && !Array.isArray(actions)) {
            config = actions;
            actions = null;
        }

        if (typeof config === 'function') {
            callback = config;
            config = null;
        }

        var promise = Promise.create();

        if (!callback) callback = promise.resolve;


        actions = actions || ['Close']; 
        config = config || {};
        if (!config.style) config.style = 'alert'; 

        if (Device.system.os == 'android') {
            for (var key in actions) {
                if (typeof actions[key] === 'string') {
                    actions[key] = {name: actions[key], style: 'normal'};
                }
            }
        }

        this.send('alert', {title: title || 'EMPTY TITLE', message: message || 'EMPTY MESSAGE', config, actions}, function(e) {
            callback && callback(e.title);
        });

        if (!Mobile.NativeCore.active) {
            promise.resolve(actions[0]);
        }

        return promise;
    }

    this.incoming = function(data) {
        switch (data.fn) {
            case 'fired': firedNotification(data); break;
            case 'deeplink': handleDeeplink(data); break;
        }
    }

}, 'static');
Mobile.Class(function Social() {
    Inherit(this, Mobile.BaseModule);
    var _this = this;

    
    (function () {
        _this.init();
    })();

    

    
    this.sharePrompt = function(text, url, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        this.send('prompt', {text, url}, callback);

        return promise;
    }

    this.shareMail = function(params, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        params = params || {};
        if (!params.subject) params.subject = '';
        if (!params.body) params.body = '';

        this.send('email', {params}, callback);

        return promise;
    }

}, 'Static');
Mobile.Class(function System() {
    Inherit(this, Mobile.BaseModule);
    var _this = this;

    var _reachable = {fn: 'reachability'};

    this.ANY = 0;
    this.LANDSCAPE = 1;
    this.PORTRAIT = 2;
    this.DARK_STATUS = 0;
    this.LIGHT_STATUS = 1;
    this.CONNECTIVITY = typeof navigator.onLine === 'boolean' ? navigator.onLine : true;

    this.background = false;

    
    (function () {
        _this.init();
        updateNative();
        checkConnection();
        Hydra.ready(domReady);
    })();

    function domReady() {
        _this.send({fn: 'domReady'});

        if (!Device.mobile.native && typeof navigator.onLine === 'boolean') {
            window.addEventListener('online', progressiveOffline);
            window.addEventListener('offline', progressiveOffline);
        }
    }

    function updateNative() {
        if (Mobile.NativeCore.active) {
            window.open = function (url, target) {
                _this.send({fn: 'openURL', params: url});
            }
        }
    }

    function checkConnection() {
        _this.send(_reachable, connectionStatus);
        setTimeout(checkConnection, 2000);
    }

    function deviceInfo(data) {
        delete data.jsModule;
        delete data.fn;

        for (var i in data) {
            _this[i] = data[i];
        }
    }

    function activate() {
        _this.events.fire(Mobile.Events.ACTIVE_STATUS, {type: 'active'});
        _this.background = false;
    }

    function deactivate() {
        _this.events.fire(Mobile.Events.ACTIVE_STATUS, {type: 'inactive'});
        _this.background = true;
    }

    
    function connectionStatus(e) {
        let connectivity = _this.CONNECTIVITY;
        _this.CONNECTIVITY = e.reachable;

        if (connectivity && !e.reachable) {
            _this.events.fire(Mobile.Events.INTERNET_STATUS, {connected: false});
        } else if (e.reachable && !connectivity) {
            _this.events.fire(Mobile.Events.INTERNET_STATUS, {connected: true});
        }
    }

    function progressiveOffline() {
        var reachable = navigator.onLine

        _this.CONNECTIVITY = reachable;

        if (_this.CONNECTIVITY && !reachable) {
            _this.events.fire(Mobile.Events.INTERNET_STATUS, {connected: false});
        } else if (reachable && !_this.CONNECTIVITY) {
            _this.events.fire(Mobile.Events.INTERNET_STATUS, {connected: true});
        }
    }

    
    this.set('hideStatusBar', function(bool) {
        this.send('toggleStatusBar', {params: !bool});
    });

    this.set('statusBarColor', function(c) {
        function hexToInt(rrggbb) {
            var bbggrr = rrggbb.substr(4, 2) + rrggbb.substr(2, 2) + rrggbb.substr(0, 2);
            return parseInt(bbggrr, 16);
        }

        this.send('statusBarColor', {params: Mobile.os == 'iOS' ? hexToInt(c) : c});
    });

    this.set('statusBarText', function(val) {
        if (typeof val !== 'number') throw 'Mobile.System.statusBarText must be a number';
        this.send('statusBarText', {params: val});
    });

    this.set('orientation', function(val) {
        this.send('orientation', {params: val});
    });

    this.incoming = function(data) {
        switch (data.fn) {
            case 'deviceInfo': deviceInfo(data); break;
            case 'appActive': activate(); break;
            case 'appInBackground': deactivate(); break;
            case 'appTerminating': deactivate(); break;
            case 'appResignActive': deactivate(); break;
            case '_error': throw data.message; break;
        }
    }

    this.vibrate = function(time) {
        this.send('vibrate', {params: time});
    }

    this.hideKeyboard = function() {
        this.send('hideKeyboard');
    }

    this.detectDevice = function(str) {
        if (!_this.model) return false;
        return _this.model.toLowerCase().includes(str) || _this.name.toLowerCase().includes(str);
    }

    this.openSettings = function() {
        this.send('openSettings');
    }
}, 'Static');
Mobile.Class(function Storage() {
    Inherit(this, Mobile.BaseModule);
    const _this = this;

    
    this.set = function(key, value) {
        if (Mobile.NativeCore.active) this.send('set', {key, value: JSON.stringify(value)});
        else window.Storage.set(key, value);
    }

    this.get = function(key, callback) {
        let promise = Promise.create();
        if (callback) promise.then(callback);

        if (Mobile.NativeCore.active) {
            this.send('get', {key}, data => {
                promise.resolve(JSON.parse(data.data));
            });
        } else {
            promise.resolve(window.Storage.get(key));
        }

        return promise;
    }
}, 'static');
