Class(function ShaderUIL() {
    Inherit(this, Component);
    var _this = this;
    var _uil, _active;

    var _groups = [];

    function initUIL() {
        if (!Global.UIL) {
            _uil = new UIL.Gui({css:'top: 0; right: 50px;', size: 300, center: true});
            Stage.add(_uil);
            Global.UIL = _uil;
        } else {
            _uil = Global.UIL;
        }
    }

    Hydra.ready(() => {
        if (Hydra.LOCAL && location.search.includes('uil')) {
            Global.UIL_ACTIVE = true;
            new AssetLoader(['assets/js/app/modules/uil/_uil.min.js']);
            AssetLoader.waitForLib('UIL', initUIL);
        }
    });

    //*** Public methods
    this.add = function(shader) {
        if (!Global.UIL_ACTIVE) return;
        this.wait(Global, 'UIL', () => {
            let group = new ShaderUILGroup(shader, Global.UIL);
            _groups.push(group);
        });
    }

    this.list = function() {
        _groups.forEach(group => group.console());
    }

    this.clear = function() {
        _groups.forEach(group => group.clear());
    }
}, 'static');