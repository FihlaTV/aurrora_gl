Class(function Main() {

    //*** Constructor
    (function() {
        init();
    })();

    function init() {
        if (Utils.query('p')) return AssetLoader.loadAllAssets(Playground.instance);
        // Container.instance();
    }

    //*** Event Handlers

    //*** Public methods
});