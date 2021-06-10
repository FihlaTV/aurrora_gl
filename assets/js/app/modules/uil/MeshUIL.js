Class(function MeshUIL() {
    Inherit(this, Component);
    const _this = this;

    //*** Public methods
    this.add = function(shader) {
        return new MeshUILGroup(shader, Global.UIL);
    }
}, 'static');