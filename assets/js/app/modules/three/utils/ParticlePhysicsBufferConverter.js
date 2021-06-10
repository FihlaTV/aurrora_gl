Class(function ParticlePhysicsBufferConverter(_geom, _system) {
    Inherit(this, Component);
    var _this = this;

    var _convert = [];
    var _particles = _system.particles;

    _convert.push({name: 'position', props: ['x', 'y', 'z'], size: 3});

    //*** Public methods
    this.add = function(name, props) {
        let obj = {name, props, size: props.length};
        _convert.push(obj);
        return obj;
    }

    this.exec = function() {
        var index = 0;
        var p = _particles.start();
        while (p) {
            for (var i = _convert.length - 1; i > -1; i--) {
                var obj = _convert[i];
                if (obj.disabled) continue;
                var attribute = _geom.attributes[obj.name];

                for (var j = 0; j < obj.size; j++) {
                    attribute.array[index * obj.size + j] = p[obj.props[j]] || p.pos[obj.props[j]] || 0;
                }

                attribute.needsUpdate = true;
            }

            ++index;
            p = _particles.next();
        }
    }

    this.find = function(name) {
        for (let i = 0; i < _convert.length; i++) {
            let obj = _convert[i];
            if (obj.name == name) return obj;
        }
    }
});