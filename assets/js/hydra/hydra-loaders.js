

Class(function Assets() {
    const _this = this;
    const _fetchCors = {mode: 'cors'};

    this.__loaded = [];

    
    this.CDN = '';

    
    this.CORS = null;

    
    this.IMAGES = {};

    
    this.SDF = {};

    
    this.JSON = {
        push: function(prop, value) {
            this[prop] = value;
            Object.defineProperty(this, prop, {
                get: () => {return JSON.parse(JSON.stringify(value))},
            });
        }
    };

    Object.defineProperty(this.JSON, 'push', {
        enumerable: false,
        writable: true
    });

    
    this.SVG = {};

    
    function parseResolution(path) {
        if (!window.ASSETS || !ASSETS.RES) return path;
        var res = ASSETS.RES[path];
        var ratio = Math.min(Device.pixelRatio, 3);
        if (!res) return path;
        if (!res['x' + ratio]) return path;
        var split = path.split('/');
        var file = split[split.length-1];
        split = file.split('.');
        return path.replace(file, split[0] + '-' + ratio + 'x.' + split[1]);
    }

    
    function AssetList(arr) {
        arr.__proto__ = AssetList.prototype;
        return arr;
    }
    AssetList.prototype = new Array;

    
    AssetList.prototype.filter = function(items) {
        for (let i = this.length - 1; i >= 0; i--) if (!this[i].includes(items)) this.splice(i, 1);
        return this;
    };

    
    AssetList.prototype.exclude = function(items) {
        for (let i = this.length - 1; i >= 0; i--) if (this[i].includes(items)) this.splice(i, 1);
        return this;
    };

    AssetList.prototype.prepend = function(prefix) {
        for (let i = this.length - 1; i >= 0; i--) this[i] = prefix + this[i];
        return this;
    };

    AssetList.prototype.append = function(suffix) {
        for (let i = this.length - 1; i >= 0; i--) this[i] = this[i] + suffix;
        return this;
    };

    
    this.list = function() {
        if (!window.ASSETS) console.warn(`ASSETS list not available`);
        return new AssetList(window.ASSETS.slice(0) || []);
    };

    
    this.getPath = function(path) {

        
        if (!!~path.indexOf('//')) return path;

        
        path = parseResolution(path);

        
        if (this.CDN && !~path.indexOf(this.CDN)) path = this.CDN + path;

        return path;
    };

    
    this.loadImage = function(path, isStore) {
        var img = new Image();
        img.crossOrigin = this.CORS;
        img.src = _this.getPath(path);

        img.loadPromise = function() {
            let promise = Promise.create();
            img.onload = promise.resolve;
            return promise;
        };

        if (isStore) this.IMAGES[path] = img;

        return img;
    };

    
    this.decodeImage = function(path) {
        let promise = Promise.create();
        if (!!window.createImageBitmap && Device.system.browser.includes(['chrome']) ) {

            let img = _this.loadImage(path);
            img.onload = function() {
                createImageBitmap(img, {imageOrientation: 'flipY'}).then(imgBmp => {
                    promise.resolve(imgBmp);
                });
            };

            
            
            
            
            
            
            
            
        } else {
            let img = _this.loadImage(path);
            img.onload = () => promise.resolve(img);
        }
        return promise;
    };

}, 'static');


Class(function AssetLoader(_assets, _callback) {
    Inherit(this, Events);
    const _this = this;

    let _total = _assets.length;
    let _loaded = 0;

    (function() {
        if (!Array.isArray(_assets)) throw `AssetLoader requires array of assets to load`;
        _assets = _assets.slice(0).reverse();

        init();
    })();

    function init() {
        if (!_assets.length) return complete();
        for (let i = 0; i < AssetLoader.SPLIT; i++) {
            if (_assets.length) loadAsset();
        }
    }

    function loadAsset() {
        let path = _assets.splice(_assets.length - 1, 1)[0];

        const name = path.split('assets/').last().split('.')[0];
        const ext = path.split('.').last().split('?')[0].toLowerCase();

        let timeout = Timer.create(timedOut, AssetLoader.TIMEOUT, path);

        
        if (!!~Assets.__loaded.indexOf(path)) return loaded();

        
        if (ext.includes(['jpg', 'jpeg', 'png', 'gif'])) {
            let image = Assets.loadImage(path);
            if (image.complete) return loaded();
            image.onload = loaded;
            image.onerror = loaded;
            return;
        }

        if (window.AURA && window.AURA.import) {
            if (ext == 'js') {
                AURA.import(path);
                loaded();
                return;
            }
        }

        get(Assets.getPath(path), Assets.HEADERS).then(data => {
            Assets.__loaded.push(path);
            if (ext == 'json') Assets.JSON.push(name, data);
            if (ext == 'svg') Assets.SVG[name] = data;
            if (ext == 'fnt') Assets.SDF[name.split('/')[1]] = data;
            if (ext == 'js') window.eval(data);
            if (ext.includes(['fs', 'vs', 'glsl']) && window.Shaders) Shaders.parse(data, path);
            loaded();
        }).catch(e => {
            console.warn(e);
            loaded();
        });

        function loaded() {
            if (timeout) clearTimeout(timeout);
            increment();
            if (_assets.length) loadAsset();
        }
    }

    function increment() {
        _this.events.fire(Events.PROGRESS, {percent: ++_loaded / _total});

        
        if (_loaded == _total) defer(complete);
    }

    function complete() {

        
        defer(() => {
            _callback && _callback();
            _this.events.fire(Events.COMPLETE);
        });
    }

    function timedOut(path) {
        console.warn('Asset timed out', path);
    }

    
    this.add = function(num) {
        _total += num || 1;
    };

    
    this.trigger = function(num) {
        for (let i = 0; i < (num || 1); i++) increment();
    };

}, () => {

    
    AssetLoader.SPLIT = 2;

    
    AssetLoader.TIMEOUT = 5000;

    
    AssetLoader.loadAllAssets = function(callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        promise.loader = new AssetLoader(Assets.list(), () => {
            if (callback) callback();
            if (promise.loader && promise.loader.destroy) promise.loader = promise.loader.destroy();
        });

        return promise;
    };

    
    AssetLoader.loadAssets = function(list, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        promise.loader = new AssetLoader(list, () => {
            if (callback) callback();
            if (promise.loader && promise.loader.destroy) promise.loader = promise.loader.destroy();
        });

        return promise;
    };

    
    AssetLoader.waitForLib = function(name, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        Render.start(check);
        function check() {
            if (window[name]) {
                Render.stop(check);
                callback && callback();
            }
        }

        return promise;
    };
});
