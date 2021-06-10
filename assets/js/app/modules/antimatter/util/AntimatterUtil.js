Class(function AntimatterUtil() {
    Inherit(this, Component);
    var _this = this;

    //*** Constructor
    (function () {

    })();

    function createBufferArray(e, callback) {
        var size = e.size;
        var num = e.num;
        var position = new Float32Array(num * 3);
        for (var i = 0; i < num; i++) {
            position[i * 3 + 0] = (i % size) / size;
            position[i * 3 + 1] = Math.floor(i / size) / size;
            position[i * 3 + 2] = 0;
        }

        var vertices = new Float32Array(num * 4);
        for (var i = 0; i < num; i++) {
            vertices[i * 4 + 0] = Math.random(-10, 10, 4);
            vertices[i * 4 + 1] = Math.random(-10, 10, 4);
            vertices[i * 4 + 2] = Math.random(-10, 10, 4);
            vertices[i * 4 + 3] = 1;
        }

        callback({array: position, vertices: vertices});
    }

    //*** Event handlers

    //*** Public methods
    this.createBufferArray = function(size, num, callback) {
        createBufferArray({size: size, num: num}, function(data) {
            callback(data.array, data.vertices);
        });
    }
}, 'static');