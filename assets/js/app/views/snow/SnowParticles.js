Class(function SnowParticles() {
    Inherit(this, Object3D);
    const _this = this;
    var _antimatter;

    //*** Constructor
    (function () {
        initAntimatter();
    })();

    function updateVertices() {
        let vertices = _antimatter.vertices;
        let array = vertices.buffer;
        let v3 = new Vector3();
        for (let i = 0; i < vertices.count; i++) {
            v3.set(Math.random(-100, 100), 0, Math.random(-100, 100)).normalize().multiplyScalar(Math.random(0.0, 1, 4) * 0.82);
            array[i * 4 + 0] = v3.x;
            array[i * 4 + 1] = Math.random(-0.1, 1, 3);
            array[i * 4 + 2] = v3.z;
            array[i * 4 + 3] = 1;
        }

        vertices.needsUpdate = true;
    }

    function getAttributes() {
        let attribs = _antimatter.createFloatArray(4);
        let count = attribs.length / 4;
        for (let i = 0; i < count; i++) {
            attribs[i * 4 + 0] = Math.random(0, 1, 4);
            attribs[i * 4 + 1] = Math.random(0, 1, 4);
            attribs[i * 4 + 2] = Math.random(0, 1, 4);
            attribs[i * 4 + 3] = Math.random(0, 1, 4);
        }

        return new AntimatterAttribute(attribs, 4);
    }

    async function initAntimatter() {
        _antimatter = _this.initClass(Antimatter, Math.pow(64, 2), World.RENDERER);
        await _antimatter.ready();

        _antimatter.vertexShader = 'SnowParticles';
        _antimatter.fragmentShader = 'SnowParticles';

        updateVertices();
        _this.add(_antimatter.getMesh());

        let attributes = getAttributes();

        _antimatter.geometry.addAttribute('attribs', new THREE.BufferAttribute(attributes.buffer, 4));

        _antimatter.shader.uniforms.tMap = {value: Utils3D.getTexture('assets/images/snow/particle.jpg')};
        _antimatter.shader.uniforms.uScale = {value: Global.PARTICLE_SCALE};
        _antimatter.shader.material.depthWrite = false;
        // _antimatter.shader.material.depthTest = false;
        _antimatter.shader.material.transparent = true;
        _antimatter.shader.material.blending = THREE.AdditiveBlending;

        let pass = _this.initClass(AntimatterPass, 'SnowFall');
        pass.addInput('tOrigin', _antimatter.vertices);
        pass.addInput('tAttributes', attributes);
        pass.addInput('uGravity', {type: 'f', value: 0.05});
        pass.addInput('uCurlScale', {type: 'f', value: 1.04});
        pass.addInput('uCurlSpeed', {type: 'f', value: 0.11});
        _antimatter.addPass(pass);

        ShaderUIL.add(pass);

        _this.startRender(_ => _antimatter.update());
    }

    //*** Event handlers

    //*** Public methods

});