Class(function WorldScale() {
    Inherit(this, Object3D);
    var _this = this;

    //*** Constructor
    (function () {
        FX.Atmosphere.aurora = new FX.Atmosphere();
        FX.Atmosphere.sky = new FX.Atmosphere();
        initViews();
    })();

    function initViews() {
        _this.initClass(IslandSnow, true);

        let aurora = _this.initClass(Aurora);
        aurora.group.prefix = 'aurora2';
        MeshUIL.add(aurora.group);
    }

    //*** Event handlers

    //*** Public methods

});