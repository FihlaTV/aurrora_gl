self = this;

(function() {
 let c = self.console;
 self.console = {
 log: function(c) {
 print("THREAD LOG :: " +(typeof c === 'object' ? JSON.stringify(c) : c));
 c && c.log && c.log.apply(this, arguments);
 },

 warn: function(c, d) {
 print("THREAD WARN :: " + c + " " + d);
 c && c.warn && c.warn.apply(this, arguments);
 },

 error: function(c, d) {
 print("THREAD ERROR :: " + c + d);
 c && c.error && c.error.apply(this, arguments);
 },

 trace: function(c) {
 let e = new Error();
 print("THREAD TRACE :: " + e.toString());
 c && c.trace && c.trace.apply(this, arguments);
 }
 };
 })();


const _events = {};
self.addEventListener = function(type, callback) {
    _events[type] = callback;
};

const _getArrayType = function(array) {
    if (array instanceof Uint16Array) return 'Uint16Array';
    return 'Float32Array';
};

self.postMessage = function(msg, buffer) {
    if (buffer) {
        for (let key in msg) {
            if (ArrayBuffer.isView(msg[key])) {
                let typedArray = msg[key];
                let type = _getArrayType(typedArray);
                let id = (Date.now() + Math.round(Math.random() * 5000)).toString();
                let typedKey = `t_${type}/${key}/${id}`;
                msg[key] = typedKey;
                msg.message[key] = typedKey;
                KOTLIN.transferData(typedArray.buffer, typedKey);
            }
        }
    }
    KOTLIN.postMessage(JSON.stringify(msg));
};

var KOTLIN = {};
KOTLIN.onMessage = function(message) {
    _events.message && _events.message({data: JSON.parse(message)});
};

self.importScripts = function() {
    for (let i = 0; i < arguments.length; i++) {
        KOTLIN.import(arguments[i]);
    }
};

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

    self.setTimeout = function(callback, time) {
        create(callback, time);
        return callback.ref;
    }

    self.setInterval = function(callback, time) {
        create(callback, time);
        callback.interval = true;
        return callback.ref;
    }

    self.clearTimeout = self.clearInterval = function(ref) {
        var c = find(ref);
        var index = _callbacks.indexOf(c);
        if (index > -1) _callbacks.splice(index, 1);
    }

    KOTLIN.tick = loop;
}
new Timeout();

// self.fetch = function(url, options) {
//     if (!FetchRequest.list) FetchRequest.list = [];
//     options = options || {};
//     delete options.credentials;
//     delete options.headers;
//     const promise = Promise.create();
//     const request = FetchRequest.create();
//
//     request.setThreadIndex(self.THREAD_INDEX);
//
//     let method = options.method || 'GET';
//     if (method.toLowerCase() == 'get') {
//         delete options.method;
//         let query = '';
//         for (let key in options) {
//             if (!query.length) query = '?';
//             query += `${key}=${options[key]}&`;
//         }
//         query = query.slice(0, -1);
//         url += query;
//     }
//
//     request.openWithMethodUrl(method, url);
//
//     for (let i in options.headers) {
//         request.setRequestHeaderWithKeyValue(i, options.headers[i]);
//     }
//
//     request.onload = (data) => {
//         FetchRequest.list.splice(FetchRequest.list.indexOf(request), 1);
//         promise.resolve(response(data));
//     };
//
//     request.onerror = () => {
//         FetchRequest.list.splice(FetchRequest.list.indexOf(request), 1);
//         promise.reject();
//     };
//
//     FetchRequest.list.push(request);
//
//     options.body = options.body || {}
//     request.sendWithBody(options.body);
//
//     function response(data) {
//         let keys = [],
//         all = [],
//         headers = {},
//         header;
//
//         return {
//         ok: true,        // 200-399
//         status: 200,
//         statusText: data,
//         url: '',
//         clone: response,
//
//         text: () => Promise.resolve(data),
//         json: () => Promise.resolve(data).then(JSON.parse),
//         xml: () => Promise.resolve(data),
//         blob: () => Promise.resolve(new Blob([data])),
//
//         headers: {
//         keys: () => keys,
//         entries: () => all,
//         get: n => headers[n.toLowerCase()],
//         has: n => n.toLowerCase() in headers
//         }
//         };
//     }
//     return promise;
// };
