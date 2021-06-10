Class(function Lighting() {
    Inherit(this, Component);
    var _this = this;
    var _particleDepthShader;

    var _lights = [];

    //*** Constructor
    (function () {

    })();

    function loop() {
        decomposeLights(_lights);
    }

    function decomposeLights(lights) {
        for (var i = lights.length-1; i > -1; i--) {
            var light = lights[i];
            if (!light.parent) light.updateMatrixWorld();
            if (!light._world) light._world = new THREE.Vector3();
            light.getWorldPosition(light._world);
        }
    }

    function updateArrays(shader) {
        var lights = shader.lights;
        var lighting = shader.__lighting;
        var light;

        lighting.position.length = 0;
        lighting.color.length = 0;
        lighting.intensity.length = 0;
        lighting.distance.length = 0;

        for (var i = 0; i < lights.length; i++) {
            light = lights[i];
            lighting.position.push(light._world);
            lighting.color.push(light.color.r, light.color.g, light.color.b);
            lighting.intensity.push(light.intensity);
            lighting.distance.push(light.distance);
        }

        for (i = 0; i < _lights.length; i++) {
            light = _lights[i];
            lighting.position.push(light._world);
            lighting.color.push(light.color.r, light.color.g, light.color.b);
            lighting.intensity.push(light.intensity);
            lighting.distance.push(light.distance);
        }
    }

    //*** Event handlers

    //*** Public methods
    this.add = function(light) {
        _lights.push(light);
        Render.start(loop);
    }

    this.remove = function(light) {
        _lights.remove(light);
    }

    this.getLighting = function(shader, force) {
        if (shader.__lighting && !force) return shader.__lighting;

        var lighting = {
            position: [],
            color: [],
            intensity: [],
            distance: []
        };

        shader.__lighting = lighting;

        if (_lights[0] && !_lights[0]._world) decomposeLights(_lights);
        decomposeLights(shader.lights);
        updateArrays(shader);
        
        return lighting;
    }

    this.update = function(shader) {
        decomposeLights(shader.lights);
        updateArrays(shader);
    }


    this.sort = function(callback) {
        _lights.sort(callback);
    }

}, 'static');