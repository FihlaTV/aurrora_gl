Class(function UILStorage() {
    Inherit(this, Component);
    const _this = this;
    var _timer;

    var _data = {};

    Hydra.ready(_ => {
        if (!Hydra.LOCAL || !location.search.includes('uil')) return;
        __window.bind('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.keyCode == 83) {
                e.preventDefault();
                write();
            }
        });
    });

    this.wait(Assets.JSON, 'data/uil', () => {
        _data = Assets.JSON['data/uil'];
    });

    function write() {
        Dev.writeFile('assets/data/uil.json', _data);

        __body.css({display: 'none'});
        _this.delayedCall(() => {
            __body.css({display: 'block'});
        }, 100)
    }

    this.set = function(key, value) {
        if (value === null) delete _data[key];
        else _data[key] = value;
        clearTimeout(_timer);
    };

    this.get = function(key) {
        return _data[key];
    };

    this.parse = function(key) {
        let data = _data[key];
        if (typeof data === 'undefined') return null;

        if (Array.isArray(data)) {
            let color = new THREE.Color().setRGB(data[0], data[1], data[2]);
            return {value: color};
        }

        return {value: data};
    };
}, 'static');