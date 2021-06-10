Class(function MeshUILGroup(_mesh, _uil) {
    Inherit(this, Component);
    const _this = this;

    if (!_mesh.prefix) throw 'mesh.prefix required when using MeshUIL';

    var prefix = _mesh.prefix;
    var _group = Global.UIL ? Global.UIL.add('group', {name: prefix}) : null;

    //*** Constructor
    (function () {
        initVec('position');
        initVec('scale');
    })();

    function initNumber(key, def) {
        if (_group) {
            let val = new UILItem(key, _mesh[key], {prefix}, val => {
                _mesh[key] = val;
            });
            _group.add('number', val.obj);
        }

        _mesh[key] = UILStorage.get(`${prefix}${key}`) || def;
    }

    function initColor(key) {
        if (_group) {
            let val = new UILItem(key, _mesh[key].getHex(), {prefix}, val => {
                if (Array.isArray(val)) _mesh[key].setRGB(val[0], val[1], val[2]);
                else _mesh[key].set(val);
            });
            _group.add('color', val.obj);
        }

        _mesh[key].fromArray(UILStorage.get(`${prefix}${key}`) || [1, 1, 1]);
    }

    function initVec(key) {
        if (_group) {
            let val = new UILItem(key, _mesh[key].toArray(), {prefix}, val => {
                _mesh[key].fromArray(val);
            });
            _group.add('number', val.obj);
        }

        let def = key == 'scale' ? [1, 1, 1] : [0, 0, 0];
        _mesh[key].fromArray(UILStorage.get(`${prefix}${key}`) || def);
    }

    //*** Event handlers

    //*** Public methods
    this.initNumber = initNumber;
    this.initColor = initColor;
    this.initVec = initVec;
});