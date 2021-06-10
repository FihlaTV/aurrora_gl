function AuraModule(name) {
    var _this = this;
    var _name;

    var _callbacks = {};
    var _objects = {};

    //*** Public methods
    this.init = function(data) {
        _this = this;
        _name = name.constructor.toString().match(/function ([^\(]+)/)[1];
        AuraNativeCore.register(_name, this);
        if (data) this.send('init', {data});
    }

    this.send = function(fn, data, callback) {
        if (typeof fn === 'object') {
            callback = data;
            data = fn;
            fn = data.fn;
        }

        if (typeof data === 'function') {
            callback = data;
            data = {};
        }

        if (!_name) throw 'Must call init on module before sending data';

        data._id = Date.now().toString();
        data.fn = fn;
        data.nativeModule = _name;

        if (callback) _callbacks[data._id] = callback;

        AuraNativeCore.send(data);
    }

    this.register = function(object, id) {
        _objects[id] = object;
    }

    this.deregister = function(object, id) {
        delete _objects[id];
    }

    this.receive = function(data) {
        var id = data._id;
        var callback = _callbacks[id];

        if (callback) {
            callback(data);
            delete _callbacks[id];
        } else {
            if (data._aid) {
                _objects[data._aid].incoming(data);
            } else {
                _this.incoming(data);
            }
        }
    }

    this.incoming = function() {
        //for override
    }
}

function AuraNativeCore() {
    var _this = this;

    var _references = {};

    AURA.nativeData = data => {
        if (data.indexOf("auraToHydra") > -1 && window.Mobile && Mobile.NativeCore) return Mobile.NativeCore.receive(JSON.parse(data));
        data = JSON.parse(data);
        if (data.jsModule) _references[data.jsModule].receive(data);
    };

    this.send = function(data) {
        data = JSON.stringify(data);
        AURA.native(data);
    }

    this.register = function(name, ref) {
        _references[name] = ref
    }
}

AuraNativeCore = new AuraNativeCore();
AuraInherit = function(child, parent) {
    let inst = new parent(child);
    for (let key in inst) {
        child[key] = inst[key];
    }
};

webkit = {};
webkit.messageHandlers = {}
webkit.messageHandlers.nativeHydra = {
    postMessage: data => {
        data = JSON.parse(data);
        data.auraToHydra = true;
        AuraNativeCore.send(data);
    }
};

function AuraObject(name) {
    var _id = Date.now().toString();

    var _fn = name.constructor.toString().match(/function ([^\(]+)/)[1];
    var _root = window[_fn.split(/(?=[A-Z])/)[0]];

    _root && _root.register && _root.register(this, _id);

    this.id = _id;

    this.send = function(fn, data = {}, callback) {
        data._aid = _id;
        _root.send(fn, data, callback);
    }

    this.setRoot = function(root) {
        _root = root;
        _root.register(this, _id);
    }

    this.destroy = function() {
        _root.deregister(this, _id);
    }
}

window = this;
window.ontouchstart = function() { };

AURA._emptyBuffer = 0;
AURA._emptyTexture = 0;
AURA._emptyFrameBuffer = 0;
AURA._emptyRenderBuffer = 0;

AURA._img = {'_src': '-1'};

(function() {
    let setSC = false;

    function setSurfaceChanged() {
        HC.setOnSurfaceChanged((w, h) => {
            window.innerWidth = w;
            window.innerHeight = h;
            window.onresize && window.onresize();
        });

        HC.setNativeToJS(data => {
            AURA.nativeData && AURA.nativeData(data);
        });
    }

    let raf = t => {
        window.__internalTimer && window.__internalTimer();
        AURA.animationFrame && AURA.animationFrame(performance.now());
        _requestAnimationFrame(raf);
        if (!setSC) {
            setSC = true;
            setSurfaceChanged();
            //need to trigger hydra ready here
        }
    };
    _requestAnimationFrame(raf);
})();

window.requestAnimationFrame = function(callback) {
    AURA.animationFrame = callback;
}

console.time = function() {
    console._saveTime = performance.now();
}

console.timeEnd = function() {
    console.log(performance.now() - console._saveTime);
}

window.nativeHydra = {};

window.Image = function() { };
Image.prototype = {
	set src (val) {
		this._src = val;
		this.width = _gl._getImageWidth(val);
		this.height = _gl._getImageHeight(val);
		this.complete = true;
        let _this = this;
        setTimeout(() => _this.onload && _this.onload(), 10);
	},
	get src() {
		return this._src;
	}
};

window.document = {};
window.document.createElement = window.document.createDocumentFragment = function() {
    return createElement();
};

window.document.getElementsByTagName = function() {
    return [createElement()];
}

window.document.body = createElement();
window.document.documentElement = createElement();
window.document.getElementById = createElement;

window.location = {
    hash: '',
    href: 'AURA',
    hostname: 'AURA',
    search: ''
}

window.navigator = {};
window.navigator.userAgent = 'mozilla/5.0 (macintosh; intel mac os x 10_9_2) applewebkit/537.36 (khtml, like gecko) android chrome/95.0.1847.131 safari/537.36';

window.history = {};

function createElement() {
    var el = {};
    el.style = {};
    el.appendChild = function() {};

    return el;
}

window.StoredEvents = {};
window.addEventListener = function(evt, cb) {
    if (!StoredEvents[evt]) StoredEvents[evt] = [];
    StoredEvents[evt].push(cb);
};

window.removeEventListener = function() {

};

window._AURA_ = true;

window.Audio = {};

function FetchRequest() {
    AuraInherit(this, AuraObject);
    var _this = this;
    var _method, _url;

    this.openWithMethodUrl = function(method, url) {
        _method = method;
        _url = url;
    }

    this.setRequestHeaderWithKeyValue = function() {

    }

    this.sendWithBody = function(body) {
        this.send('load', {method: _method, body, url: _url}, data => {
            _this.onload && _this.onload(data.data);
        });
    }
}

function Fetch() {
    AuraInherit(this, AuraModule);
    this.init();
}
window.Fetch = new Fetch();

window.fetch = function(url, options = {}) {
    return new Promise((resolve, reject) => {
        const request = new FetchRequest();

        request.openWithMethodUrl(options.method || 'GET', url);

        for (let i in options.headers) {
            request.setRequestHeaderWithKeyValue(i, options.headers[i]);
        }

        request.onload = (data) => {
            resolve(response(data));
        };

        request.onerror = reject;

        options.body = options.body || {}
        request.sendWithBody(JSON.stringify(options.body));

        function response(data) {
            let keys = [],
                all = [],
                headers = {},
                header;

            return {
                ok: true,		// 200-399
                status: 200,
                statusText: data,
                url: '',
                clone: response,

                text: () => Promise.resolve(data),
                json: () => Promise.resolve(data).then(JSON.parse),
                xml: () => Promise.resolve(data),
                blob: () => Promise.resolve(new Blob([data])),

                headers: {
                    keys: () => keys,
                    entries: () => all,
                    get: n => headers[n.toLowerCase()],
                    has: n => n.toLowerCase() in headers
                }
            };
        }
    });
};

window.createImageBitmap = function(img) {
    return Promise.resolve(img);
}

window.performance = {};
window._gl = gl;
window._canvas = {};
_canvas.style = {};
_canvas.getContext = function() {
  return _gl;
};

_canvas.addEventListener = function() {

};

(function() {
    let start = _gl._getNanoTime();
    performance.now = function() {
        return _gl._getNanoTime() - start;
    };
})();

_gl.texImage2D = function(p0, p1, p2, p3, p4, p5, p6, p7, p8) {
    var img;
    if (p6) {
        img = p8 || AURA._img;
        if (!img._src) return _gl._texImage2DArray(p0, p1, p2, p3, p4, p5, p6, p7, p8);
        if (img._src == -1) return _gl._texImage2DNull(p0, p1, p2, p3, p4, p5, p6, p7);
        _gl._texImage2D(p0, p1, p2, p3, p4, p5, p6, p7, img._src);
    } else {
        img = p5 || AURA._img;
        if (!img._src) return;
        _gl._texImage2D(p0, p1, p2, p3, p4, img._src);
    }
};

_gl.getContextAttributes = function() {
    return {};
};

_gl.isContextLost = function() {
    return false;
};

_gl.clearDepth = function(x) {
    return _gl.clearDepthf(x);
};

_gl.depthRange = function(x) {
    return _gl.depthRangef(x);
};

_gl.createTexture = function() {
    let a = new Int32Array(1);
    _gl.genTextures(1, a);
    return a[0];
};

_gl.createBuffer = function() {
    let a = new Int32Array(1);
    _gl.genBuffers(1, a);
    return a[0];
};

_gl.createFramebuffer = function() {
    let a = new Int32Array(1);
    _gl.genFramebuffers(1, a);
    return a[0];
};

_gl.createRenderbuffer = function() {
    let a = new Int32Array(1);
    _gl.genRenderbuffers(1, a);
    return a[0];
};

_gl.deleteTexture = function(id) {
    let a = new Int32Array([id]);
    _gl.deleteTextures(1, a);
    return a[0];
};

_gl.deleteBuffer = function(id) {
    let a = new Int32Array([id]);
    _gl.deleteBuffers(1, a);
    return a[0];
};

_gl.deleteFramebuffer = function(id) {
    let a = new Int32Array([id]);
    _gl.deleteFramebuffers(1, a);
    return a[0];
};

_gl.deleteRenderbuffers = function(id) {
    let a = new Int32Array([id]);
    _gl.deleteRenderbuffers(1, a);
    return a[0];
};

_gl._bufferData = _gl.bufferData.bind(_gl);
_gl.bufferData = function( type, arr, usage ) {
    _gl._bufferData( type, arr.byteLength, arr, usage );
}

_gl.getBufferParameter = function(target, pname) {
    let a = new Int32Array(1);
    _gl.getBufferParameteriv(target, pname, a);
    return a[0];
};

_gl.getRenderbufferParameter = function(target, pname) {
    let a = new Int32Array(1);
    _gl.getBufferParameteriv(target, pname, a);
    return a[0];
};

_gl.getProgramParameter = function(target, pname) {
    let a = new Int32Array(1);
    _gl.getProgramiv(target, pname, a);
    return a[0];
};

_gl.getVertexAttribOffset = function(target, pname) {
    let a = new Int32Array(1);
    _gl.getVertexAttribiv(target, pname, a);
    return a[0];
};

_gl.getFramebufferAttachmentParemeter = function(target, attachment, pname) {
    let a = new Int32Array(1);
    _gl.getProgramiv(target, attachment, pname, a);
    return a[0];
};

_gl.getUniform = function(p0, p1) {
    let a = new Int32Array(1);
    _gl.getUniformiv(p0, p1, a);
    return a[0];
};

_gl.getTexParameter = function(p0, p1) {
    let a = new Int32Array(1);
    _gl.texParameteriv(p0, p1, a);
    return a[0];
};

_gl.getShaderParameter = function(p0, p1) {
    let a = new Int32Array(1);
    _gl.getShaderiv(p0, p1, a);
    return a[0];
};

_gl.getShaderParameter= function( shader_id, flag ) {

    ret = new Int32Array(1);
    _gl.getShaderiv( shader_id, flag, ret );

    return ret[0];
}

_gl.bindBuffer = (function() {
    let fn = _gl.bindBuffer;
    return function(target, buffer) {
        return fn(target, buffer || AURA._emptyBuffer);
    }
})();

_gl.renderbufferStorage = (function() {
    let fn = _gl.renderbufferStorage;
    return function(a, b, c, d) {
        return fn(a, b, Math.round(c), Math.round(d));
    }
})();

_gl.bindFramebuffer = (function() {
    let fn = _gl.bindFramebuffer;
    return function(target, buffer) {
        return fn(target, buffer || AURA._emptyFrameBuffer);
    }
})();

_gl.bindRenderbuffer = (function() {
    let fn = _gl.bindRenderbuffer;
    return function(target, buffer) {
        return fn(target, buffer || AURA._emptyRenderBuffer);
    }
})();

_gl.bindTexture = (function() {
    let fn = _gl.bindTexture;
    return function(target, buffer) {
        return fn(target, buffer || AURA._emptyTexture);
    }
})();

_gl.pixelStorei = (function() {
    let fn = _gl.pixelStorei;
    return function(p0, p1) {
        if (typeof p1 === 'number') fn(p0, p1);
    }
})();

_gl.uniform1i = (function() {
    let fn = _gl.uniform1i;
    return function(location, x) {
        if (typeof x === 'boolean') {
            x = !!x ? 1 : 0;
        }

        return fn(location, x);
    }
})();

_gl.getExtension = function(name) {

    console.log(name)
    if (name == 'ANGLE_instanced_arrays') {
        return {
            drawElementsInstancedANGLE: _gl._drawElementsInstanced,
            drawArraysInstancedANGLE: _gl._drawArraysInstanced,
            vertexAttribDivisorANGLE: _gl._vertexAttribDivisor
        };
    } else if (name == 'OES_texture_half_float') {
        return {'HALF_FLOAT_OES': _gl.HALF_FLOAT_OES};
    }

    return 1;
}

//TEMPORARY

// _gl.getParameter = (function() {
//     let fn = _gl.getParameter;
//     return function(param) {
//         if (param == _gl.MAX_VERTEX_ATTRIBS) return 4;
//         return fn(param);
//     }
// })();

function Gvr() {
    const _this = this;
    AuraInherit(this, AuraModule);
    var _setup, _callback;

    this.init();

    this.quaternion = {};

    function setup() {
        _setup = true;
        AURA.animationFrame = null;
        window.requestAnimationFrame = function(callback) {
            _callback = callback;
        };
    }

    function drawEye(data) {
        if (data.type == 1) _callback(performance.now());
        _this.quaternion.x = data.qx;
        _this.quaternion.y = data.qy;
        _this.quaternion.z = data.qz;
        _this.quaternion.w = data.qw;
        _this.onHeadTransform && _this.onHeadTransform(_this.quaternion);
        _this.onDrawEye && _this.onDrawEye(data.type);
    }

    this.incoming = function(data) {
        if (!_setup) setup();
        switch (data.fn) {
            case 'drawEye': drawEye(data); break;
        }
    }
}
window.Gvr = new Gvr();

function GvrAudio() {
    const _this = this;
    AuraInherit(this, AuraModule);
    this.init();

    this.STEREO_PANNING = 0;
    this.BINAURAL_LOW_QUALITY = 1;
    this.BINAURAL_HIGH_QUALITY = 2;

    this.initialize = function(type) {
        this.send('initialize', type);
    }
}
window.GvrAudio = new GvrAudio();

function SoundPlayer(_path) {
    AuraInherit(this, AuraObject);
    var _this = this;

    var _id = this.id;

    this.send('create', {path: _path, id: _id});

    this.play = function() {
        this.send('play', {id: _id});
    }

    this.pause = function() {
        this.send('pause', {id: _id});
    }

    this.stop = function() {
        this.send('stop', {id: _id});
    }

    this.seek = function(time) {
        this.send('seek', {id: _id, time});
    }

    this.loop = function(loop) {
        this.send('loop', {id: _id, loop});
    }

    this.volume = function(v) {
        this.send('volume', {id: _id, volume: v});
    }

    this.release = function() {
        this.send('release', {id: _id});
    }

}

function Sound() {
    AuraInherit(this, AuraModule);
    this.init();
}
window.Sound = new Sound();

function Timeout() {
    var _callbacks = [];

    var _time = Date.now();

    function loop() {
        var date = Date.now();
        var delta = date - _time;
        for (var i = 0; i < _callbacks.length; i++) {
            var c = _callbacks[i];
            c.current += delta;
            if (c.current >= c.time) {
                c();

                if (c.interval) {
                    c.current = 0;
                } else {
                    var index = _callbacks.indexOf(c);
                    if (index > -1) _callbacks.splice(index, 1);
                }
            }
        }
        _time = date;
    }

    function find(ref) {
        for (var i = _callbacks.length-1; i > -1; i--) {
            var c = _callbacks[i];
            if (c.ref == ref) return c;
        }
    }

    function create(callback, time) {
        callback.time = time;
        callback.current = 0;
        callback.ref = Date.now();
        _callbacks.push(callback);
        return callback;
    }

    window.setTimeout = function(callback, time) {
        create(callback, time);
        return callback.ref;
    }

    window.setInterval = function(callback, time) {
        create(callback, time);
        callback.interval = true;
        return callback.ref;
    }

    window.clearTimeout = window.clearInterval = function(ref) {
        var c = find(ref);
        var index = _callbacks.indexOf(c);
        if (index > -1) _callbacks.splice(index, 1);
    }

    window.__internalTimer = loop;

}
new Timeout();

function TouchInput() {
    AuraInherit(this, AuraModule);
    this.init();

    this.incoming = function(data) {
        let touch = {x: data.x, y: data.y, pageX: data.x, pageY: data.y};
        let touches = [touch];
        let e = {isTrusted: true, touches: touches, changedTouches: touches, currentTarget: window};
        StoredEvents[data.type] && StoredEvents[data.type].forEach(cb => cb(e));
    }
}
window.TouchInput = new TouchInput();
window.ontouchstart = () => { };

function Worker(_script) {
    AuraInherit(this, AuraObject);
    var _this = this;

    var _id = this.id;
    var _events = {};

    this.setRoot(WebWorker);
    this.send('create', {script: _script, id: _id});

    this.postMessage = function(data, buffer) {
        let string = JSON.stringify(data);
        this.send('postMessage', {string, id: _id});
    }

    this.addEventListener = function(evt, callback) {
        _events[evt] = callback;
    }

    this.terminate = function() {
        this.send('terminate', {id: _id});
        this.destroy();
    }

    this.incoming = function({string}) {
        let data = JSON.parse(string);
        Worker.replaceTransfer(data);
        Worker.replaceTransfer(data.message);
        _events.message && _events.message({data});
        Worker.TRANSFERS = {};
    }
}

Worker.replaceTransfer = function(obj) {
    if (!obj) return;
    for (let key in obj) {
        if (typeof obj[key] !== 'string') continue;
        if (obj[key].slice(0, 2) == 't_') {
            obj[key] = Worker.TRANSFERS[obj[key]];
        }
    }
}

Worker.TRANSFERS = {};
AURA._receiveBuffer((data, key) => {
    let type = key.split('_')[1].split('/')[0];
    Worker.TRANSFERS[key] = new window[type](data);
});

function WebWorker() {
    AuraInherit(this, AuraModule);
    this.init();
}
window.WebWorker = new WebWorker();

function gAR() {
    const _this = this;
    AuraInherit(this, AuraModule);
    this.init();

    var _tracking = false;

    this.translation = [];
    this.quaternion = [];
    this.projectionMatrix = [];
    this.orientation = 'portrait';

    function handleData(data) {
        _this.translation = JSON.parse(data.translation);
        _this.quaternion = JSON.parse(data.quaternion);
        _this.projectionMatrix = JSON.parse(data.projectionMatrix);
        _this.lightIntensity = data.lightIntensity;
        _this.onPose && _this.onPose();

        if (_tracking != data.trackingStatus) {
            _tracking = data.trackingStatus;
            _this.setTrackingState && _this.setTrackingState(_tracking ? 'normal' : 'limited');
        }
    }

    function setOrientation(data) {
        switch (data.orientation) {
            case 0: _this.orientation = 'portrait'; break;
            case 1: _this.orientation = 'landscapeLeft'; break;
            case 2: _this.orientation = 'portraitUpsideDown'; break;
            case 3: _this.orientation = 'landscapeRight'; break;
        }

        _this.onOrientation && _this.onOrientation();
    }

    this.setTextureId = function(id) {
        this.send('textureId', {id});
    }

    this.resetOrigin = function() {
        this.send('resetOrigin', {});
    }

    this.findSurface = function(obj, callback) {
        this.send('findSurface', obj, data => {
            console.log(data);
        });
    }

    this.incoming = function(data) {
        switch (data.fn) {
            case 'handleData': handleData(data); break;
            case 'orientation': setOrientation(data); break;
        }
    }
}
window.gAR = new gAR();

