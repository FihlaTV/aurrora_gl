Class(function VFX() {
    Inherit(this, Component);
    const _this = this;

    //*** Constructor
    (function () {
        initComposite();
    })();

    function initComposite() {
        let pass = _this.initClass(NukePass, 'Composite', {
            tIceRef: {value: Utils3D.getRepeatTexture('assets/images/ice/reflect.jpg')},
            tSSAO: {value: FX.SSAO.instance().rt.texture},
            tGlobe: {value: FX.Globe.instance().rt.texture},
            uResolution: World.RESOLUTION,
            uSSAOBlend: {value: 0},
            uFresnel: {value: 0.5},
        });
        World.NUKE.add(pass);
        ShaderUIL.add(pass);
    }

    //*** Event handlers

    //*** Public methods

}, 'singleton');