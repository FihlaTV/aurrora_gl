

if (typeof(console) === 'undefined') {
    window.console = {};
    console.log = console.error = console.info = console.debug = console.warn = console.trace = function() {};
}

window.performance = (function() {
    if (window.performance && window.performance.now) return window.performance;
    else return Date;
})();

Date.now = Date.now || function() { return +new Date; };

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            (function() {
                const start = Date.now();
                return function(callback) {
                    window.setTimeout(() => callback(Date.now() - start), 1000 / 60);
                }
            })();
    })();
}


window.defer = window.requestAnimationFrame;


window.clearTimeout = (function() {
    const _clearTimeout = clearTimeout;
    return function(ref) {

        
        if (window.Timer) return Timer.__clearTimeout(ref) || _clearTimeout(ref);
        return _clearTimeout(ref);
    }
})();


window.requestIdleCallback = (function() {
    const _requestIdleCallback = window.requestIdleCallback;
    return function(callback, max) {
        if (_requestIdleCallback) {
            return _requestIdleCallback(callback, max ? {timeout: max} : null);
        }
        return defer(() => {
            callback({didTimeout: false});
        }, 0);
    }
})();

window.onIdle = window.requestIdleCallback;

if (typeof Float32Array == 'undefined') Float32Array = Array;


Math.sign = function(x) {
    x = +x; 
    if (x === 0 || isNaN(x)) return Number(x);
    return x > 0 ? 1 : -1;
};


Math._round = Math.round;
Math.round = function(value, precision = 0) {
    let p = Math.pow(10, precision);
    return Math._round(value * p) / p;
};


Math._random = Math.random;
Math.rand = Math.random = function(min, max, precision = 0) {
    if (typeof min === 'undefined') return Math._random();
    if (min === max) return min;

    min = min || 0;
    max = max || 1;

    return Math.round((min + Math._random() * (max - min)), precision);
};



Math.degrees = function(radians) {
    return radians * (180 / Math.PI);
};


Math.radians = function(degrees) {
    return degrees * (Math.PI / 180);
};


Math.clamp = function(value, min = 0, max = 1) {
    return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
};


