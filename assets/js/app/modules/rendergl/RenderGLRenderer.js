Class(function RenderGLRenderer(_renderer, _nuke) {
    Inherit(this, Component);
    const _this = this;

    //*** Event handlers

    //*** Public methods
    this.render = function(scene, camera) {
        _nuke.camera = camera;
        _this.onRenderEye && _this.onRenderEye(Stage, camera);

        if (_nuke) {
            _nuke.render();
        } else {
            _renderer.render(scene, camera);
        }
    };

    this.setSize = function(width, height) {
        _renderer.setPixelRatio(RenderGL.DPR);
        _renderer.setSize(width, height);
    };
});