FX.Class(function SSAO() {
    Inherit(this, FXScene);
    const _this = this;

    //*** Constructor
    (function () {
        _this.create(World.NUKE);
        _this.setDPR(1);
        // _this.resolution = 0.5;

        initPasses();
        // _this.startRender(_ => _this.draw());
    })();

    function initPasses() {
        let edge = _this.initClass(NukePass, 'SSAOEdge', {
            uResolution: World.RESOLUTION
        });
        _this.nuke.add(edge);

        [
            new THREE.Vector2(1 * World.DPR, 0),
            new THREE.Vector2(0, 1 * World.DPR),
            // new THREE.Vector2(1 * World.DPR, 0),
            // new THREE.Vector2(0, 1 * World.DPR),
            // new THREE.Vector2(2 * World.DPR, 0),
            // new THREE.Vector2(0, 2 * World.DPR),
        ].forEach(dir => {
            let pass = _this.initClass(NukePass, 'SSAOBlur', {
                resolution: World.RESOLUTION,
                dir: {value: dir},
            });
            _this.nuke.add(pass);
        });
    }

    //*** Event handlers

    //*** Public methods

}, 'singleton');