Math.map = Math.range = function(value, oldMin = -1, oldMax = 1, newMin = 0, newMax = 1, isClamp) {
    const newValue = (((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
    if (isClamp) return Math.clamp(newValue, Math.min(newMin, newMax), Math.max(newMin, newMax));
    return newValue;
};


Math.mix = function(a, b, alpha) {
    return a * (1.0 - alpha) + b * alpha;
};


Math.step = function(edge, value) {
    return (value < edge) ? 0 : 1;
};


Math.smoothStep = function(min, max, value) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
};


Math.fract = function(value) {
    return value - Math.floor(value);
};


Math.mod = function(value, n) {
    return ((value % n) + n) % n;
};


Array.prototype.shuffle = function() {
    let i = this.length - 1;
    let temp, r;
    while (i !== 0) {
        r = Math.random(0, i, 0);
        i -= 1;
        temp = this[i];
        this[i] = this[r];
        this[r] = temp;
    }
    return this;
};

Array.storeRandom = function(arr) {
    arr.randomStore = [];
};


Array.prototype.random = function(range) {
    let value = Math.random(0, this.length - 1);
    if (arguments.length && !this.randomStore) Array.storeRandom(this);
    if (!this.randomStore) return this[value];
    if (range > this.length - 1) range = this.length;
    if (range > 1) {
        while (!!~this.randomStore.indexOf(value)) if ((value += 1) > this.length - 1) value = 0;
        this.randomStore.push(value);
        if (this.randomStore.length >= range) this.randomStore.shift();
    }
    return this[value];
};


Array.prototype.remove = function(element) {
    if (!this.indexOf) return;
    const index = this.indexOf(element);
    if (!!~index) return this.splice(index, 1);
};


Array.prototype.last = function() {
    return this[this.length - 1]
};

window.Promise = window.Promise || {};


Promise.create = function() {
    const promise = new Promise((resolve, reject) => {
        this.temp_resolve = resolve;
        this.temp_reject = reject;
    });
    promise.resolve = this.temp_resolve;
    promise.reject = this.temp_reject;
    delete this.temp_resolve;
    delete this.temp_reject;
    return promise;
};


String.prototype.includes = function(str) {
    if (!Array.isArray(str)) return !!~this.indexOf(str);
    for (let i = str.length - 1; i >= 0; i--) {
        if (!!~this.indexOf(str[i])) return true;
    }
    return false;
};

String.prototype.strpos = function(str) {
    console.warn('strpos deprecated: use .includes()');
    return this.includes(str);
};



String.prototype.clip = function(num, end) {
    return this.length > num ? this.slice(0, num) + end : this;
};


String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


String.prototype.replaceAll = function(find, replace) {
    return this.split(find).join(replace);
};


if (!window.fetch || (window.nativeHydra && !window._AURA_)) window.fetch = function(url, options) {
    options = options || {};
    const promise = Promise.create();
    const request = new XMLHttpRequest();

    request.open(options.method || 'get', url);

    for (let i in options.headers) {
        request.setRequestHeader(i, options.headers[i]);
    }

    

    request.onload = () => {
        promise.resolve(response());
    };

    request.onerror = promise.reject;

    request.send(options.body);

    function response() {
        let keys = [],
            all = [],
            headers = {},
            header;

        request.getAllResponseHeaders().replace(/^(.*?):\s*([\s\S]*?)$/gm, (m, key, value) => {
            keys.push(key = key.toLowerCase());
            all.push([key, value]);
            header = headers[key];
            headers[key] = header ? `${header},${value}` : value;
        });

        return {
            ok: (request.status/200|0) == 1,		
            status: request.status,
            statusText: request.statusText,
            url: request.responseURL,
            clone: response,

            text: () => Promise.resolve(request.responseText),
            json: () => Promise.resolve(request.responseText).then(JSON.parse),
            xml: () => Promise.resolve(request.responseXML),
            blob: () => Promise.resolve(new Blob([request.response])),

            headers: {
                keys: () => keys,
                entries: () => all,
                get: n => headers[n.toLowerCase()],
                has: n => n.toLowerCase() in headers
            }
        };
    }
    return promise;
};


window.get = function(url, options = {credentials: 'same-origin'}) {
    let promise = Promise.create();
    options.method = 'GET';

    fetch(url, options).then(handleResponse).catch(promise.reject);

    function handleResponse(e) {
        if (!e.ok) return promise.reject(e);
        e.text().then(text => {
            if (text.charAt(0).includes(['[', '{'])) {

                
                try {
                    promise.resolve(JSON.parse(text));
                } catch (err) {
                    promise.resolve(text);
                }
            } else {
                promise.resolve(text);
            }
        });
    }

    return promise;
};


window.post = function(url, body, options = {}) {
    let promise = Promise.create();
    options.method = 'POST';
    options.body = JSON.stringify(body);

    fetch(url, options).then(handleResponse).catch(promise.reject);

    function handleResponse(e) {
        if (!e.ok) return promise.reject(e);
        e.text().then(text => {
            if (text.charAt(0).includes(['[', '{'])) {

                
                try {
                    promise.resolve(JSON.parse(text));
                } catch (err) {
                    promise.resolve(text);
                }
            } else {
                promise.resolve(text);
            }
        });
    }

    return promise;
};



window.Class = function(_class, _type, _static) {
    const _this = this || window;

    
    const _name = _class.name || _class.toString().match(/function ?([^\(]+)/)[1];

    
    if (typeof _type === 'function') {
        _static = _type;
        _type = null;
    }

    _type = (_type || '').toLowerCase();

    
    if (!_type) {
        _this[_name] = _class;

        
        _static && _static();
    } else {

        
        if (_type == 'static') {
            _this[_name] = new _class();

        
        } else if (_type == 'singleton') {
            _this[_name] = _class;

            (function() {
                let _instance;

                _this[_name].instance = function(a, b, c) {
                    if (!_instance) _instance = new _class(a, b, c);
                    return _instance;
                };
            })();

            
            _static && _static();
        }
    }

    
    if (this && this !== window) this[_name]._namespace = this.__namespace;
};


window.Inherit = function(child, parent) {
    const args = [].slice.call(arguments, 2);
    parent.apply(child, args);

    
    const save = {};
    for (let method in child) {
        save[method] = child[method];
    }

    
    defer(() => {
        for (let method in child) {
            if (save[method] && child[method] !== save[method]) {
                
                child['_' + method] = save[method];
            }
        }
    });
};


window.Namespace = function(obj) {
    if (typeof obj === 'string') {
        window[obj] = {Class, __namespace: obj};
    } else {
        obj.Class = Class;
        obj.__namespace = obj.constructor.name || obj.constructor.toString().match(/function ([^\(]+)/)[1];
    }
};


window.Global = {};


window.THREAD = false;



Class(function Hydra() {
    const _readyPromise = Promise.create();

    this.HASH = window.location.hash.slice(1);
    this.LOCAL = !window._BUILT_ && (location.hostname.indexOf('local') > -1 || location.hostname.split('.')[0] == '10' || location.hostname.split('.')[0] == '192');

    (function() {
        initLoad();
    })();

    function initLoad() {
        if (!document || !window) return setTimeout(initLoad, 1);
        if (window._NODE_) return setTimeout(loaded, 1);

        if (window._AURA_) {
            if (!window.Main) return setTimeout(initLoad, 1);
            else return setTimeout(loaded, 1);
        }

        window.addEventListener('load', loaded, false);
    }

    function loaded() {
        window.removeEventListener('load', loaded, false);
        _readyPromise.resolve();

        
        if (window.Main) {
            if (window._AURA_) {
                setTimeout(() => Hydra.Main = new window.Main(), 50);
                return;
            }

            _readyPromise.then(() => Hydra.Main = new window.Main());
        }
    }

    
    this.__triggerReady = function() {
        loaded();
    };

    
    this.ready = function(callback) {
        if (!callback) return _readyPromise;
        _readyPromise.then(callback);
    };

}, 'Static');


Class(function Utils() {

    
    this.query = function(key) {
        const str = decodeURI(window.location.search.replace(new RegExp('^(?:.*[&\\?]' + encodeURI(key).replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1'));
        if (!str.length || str == '0' || str == 'false') return location.search.includes(key);
        return str;
    };

    

    
    this.getConstructorName = function(obj) {
        if (!obj) return obj;
        return obj.constructor.name || obj.constructor.toString().match(/function ([^\(]+)/)[1];
    };

    
    this.nullObject = function(object) {
        if (object.destroy || object.div) {
            for (var key in object) {
                if (typeof object[key] !== 'undefined') object[key] = null;
            }
        }
        return null;
    };

    
    this.cloneObject = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    
    this.headsTails = function(n0, n1) {
        return Math.random(0, 1) ? n1 : n0;
    };

    
    this.mergeObject = function() {
        var obj = {};
        for (var i = 0; i < arguments.length; i++) {
            var o = arguments[i];
            for (var key in o) {
                obj[key] = o[key];
            }
        }

        return obj;
    };

    

    
    this.timestamp = function() {
        var num = Date.now() + Math.random(0, 99999, 0);
        return num.toString();
    };

    
    this.randomColor = function() {
        var color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        if (color.length < 7) color = this.randomColor();
        return color;
    };

    
    this.numberWithCommas = function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    
    this.padInt = function(num, digits, isLimit) {
        if (isLimit) num = Math.min(num, Math.pow(10, digits) - 1);
        let str = Math.floor(num).toString();
        return Math.pow(10, Math.max(0, digits - str.length)).toString().slice(1) + str;
    };


}, 'Static');


Class(function Render() {
    const _this = this;
    const _render = [];
    let _last = performance.now();
    let _skipLimit = 200;

    var rAF = requestAnimationFrame;

    (function() {
        if (THREAD) return;
        rAF(render);
    })();

    function render(tsl) {
        let delta = tsl - _last;
        delta = Math.min(_skipLimit, delta);
        _last = tsl;

        _this.TIME = tsl;
        _this.DELTA = delta;

        for (let i = _render.length - 1; i >= 0; i--) {
            var callback = _render[i];
            if (!callback) {
                _render.remove(callback);
                continue;
            }
            if (callback.fps) {
                if (tsl - callback.last < 1000 / callback.fps) continue;
                callback(++callback.frame);
                callback.last = tsl;
                continue;
            }
            callback(tsl, delta);
        }

        if (!THREAD && !_this.isPaused) rAF(render);
    }

    
    this.start = function(callback, fps) {
        if (fps) {
            callback.fps = fps;
            callback.last = -Infinity;
            callback.frame = -1;
        }

        
        if (!~_render.indexOf(callback)) _render.unshift(callback);
    };

    
    this.stop = function(callback) {
        _render.remove(callback);
    };

    
    this.tick = function() {
        if (!THREAD) return;
        this.TIME = performance.now();
        render(this.TIME);
    };

    
    this.Worker = function(_callback, _budget = 4) {
        Inherit(this, Component);
        let _scope = this;
        let _elapsed = 0;
        this.startRender(loop);
        function loop() {
            while (_elapsed < _budget) {
                if (_scope.dead) return;
                const start = performance.now();
                _callback && _callback();
                _elapsed += performance.now() - start;
            }
            _elapsed = 0;
        }

        this.stop = function() {
            this.dead = true;
            this.stopRender(loop);
            
        }

        this.pause = function() {
            this.stopRender(loop);
        }

        this.resume = function() {
            this.startRender(loop);
        }
    };

    
    this.pause = function() {
        _this.isPaused = true;
    };

    
    this.resume = function() {
        if (!_this.isPaused) return;
        _this.isPaused = false;
        rAF(render);
    };

    
    this.useRAF = function(raf) {
        rAF = raf;
    }

}, 'Static');



Class(function Timer() {
    const _this = this;
    const _callbacks = [];
    const _discard = [];

    (function() {
        Render.start(loop);
    })();


    function loop(t, delta) {
        for (let i = _discard.length - 1; i >= 0; i--) {
            let obj = _discard[i];
            obj.callback = null;
            _callbacks.remove(obj);
        }
        if (_discard.length) _discard.length = 0;

        for (let i = _callbacks.length - 1; i >= 0; i--) {
            let obj = _callbacks[i];
            if (!obj) {
                _callbacks.remove(obj);
                continue;
            }

            if ((obj.current += delta) >= obj.time) {
                obj.callback && obj.callback.apply(this, obj.args);
                _discard.push(obj);
            }
        }
    }

    function find(ref) {
        for (let i = _callbacks.length - 1; i > -1; i--) if (_callbacks[i].ref == ref) return _callbacks[i];
    }

    

    

    
    this.__clearTimeout = function(ref) {
        const obj = find(ref);
        if (!obj) return false;
        obj.callback = null;
        _callbacks.remove(obj);
        return true;
    };

    
    this.create = function(callback, time) {
        if (window._NODE_) return setTimeout(callback, time);
        const obj = {
            time: Math.max(1, time || 1),
            current: 0,
            ref: Utils.timestamp(),
            callback: callback,
            args: [].slice.call(arguments, 2),
        };
        _callbacks.unshift(obj);
        return obj.ref;
    };

    
    window.defer = this.defer = function(callback) {
        if (!callback) {
            let promise = Promise.create();
            _this.create(promise.resolve, 1);
            return promise;
        }

        _this.create(callback, 1);
    };

}, 'static');


Class(function Events() {
    this.events = {};

    const _e = {};
    const _linked = [];
    let _emitter;

    
    this.events.sub = function(obj, evt, callback) {
        if (typeof obj !== 'object') {
            callback = evt;
            evt = obj;
            obj = null;
        }

        if (!obj) {
            Events.emitter._addEvent(evt, !!callback.resolve ? callback.resolve : callback, this);
            return callback;
        }

        let emitter = obj.events.emitter();
        emitter._addEvent(evt, !!callback.resolve ? callback.resolve : callback, this);
        emitter._saveLink(this);
        _linked.push(emitter);

        return callback;
    };

    
    this.events.unsub = function(obj, evt, callback) {
        if (typeof obj !== 'object') {
            callback = evt;
            evt = obj;
            obj = null;
        }

        if (!obj) return Events.emitter._removeEvent(evt, !!callback.resolve ? callback.resolve : callback);
        obj.events.emitter()._removeEvent(evt, !!callback.resolve ? callback.resolve : callback);
    };

    
    this.events.fire = function(evt, obj, isLocalOnly) {
        obj = obj || _e;
        obj.target = this;
        Events.emitter._check(evt);
        if (_emitter && _emitter._fireEvent(evt, obj)) return;
        if (isLocalOnly) return;
        Events.emitter._fireEvent(evt, obj);
    };

    
    this.events.bubble = function(obj, evt) {
        let _this = this;
        _this.sub(obj, evt, e => _this.fire(evt, e));
    };

    
    this.events.destroy = function() {
        Events.emitter._destroyEvents(this);
        if (_linked) _linked.forEach(emitter => emitter._destroyEvents(this));
        if (_emitter && _emitter.links) _emitter.links.forEach(obj => obj.events && obj.events._unlink(_emitter));
        return null;
    };

    
    this.events.emitter = function() {
        if (!_emitter) _emitter = Events.emitter.createLocalEmitter();
        return _emitter;
    };

    
    this.events._unlink = function(emitter) {
        _linked.remove(emitter);
    };
}, () => {

    
    Events.emitter = new Emitter();

    Events.VISIBILITY = 'hydra_visibility';
    Events.HASH_UPDATE = 'hydra_hash_update';
    Events.COMPLETE = 'hydra_complete';
    Events.PROGRESS = 'hydra_progress';
    Events.UPDATE = 'hydra_update';
    Events.LOADED = 'hydra_loaded';
    Events.END = 'hydra_end';
    Events.FAIL = 'hydra_fail';
    Events.SELECT = 'hydra_select';
    Events.ERROR = 'hydra_error';
    Events.READY = 'hydra_ready';
    Events.RESIZE = 'hydra_resize';
    Events.CLICK = 'hydra_click';
    Events.HOVER = 'hydra_hover';
    Events.MESSAGE = 'hydra_message';
    Events.ORIENTATION = 'orientation';
    Events.BACKGROUND = 'background';
    Events.BACK = 'hydra_back';
    Events.PREVIOUS = 'hydra_previous';
    Events.NEXT = 'hydra_next';
    Events.RELOAD = 'hydra_reload';
    Events.FULLSCREEN = 'hydra_fullscreen';

    const _e = {};

    function Emitter() {
        const prototype = Emitter.prototype;
        this.events = [];

        if (typeof prototype._check !== 'undefined') return;
        prototype._check = function(evt) {
            if (typeof evt == 'undefined') throw 'Undefined event';
        };

        prototype._addEvent = function(evt, callback, object) {
            this._check(evt);
            this.events.push({evt, object, callback});
        };

        prototype._removeEvent = function(eventString, callback) {
            this._check(eventString);

            let _this = this;
            let marked = false;

            for (let i = this.events.length - 1; i >= 0; i--) {
                if (this.events[i].evt == eventString && this.events[i].callback == callback) {
                    this.events[i].markedForDeletion = true;
                    marked = true;
                }
            }
            if (marked) defer(() => _this._sweepEvents());
        };

        prototype._sweepEvents = function() {
            for (let i = 0; i < this.events.length; i++) {
                if (this.events[i].markedForDeletion) this.events.remove(this.events[i]);
            }
        }

        prototype._fireEvent = function(eventString, obj) {
            if (this._check) this._check(eventString);
            obj = obj || _e;
            let called = false;
            for (let i = 0; i < this.events.length; i++) {
                let evt = this.events[i];
                if (evt.evt == eventString && !evt.markedForDeletion) {
                    evt.callback(obj);
                    called = true;
                }
            }
            return called;
        };

        prototype._destroyEvents = function(object) {
            for (var i = this.events.length - 1; i >= 0; i--) {
                if (this.events[i].object == object) this.events.splice(i, 1)[0] = null;
            }
        };

        prototype._saveLink = function(obj) {
            if (!this.links) this.links = [];
            if (!~this.links.indexOf(obj)) this.links.push(obj);
        };

        prototype.createLocalEmitter = function() {
            return new Emitter();
        };
    }

    
    Hydra.ready(() => {

        
        (function() {
            let _lastTime = performance.now();
            let _last;

            Timer.create(addVisibilityHandler, 250);

            function addVisibilityHandler() {
                let hidden, eventName;
                [
                    ['msHidden', 'msvisibilitychange'],
                    ['webkitHidden', 'webkitvisibilitychange'],
                    ['hidden', 'visibilitychange']
                ].forEach(d => {
                    if (typeof document[d[0]] !== 'undefined') {
                        hidden = d[0];
                        eventName = d[1];
                    }
                });

                if (!eventName) {
                    const root = Device.browser == 'ie' ? document : window;
                    root.onfocus = onfocus;
                    root.onblur = onblur;
                    return;
                }

                document.addEventListener(eventName, () => {
                    const time = performance.now();
                    if (time - _lastTime > 10) {
                        if (document[hidden] === false) onfocus();
                        else onblur();
                    }
                    _lastTime = time;
                });
            }

            function onfocus() {
                if (_last != 'focus') Events.emitter._fireEvent(Events.VISIBILITY, {type: 'focus'});
                _last = 'focus';
            }

            function onblur() {
                if (_last != 'blur') Events.emitter._fireEvent(Events.VISIBILITY, {type: 'blur'});
                _last = 'blur';
            }
        })();

        window.Stage = window.Stage || {};
        updateStage();

        window.onresize = function() {
            updateStage();
            Events.emitter._fireEvent(Events.RESIZE);
        };

        window.onorientationchange = window.onresize;

        
        defer(window.onresize);

        function updateStage() {
            Stage.width = document.body.clientWidth || document.documentElement.offsetWidth || window.innerWidth;
            Stage.height = document.body.clientHeight || document.documentElement.offsetHeight || window.innerHeight;
        }
    });
});


Class(function Dispatch() {
    const _instances = {};

    
    this.registerInstance = function(object) {
        let ref = Utils.getConstructorName(object);
        _instances[ref] = object;
        object.removeDispatch = function() {
            delete _instances[ref];
        };
    };

    
    this.lookup = function(_class) {
        let name = _class.toString().match(/function ([^\(]+)/)[1];

        return _instances[name] || console.error(`No instance ${name} found`);
    };

}, 'static');


Class(function Device() {
    var _this = this;

    
    this.agent = navigator.userAgent.toLowerCase();

    
    this.detect = function(match) {
        return this.agent.includes(match)
    };

    
    this.touchCapable = !!('ontouchstart' in window);

    
    this.pixelRatio = window.devicePixelRatio;

    
    

    this.system = {};

    
    this.system.retina = window.devicePixelRatio > 1;

    
    this.system.webworker = typeof window.Worker !== 'undefined';

    
    this.system.offline = typeof window.applicationCache !== 'undefined';

    
    if (!window._NODE_) this.system.geolocation = typeof navigator.geolocation !== 'undefined';

    
    if (!window._NODE_) this.system.pushstate = typeof window.history.pushState !== 'undefined';

    
    this.system.webcam = !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia || navigator.msGetUserMedia);

    
    this.system.language = window.navigator.userLanguage || window.navigator.language;

    
    this.system.webaudio = typeof window.AudioContext !== 'undefined';

    
    this.system.vr = (function() {
        if (!navigator.getVRDisplays) return false;
        navigator.getVRDisplays().then(displays => {
            _this.system.vr = displays.length > 0;
        });
    })();

    
    try {
        this.system.localStorage = typeof window.localStorage !== 'undefined';
    } catch (e) {
        this.system.localStorage = false;
    }

    
    this.system.fullscreen = document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;

    
    this.system.os = (function() {
        if (_this.detect(['ipad', 'iphone'])) return 'ios';
        if (_this.detect(['android', 'kindle'])) return 'android';
        if (_this.detect(['blackberry'])) return 'blackberry';
        if (_this.detect(['mac os'])) return 'mac';
        if (_this.detect(['windows', 'iemobile'])) return 'windows';
        if (_this.detect(['linux'])) return 'linux';
        return 'unknown';
    })();

    
    this.system.version = (function() {
        try {
            if (_this.system.os == 'ios') {
                var num = _this.agent.split('os ')[1].split('_');
                var main = num[0];
                var sub = num[1].split(' ')[0];
                return Number(main + '.' + sub);
            }
            if (_this.system.os == 'android') {
                var version = _this.agent.split('android ')[1].split(';')[0];
                if (version.length > 3) version = version.slice(0, -2);
                if (version.charAt(version.length-1) == '.') version = version.slice(0, -1);
                return Number(version);
            }
            if (_this.system.os == 'blackberry') {
                if (_this.agent.includes('rv:11')) return 11;
                return Number(_this.agent.split('windows phone ')[1].split(';')[0]);
            }
        } catch(e) {}
        return -1;
    })();

    
    this.system.browser = (function() {
        if (_this.system.os == 'ios') {
            if (_this.detect(['twitter', 'fbios'])) return 'social';
            if (_this.detect(['crios'])) return 'chrome';
            if (_this.detect(['safari'])) return 'safari';
            return 'unknown';
        }
        if (_this.system.os == 'android') {
            if (_this.detect(['twitter', 'fb', 'facebook'])) return 'social';
            if (_this.detect(['chrome'])) return 'chrome';
            if (_this.detect(['firefox'])) return 'firefox';
            return 'browser';
        }
        if (_this.detect(['msie'])) return 'ie';
        if (_this.detect(['trident']) && _this.detect(['rv:'])) return 'ie';
        if (_this.detect(['windows']) && _this.detect(['edge'])) return 'ie';
        if (_this.detect(['chrome'])) return 'chrome';
        if (_this.detect(['safari'])) return 'safari';
        if (_this.detect(['firefox'])) return 'firefox';

        
        
        return 'unknown';
    })();

    
    this.system.browserVersion = (function() {
        try {
            if (_this.system.browser == 'chrome') return Number(_this.agent.split('chrome/')[1].split('.')[0]);
            if (_this.system.browser == 'firefox') return Number(_this.agent.split('firefox/')[1].split('.')[0]);
            if (_this.system.browser == 'safari') return Number(_this.agent.split('version/')[1].split('.')[0].split('.')[0]);
            if (_this.system.browser == 'ie') {
                if (_this.detect(['msie'])) return Number(_this.agent.split('msie ')[1].split('.')[0]);
                if (_this.detect(['rv:'])) return Number(_this.agent.split('rv:')[1].split('.')[0]);
                return Number(_this.agent.split('edge/')[1].split('.')[0]);
            }
        } catch(e) {
            return -1;
        }
    })();

    
    

    
    this.mobile = !window._NODE_ && (!!(('ontouchstart' in window) || ('onpointerdown' in window)) && this.detect(['ios', 'iphone', 'ipad', 'windows phone', 'android', 'blackberry'])) ? {} : false;
    if (this.mobile && this.detect(['windows']) && !this.detect(['touch'])) this.mobile = false;
    if (this.mobile) {

        
        this.mobile.tablet = Math.max(window.screen ? screen.width : window.innerWidth, window.screen ? screen.height : window.innerHeight) > 1000;

        
        this.mobile.phone = !this.mobile.tablet;

        
        this.mobile.pwa = (function() {
            if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
            if (window.navigator.standalone) return true;
            return false;
        })();

        
        Hydra.ready(() => {
            _this.mobile.native = (function() {
                if (Mobile.NativeCore && Mobile.NativeCore.active) return true;
                if (window._AURA_) return true;
                return false;
            })();
        });
    }

    
    

    this.media = {};

    
    this.media.audio = (function() {
        if (!!document.createElement('audio').canPlayType) {
            return _this.detect(['firefox', 'opera']) ? 'ogg' : 'mp3';
        } else {
            return false;
        }
    })();

    
    this.media.video = (function() {
        var vid = document.createElement('video');
        if (!!vid.canPlayType) {
            if (Device.mobile) return 'mp4';
            if (_this.system.browser == 'chrome') return 'webm';
            if (_this.system.browser == 'firefox' || _this.system.browser == 'opera') {
                if (vid.canPlayType('video/webm; codecs="vorbis,vp8"')) return 'webm';
                return 'ogv';
            }
            return 'mp4';
        } else {
            return false;
        }
    })();

    
    this.media.webrtc = !!(window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.msRTCPeerConnection || window.oRTCPeerConnection || window.RTCPeerConnection);

    
    

    this.graphics = {};

    
    this.graphics.webgl = (function() {
        Object.defineProperty(_this.graphics, 'webgl', {
           get: () => {
               if (window._AURA_) {
                   _this.graphics._webglContext = {detect: _ => {
                       return false;
                   }};
                   return _this.graphics._webglContext;
               }

               if (_this.graphics._webglContext) return _this.graphics._webglContext;

               try {
                   const names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
                   const canvas = document.createElement('canvas');
                   let gl;
                   for (let i = 0; i < names.length; i++) {
                       gl = canvas.getContext(names[i]);
                       if (gl) break;
                   }

                   let info = gl.getExtension('WEBGL_debug_renderer_info');
                   let output = {};
                   if (info) {
                       let gpu = info.UNMASKED_RENDERER_WEBGL;
                       output.gpu = gl.getParameter(gpu).toLowerCase();
                   }

                   output.renderer = gl.getParameter(gl.RENDERER).toLowerCase();
                   output.version = gl.getParameter(gl.VERSION).toLowerCase();
                   output.glsl = gl.getParameter(gl.SHADING_LANGUAGE_VERSION).toLowerCase();
                   output.extensions = gl.getSupportedExtensions();

                   output.detect = function(matches) {
                       if (output.gpu && output.gpu.toLowerCase().includes(matches)) return true;
                       if (output.version && output.version.toLowerCase().includes(matches)) return true;

                       for (let i = 0; i < output.extensions.length; i++) {
                           if (output.extensions[i].toLowerCase().includes(matches)) return true;
                       }
                       return false;
                   };

                   _this.graphics._webglContext = output;
                   return output;
               } catch(e) {
                   return false;
               }
           },

            set: v => {
               
            }
        });
    })();

    
    this.graphics.canvas = (function() {
        var canvas = document.createElement('canvas');
        return canvas.getContext ? true : false;
    })();

    
    

    const checkForStyle = (function() {
        let _tagDiv;
        return function (prop) {
            _tagDiv = _tagDiv || document.createElement('div');
            const vendors = ['Khtml', 'ms', 'O', 'Moz', 'Webkit']
            if (prop in _tagDiv.style) return true;
            prop = prop.replace(/^[a-z]/, val => {return val.toUpperCase()});
            for (let i = vendors.length - 1; i >= 0; i--) if (vendors[i] + prop in _tagDiv.style) return true;
            return false;
        }
    })();

    this.styles = {};

    
    this.styles.filter = checkForStyle('filter');

    
    this.styles.blendMode = checkForStyle('mix-blend-mode');

    
    

    this.tween = {};

    
    this.tween.transition = checkForStyle('transition');

    
    this.tween.css2d = checkForStyle('transform');

    
    this.tween.css3d = checkForStyle('perspective');

}, 'Static');


Class(function Component() {
    Inherit(this, Events);
    const _this = this;
    const _setters = {};
    const _flags = {};
    const _timers = [];
    const _loops = [];

    this.classes = {};

    function defineSetter(_this, prop) {
        _setters[prop] = {};
        Object.defineProperty(_this, prop, {
            set: function(v) {
                if (_setters[prop] && _setters[prop].s) _setters[prop].s.call(_this, v);
                v = null;
            },

            get: function() {
                if (_setters[prop] && _setters[prop].g) return _setters[prop].g.apply(_this);
            }
        });
    }

    
    this.set = function(prop, callback) {
        if (!_setters[prop]) defineSetter(this, prop);
        _setters[prop].s = callback;
    };

    
    this.get = function(prop, callback) {
        if (!_setters[prop]) defineSetter(this, prop);
        _setters[prop].g = callback;
    };

    
    this.initClass = function(clss) {
        if (!clss) throw `unable to locate class`;

        const args = [].slice.call(arguments, 1);
        const child = Object.create(clss.prototype);
        child.parent = this;
        clss.apply(child, args);

        
        if (child.destroy) {
            const id = Utils.timestamp();
            this.classes[id] = child;
            this.classes[id].__id = id;
        }

        
        if (child.element) {
            const last = arguments[arguments.length - 1];
            if (Array.isArray(last) && last.length == 1 && last[0] instanceof HydraObject) last[0].add(child.element);
            else if (this.element && last !== null) this.element.add(child.element);
        }

        
        if (child.group) {
            const last = arguments[arguments.length - 1];
            if (this.group && last !== null) this.group.add(child.group);
        }

        return child;
    };

    
    this.delayedCall = function(callback, time) {
        const args = [].slice.call(arguments, 2);
        const timer = Timer.create(() => {
            if (!_this || !_this.destroy) return;
            callback && callback.apply(this, args);
        }, time);

        _timers.push(timer);

        
        if (_timers.length > 50) _timers.shift();

        return timer;
    };

    
    this.clearTimers = function() {
        for (let i = _timers.length - 1; i >= 0; i--) clearTimeout(_timers[i]);
        _timers.length = 0;
    };

    
    this.startRender = function(callback, fps) {
        _loops.push(callback);
        Render.start(callback, fps);
    };

    
    this.stopRender = function(callback) {
        _loops.remove(callback);
        Render.stop(callback);
    };

    
    this.clearRenders = function() {
        for (let i = _loops.length - 1; i >= 0; i--) _this.stopRender(_loops[i]);
    };

    
    this.wait = function(object, key, callback) {
        const promise = Promise.create();

        if (typeof object === 'number' && !key) {
            _this.delayedCall(promise.resolve, object);
            return promise;
        }

        
        if (typeof object == 'function' && typeof callback !== 'function') {
            let _object = object;
            object = key;
            key = callback;
            callback = _object;
        }

        callback = callback || promise.resolve;

        _this.startRender(test);
        function test() {
            if (!object) return _this.stopRender(test);
            if (!!object[key]) {
                callback();
                _this.stopRender(test);
            }
        }

        return promise;
    };

    
    this.flag = function(name, value, time) {
        if (typeof value !== 'undefined') {
            _flags[name] = value;

            if (time) {
                this.delayedCall(() => {
                    _flags[name] = !_flags[name];
                }, time);
            }
        } else {
            return _flags[name];
        }
    };

    
    this.destroy = function() {
        if (this.removeDispatch) this.removeDispatch();
        if (this.onDestroy) this.onDestroy();

        for (let id in this.classes) {
            var clss = this.classes[id];
            if (clss && clss.destroy) clss.destroy();
        }
        this.classes = null;

        this.clearRenders && this.clearRenders();
        this.clearTimers && this.clearTimers();

        if (this.events) this.events = this.events.destroy();
        if (this.parent && this.parent.__destroyChild) this.parent.__destroyChild(this.__id);

        return Utils.nullObject(this);
    };

    
    this.__destroyChild = function(name) {
        delete this.classes[name];
    };

});


Class(function Model() {
    Inherit(this, Component);
    Namespace(this);

    const _this = this;
    const _storage = {};
    let _data = 0;
    let _triggered = 0;

    
    this.push = function(name, val) {
        _storage[name] = val;
    };

    
    this.pull = function(name) {
        return _storage[name];
    };

    
    this.waitForData = this.promiseData = function(num = 1) {
        _data += num;
    };

    
    this.fulfillData = this.resolveData = function() {
        _triggered++;
        if (_triggered == _data) {
            _this.dataReady = true;
        }
    };

    
    this.ready = function(callback) {
        let promise = Promise.create();
        if (callback) promise.then(callback);
        _this.wait(_this, 'dataReady').then(promise.resolve);
        return promise;
    };

    
    this.initWithData = function(data) {
        _this.STATIC_DATA = data;

        for (var key in _this) {
            var model = _this[key];
            var init = false;

            for (var i in data) {
                if (i.toLowerCase().replace(/-/g, "") == key.toLowerCase()) {
                    init = true;
                    if (model.init) model.init(data[i]);
                }
            }

            if (!init && model.init) model.init();
        }

        _this.init && _this.init(data);
    };

    
    this.loadData = function(url, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        var _this = this;
        get(url + '?' + Utils.timestamp()).then( d => {
            defer(() => {
                _this.initWithData(d);
                callback(d);
            });
        });

        return promise;
    };

});



Class(function Modules() {
    const _modules = {};

    
    (function () {
        defer(exec);
    })();

    function exec() {
        for (let m in _modules) {
            for (let key in _modules[m]) {
                let module = _modules[m][key];
                if (module._ready) continue;
                module._ready = true;
                if (module.exec) module.exec();
            }
        }
    }

    function requireModule(root, path) {
        let module = _modules[root];
        if (!module) throw `Module ${root} not found`;
        module = module[path];

        if (!module._ready) {
            module._ready = true;
            if (module.exec) module.exec();
        }

        return module;
    }

    

    
    this.Module = function(module) {
        let m = new module();

        let name = module.toString().slice(0, 100).match(/function ([^\(]+)/);

        if (name) {
            m._ready = true;
            name = name[1];
            _modules[name] = {index: m};
        } else {
            if (!_modules[m.module]) _modules[m.module] = {};
            _modules[m.module][m.path] = m;
        }
    };

    
    this.require = function(path) {
        let root;
        if (!path.includes('/')) {
            root = path;
            path = 'index';
        } else {
            root = path.split('/')[0];
            path = path.replace(root+'/', '');
        }

        return requireModule(root, path).exports;
    };

    window.Module = this.Module;

    if (!window._NODE_ || window.EJECTA) {
        window.requireNative = window.require;
        window.require = this.require;
    }
}, 'Static');


Class(function LinkedList() {
    var prototype = LinkedList.prototype;

    
    this.length = 0;
    this.first = null;
    this.last = null;
    this.current = null;
    this.prev = null;

    if (typeof prototype.push !== 'undefined') return;

    
    prototype.push = function(obj) {
        if (!this.first) {
            this.first = obj;
            this.last = obj;
            obj.__prev = obj;
            obj.__next = obj;
        } else {
            obj.__next = this.first;
            obj.__prev = this.last;
            this.last.__next = obj;
            this.last = obj;
        }

        this.length++;
    };

    
    prototype.remove = function(obj) {
        if (!obj || !obj.__next) return;

        if (this.length <= 1) {
            this.empty();
        } else {
            if (obj == this.first) {
                this.first = obj.__next;
                this.last.__next = this.first;
                this.first.__prev = this.last;
            } else if (obj == this.last) {
                this.last = obj.__prev;
                this.last.__next = this.first;
                this.first.__prev = this.last;
            } else {
                obj.__prev.__next = obj.__next;
                obj.__next.__prev = obj.__prev;
            }

            this.length--;
        }

        obj.__prev = null;
        obj.__next = null;
    };

    
    prototype.empty = function() {
        this.first = null;
        this.last = null;
        this.current = null;
        this.prev = null;
        this.length = 0;
    };

    
    prototype.start = function() {
        this.current = this.first;
        this.prev = this.current;
        return this.current;
    };

    
    prototype.next = function() {
        if (!this.current) return;
        this.current = this.current.__next;
        if (this.length == 1 || this.prev.__next == this.first) return;
        this.prev = this.current;
        return this.current;
    };

    
    prototype.destroy = function() {
        Utils.nullObject(this);
        return null;
    };

});


Class(function ObjectPool(_type, _number = 10) {
    var _pool = [];

    
    this.array = _pool;

    
    (function() {
        if (_type) for (var i = 0; i < _number; i++) _pool.push(new _type());
    })();

    

    
    this.get = function() {
        return _pool.shift() || (_type ? new _type() : null);
    };

    
    this.empty = function() {
        _pool.length = 0;
    };

    
    this.put = function(obj) {
        if (obj) _pool.push(obj);
    };

    
    this.insert = function(array) {
        if (typeof array.push === 'undefined') array = [array];
        for (var i = 0; i < array.length; i++) _pool.push(array[i]);
    };

    
    this.length = function() {
        return _pool.length;
    };

    
    this.destroy = function() {
        for (let i = _pool.length - 1; i >= 0; i--) if (_pool[i].destroy) _pool[i].destroy();
        return _pool = null;
    };
}); 
