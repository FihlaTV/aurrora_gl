Class(function BasicPass() {
    Inherit(this, NukePass);
    var _this = this;

    this.fragmentShader = [
        'varying vec2 vUv;',
        'uniform sampler2D tDiffuse;',
        'void main() {',
        'gl_FragColor = texture2D(tDiffuse, vUv);',
        '}'
    ];

    this.init(this.fragmentShader);

});