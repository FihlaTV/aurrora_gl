Class(function ShaderUILGroup(_shader, _uil) {
    Inherit(this, Component);
    var _this = this;

    var _group = _uil.add('group', {name: _shader.UILPrefix.split('_')[0]});
    var _objects = [];
    var _items = [];

    //*** Constructor
    (function () {
        initItems();
    })();

    function initItems() {
        for (var key in _shader.uniforms) {
            let obj = _shader.uniforms[key];
            if (obj.ignoreUIL) continue;

            if (obj.value instanceof THREE.Color) createColor(obj, key);
            if (typeof obj.value === 'number') createNumber(obj, key);
        }
    }

    function createNumber(obj, key) {
        let val = new UILItem(key, obj.value, {prefix: _shader.UILPrefix}, val => {
            obj.value = val;
        });
        _group.add('number', val.obj);
        _objects.push({key, obj});
        _items.push(val);
    }

    function createColor(obj, key) {
        let val = new UILItem(key, obj.value.getHex(), {prefix: _shader.UILPrefix}, val => {
            if (Array.isArray(val)) obj.value.setRGB(val[0], val[1], val[2]);
            else obj.value.set(val);
        });
        _group.add('color', val.obj);
        _objects.push({key, obj});
        _items.push(val);
    }

    //*** Event handlers

    //*** Public methods
    this.console = function() {
        console.log(_shader.UILPrefix);
        _objects.forEach(obj => {
            if (obj.obj.type == 'c') console.log(obj.key, '#' + obj.obj.value.getHexString());
            else console.log(obj.key, obj.obj.value);
        });
        console.log('----');
    }

    this.clear = function() {
        _items.forEach(item => item.clear());
    }
});