Class(function Container() {
    Inherit(this, Element);
    const _this = this;
    const $this = this.element;

    //*** Constructor
    (function () {
        initHTML();
        loadView();
    })();

    function initHTML() {
        Stage.add($this);
        $this.css({position: 'static'});
    }

    function loadView() {
        let loaderView = _this.initClass(LoaderView);
        let loader = _this.initClass(AssetLoader, Assets.list());
        _this.events.sub(loader, Events.PROGRESS, loaderView.progress);
        _this.events.sub(loader, Events.COMPLETE, () => {
            loaderView.animateOut(() => loaderView = loaderView.destroy());
            initView();
        });
    }

    function initView() {
        World.instance();
        $this.add(World.ELEMENT);

        _this.initClass(SceneView);
        // _this.initClass(TestScene);
        // _this.initClass(FloatTest);
    }

    //*** Event handlers

    //*** Public methods

}, 'singleton');