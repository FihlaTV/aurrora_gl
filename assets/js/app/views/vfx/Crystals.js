FX.Class(function Crystals() {
    Inherit(this, FXScene);
    const _this = this;

    //*** Constructor
    (function () {
        _this.forceRender = true;
        _this.create(World.NUKE);
        // _this.startRender(_ => _this.render());
    })();

    //*** Event handlers

    //*** Public methods
    this.add = function(mesh) {
        this.addObject(mesh);
    }
}, 'singleton');