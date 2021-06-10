Class(function UniformColors(_hex) {
    Inherit(this, Component);
    var _this = this;

    var _output = [];
    this.uniform = {type: 'fv', value: _output};

    //*** Constructor
    (function () {
        initColors();
    })();

    function initColors() {
        for (let hex of _hex) {
            let color = new THREE.Color(hex);
            _output.push(color.r);
            _output.push(color.g);
            _output.push(color.b);
        }

    }

    //*** Event handlers

    //*** Public methods

});