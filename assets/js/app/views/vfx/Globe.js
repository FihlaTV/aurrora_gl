FX.Class(function Globe() {
    Inherit(this, FXScene);
    const _this = this;

    //*** Constructor
    (function () {
        _this.create(World.NUKE);
        _this.startRender(_ => _this.render());
    })();

    //*** Event handlers

    //*** Public methods

}, 'singleton');