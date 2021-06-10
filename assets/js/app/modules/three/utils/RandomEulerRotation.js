Class(function RandomEulerRotation(_container) {
    var _this = this;

    var _euler = ['x', 'y', 'z'];
    var _rot;

    this.speed = 1;

    //*** Constructor
    (function () {
        initRotation();
    })();

    function initRotation() {
        _rot = {};
        _rot.x = Math.random(0, 2);
        _rot.y = Math.random(0, 2);
        _rot.z = Math.random(0, 2);
        _rot.vx = Math.random(-5, 5) * 0.0025;
        _rot.vy = Math.random(-5, 5) * 0.0025;
        _rot.vz = Math.random(-5, 5) * 0.0025;
    }

    //*** Event handlers

    //*** Public methods
    this.update = function() {
        var time = Render.TIME;
        for (var i = 0; i < 3; i++) {
            var v = _euler[i];
            switch (_rot[v]) {
                case 0: _container.rotation[v] += Math.cos(Math.sin(time * .25)) * _rot['v' + v] * _this.speed; break;
                case 1: _container.rotation[v] += Math.cos(Math.sin(time * .25)) * _rot['v' + v] * _this.speed; break;
                case 2: _container.rotation[v] += Math.cos(Math.cos(time * .25)) * _rot['v' + v] * _this.speed; break;
            }
        }
    }

    this.startRender = function() {
        Render.start(_this.update);
    }

    this.stopRender = function() {
        Render.stop(_this.update);
    }

    this.onDestroy = function() {
        this.stopRender();
    }
});