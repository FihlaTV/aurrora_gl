Class(function FloatTest() {
    Inherit(this, Object3D);
    const _this = this;
    var _rt;

    var _scene = new THREE.Scene();
    var _camera = World.CAMERA.clone();

    //*** Constructor
    (async function () {
        var parameters = {minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBuffer: false, type: THREE.FloatType};
        _rt =  new THREE.WebGLRenderTarget(128, 128, parameters);
        _rt.texture.generateMipmaps = false;
        // await _this.wait(2000);
        initMesh();
        initTest();
        World.SCENE.add(_this.group);
    })();

    function initTest() {
        _rt.texture.minFilter = _rt.texture.magFilter = THREE.NearestFilter;
        let shader = _this.initClass(Shader, 'WorldQuad', {
            tMap: {value: _rt.texture}
        });
        let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), shader.material);
        World.SCENE.add(mesh);
    }

    function initMesh() {
        let count = 128 * 128;
        let data = new Float32Array(count * 4);
        for (let i = 0; i < count; i++) {
            data[i * 4 + 0] = 1.0;
            // data[i * 4 + 1] = 0.0;
            // data[i * 4 + 2] = 0.0;
            // data[i * 4 + 3] = 0.0;
            data[i * 4 + 1] = Math.random(-3, 3, 4);
            data[i * 4 + 2] = Math.random(-3, 3, 4);
            data[i * 4 + 3] = Math.random(-3, 3, 4);
        }

        let texture = new THREE.DataTexture(data, 128, 128, THREE.RGBAFormat, THREE.FloatType);
        texture.needsUpdate = true;
        let shader = _this.initClass(Shader, 'ScreenQuad', {
            tMap: {value: texture}
        });
        let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), shader.material);
        _scene.add(mesh);

        World.RENDERER.autoClear = false;
        World.RENDERER.render(_scene, _camera, _rt);
        World.RENDERER.autoClear = true;
    }

    //*** Event handlers

    //*** Public methods

});