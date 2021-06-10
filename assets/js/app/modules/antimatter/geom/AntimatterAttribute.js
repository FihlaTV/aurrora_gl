Class(function AntimatterAttribute(_data, _components) {
    Inherit(this, Component);
    var _this = this;

    var _size = Math.sqrt(_data.length / (_components || 3));

    this.size = _size;
    this.count = _size * _size;
    this.buffer = _data;
    this.texture = new THREE.DataTexture(_data, _size, _size, _components == 4 ? THREE.RGBAFormat : THREE.RGBFormat, THREE.FloatType);
    this.texture.needsUpdate = true;

    this.set('needsUpdate', function() {
        _this.texture.needsUpdate = true;
    });

    this.bufferData = function(data, components) {
        _components = components;
        _data = data;
        _this.buffer = data;
        _this.texture && _this.texture.dispose && _this.texture.dispose();
        _this.texture = new THREE.DataTexture(_data, _size, _size, _components == 4 ? THREE.RGBAFormat : THREE.RGBFormat, THREE.FloatType);
        _this.texture.needsUpdate = true;
    }

    this.clone = function() {
        var array = new Float32Array(_data.length);
        array.set(_data);
        return new AntimatterAttribute(array, _components);
    }

    this.onDestroy = function() {
        _this.texture && _this.texture.dispose && _this.texture.dispose();
    }
});