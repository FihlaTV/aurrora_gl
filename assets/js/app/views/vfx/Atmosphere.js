FX.Class(function Atmosphere() {
    Inherit(this, FXScene);
    const _this = this;

    var _evt = {};

    //*** Constructor
    (function () {
        _this.create(World.NUKE);
        _this.nuke.camera = _this.nuke.camera.clone();
        _this.nuke.camera.position.set(0, 0, 0);
        _this.nuke.camera.rotation.x = Math.radians(90);
        _this.startRender(loop);

        _this.texture = {value: _this.rt.texture};
    })();

    function loop() {
        _evt.camera = _this.nuke.camera;
        _this.events.fire(FX.Atmosphere.RENDER, _evt);
        _this.render();
    }


    //*** Event handlers

    //*** Public methods
    this.rotation = function(x) {
        _this.nuke.camera.rotation.x = x;
    }

    this.addAurora = async function(mesh) {
        let clone = this.addObject(mesh);
    }
}, _ => {
    FX.Atmosphere.RENDER = 'atmosphere_render';
});