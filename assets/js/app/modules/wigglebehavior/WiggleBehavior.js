Class(function WiggleBehavior(_position, _angle) {
    Inherit(this, Component);
    var _this = this;
    _angle = _angle || Math.radians(Math.rand(0, 360));

    var _wobble = new Vector3();
    var _origin = new Vector3();

    this.target = _wobble;
    this.scale = 1;
    this.alpha = 0.025;
    this.speed = 1;
    this.zMove = 2;
    this.enabled = true;

    //*** Constructor
    (function () {
        if (_position) _origin.copy(_position);
    })();

    //*** Event handlers

    //*** Public methods
    this.update = function() {
        if (!_this.enabled || _this.disabled) return;
        var t = window.Render ? Render.TIME || Date.now() : Date.now();


        _wobble.x = Math.cos(_angle + t * (.00075 * _this.speed)) * (_angle + Math.sin(t * (.00095 * _this.speed)) * 200);
        _wobble.y = Math.sin(Math.asin(Math.cos(_angle + t * (.00085 * _this.speed)))) * (Math.sin(_angle + t * (.00075 * _this.speed)) * 150);
        _wobble.x *= Math.sin(_angle + t * (.00075 * _this.speed)) * 2;
        _wobble.y *= Math.cos(_angle + t * (.00065 * _this.speed)) * 1.75;
        _wobble.x *= Math.cos(_angle + t * (.00075 * _this.speed)) * 1.1;
        _wobble.y *= Math.sin(_angle + t * (.00025 * _this.speed)) * 1.15;
        _wobble.z = Math.sin(_angle + _wobble.x * 0.0025) * (100 * _this.zMove);
        _wobble.multiplyScalar(_this.scale * 0.1);

        _wobble.add(_origin);

        if (_position) {
            if (_this.ease) _position.interp(_wobble, _this.alpha, _this.ease);
            else _position.lerp(_wobble, _this.alpha);
        }
    }

    this.copyOrigin = function() {
        _origin.copyFrom(_position);
    }

    this.startRender = function() {
        Render.start(_this.update);
    }

    this.stopRender = function() {
        Render.stop(_this.update);
    }

    this.onDestroy = function() {
        Render.stop(_this.update);
    }
});