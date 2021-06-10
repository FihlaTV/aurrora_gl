Class(function Island() {
    Inherit(this, Object3D);
    const _this = this;

    //*** Constructor
    (function () {
        FX.Atmosphere.aurora = new FX.Atmosphere();
        FX.Atmosphere.sky = new FX.Atmosphere();
        initViews();
        _this.startRender(loop);
    })();

    function initViews() {
        let base = _this.initClass(IslandBase);
        base.group.position.y = -0.432;

        _this.initClass(IslandSnow);

        let mountain = _this.initClass(Mountain);
        mountain.group.prefix = 'mountain';
        mountain.group.scale.setScalar(1.4);
        MeshUIL.add(mountain.group);

        // let crystals = _this.initClass(Crystals);
        // crystals.group.prefix = 'crystals';
        // MeshUIL.add(crystals.group);

        // let rock1 = _this.initClass(Rock, 1);
        // rock1.group.prefix = 'rock1';
        // MeshUIL.add(rock1.group);
        //
        // let rock2 = _this.initClass(Rock, 2);
        // rock2.group.prefix = 'rock2';
        // MeshUIL.add(rock2.group);

        let trees = _this.initClass(Trees);
        trees.group.prefix = 'trees';
        MeshUIL.add(trees.group);

        let snow = _this.initClass(SnowParticles);
        // let clouds = _this.initClass(SnowClouds);

        let aurora = _this.initClass(Aurora);
        aurora.group.prefix = 'aurora';
        MeshUIL.add(aurora.group);
    }

    function loop() {
        _this.group.position.y = Math.sin(Render.TIME * 0.0005) * 0.05;
    }

    //*** Event handlers

    //*** Public methods

});