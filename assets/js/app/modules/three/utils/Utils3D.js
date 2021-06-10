Class(function Utils3D() {
    var _this = this;
    var _objectLoader, _geomLoader, _bufferGeomLoader;

    var _textures = {};

    AssetLoader.waitForLib('THREE', () => {
        if (!window.Vector2) {
            window.Vector2 = THREE.Vector2;
            window.Vector3 = THREE.Vector3;
            window.Vector4 = THREE.Vector4;
            window.Matrix3 = THREE.Matrix3;
            window.Matrix4 = THREE.Matrix4;
            window.Quaternion = THREE.Quaternion;
        }

        if (!window.Vec2) {
            window.Vec2 = THREE.Vector2;
            window.Vec3 = THREE.Vector3;
            window.Vec4 = THREE.Vector4;
            window.Mat3 = THREE.Matrix3;
            window.Mat4 = THREE.Matrix4;
            window.Quat = THREE.Quaternion;
        }

        if (!Hydra.LOCAL) {
            window.console.warn = function(str, msg) {};
            window.console.error = function() { };
        }
    });

    //*** Public methods
    this.decompose = function(local, world) {
        local.matrixWorld.decompose(world.position, world.quaternion, world.scale);
    };

    this.createDebug = function(size, color) {
        var geom = new THREE.IcosahedronGeometry(size || 40, 1);
        var mat = color ? new THREE.MeshBasicMaterial({color: color}) : new THREE.MeshNormalMaterial();
        return new THREE.Mesh(geom, mat);
    };

    this.createRT = function(width, height, type) {
        var params = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false, type};
        let rt = new THREE.WebGLRenderTarget(width, height, params);
        rt.texture.generateMipmaps = false;
        return rt;
    };

    this.createMultiRT = function(width, height) {
        var params = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false};
        let rt = new THREE.WebGLMultiRenderTarget(width, height, params);
        rt.texture.generateMipmaps = false;
        return rt;
    }

    this.getFloatType = function() {
        return Device.system.os == 'android' ? THREE.FloatType : THREE.HalfFloatType;
    }

    this.getTexture = function(path) {
        if (!_textures[path]) {
            let texture = new THREE.Texture();
            texture.promise = Promise.create();
            texture._dispose = texture.dispose;
            texture.dispose = function() {
                delete _textures[path];
                this._dispose();
            };
            _textures[path] = texture;

            texture.format = path.includes('jpg') ? THREE.RGBFormat : THREE.RGBAFormat;

            Assets.decodeImage(path).then(imgBmp => {
                texture.image = imgBmp;
                texture.needsUpdate = true;
                if (!THREE.Math.isPowerOfTwo(imgBmp.width * imgBmp.height)) texture.minFilter = THREE.LinearFilter;

                texture.onUpdate = function() {
                    if (imgBmp.close) imgBmp.close();
                    texture.onUpdate = null;
                };

                texture.promise.resolve();
                if (texture.onload) {
                    texture.onload();
                    texture.onload = null;
                }

            });
        }

        return _textures[path];
    };

    this.setInfinity = function(v) {
        var inf = Number.POSITIVE_INFINITY;
        v.set(inf, inf, inf);
        return v;
    };

    this.getCubemap = function(src) {
        var path = 'cube_' + (Array.isArray(src) ? src[0] : src);
        if (!_textures[path]) {
            var images = [];
            for (var i = 0; i < 6; i++) {
                var img = new Image();
                img.crossOrigin = '';
                img.src = Assets.getPath(Array.isArray(src) ? src[i] : src);
                images.push(img);
                img.onload = function() {
                    _textures[path].needsUpdate = true;
                }
            }

            let texture = new THREE.Texture();
            texture.image = images;
            texture.minFilter = THREE.LinearFilter;

            texture._dispose = texture.dispose;
            texture.dispose = function() {
                delete _textures[path];
                this._dispose();
            };
            _textures[path] = texture;

        }

        return _textures[path];
    };

    this.loadObject = function(name) {
        let json = typeof name == 'object' ? name : Assets.JSON[name];
        if (json.type == 'hydra_c4d') {
            let group = new THREE.Group();
            let mat = new THREE.MeshBasicMaterial({wireframe: true, color: 0xff000});
            json.geometries.forEach(obj => {
                let data = obj.data;
                let geometry = new THREE.BufferGeometry();

                geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(data.position), 3));
                geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(data.normal), 3));
                geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(data.uv), 2));

                let mesh = new THREE.Mesh(geometry, mat);
                mesh.position.copy(obj.position);
                mesh.rotation.x = obj.rotation.x;
                mesh.rotation.y = obj.rotation.y;
                mesh.rotation.z = obj.rotation.z;
                mesh.scale.copy(obj.scale);
                mesh.name = obj.id;
                group.add(mesh);
            });

            return group;
        } else {
            if (!_objectLoader) _objectLoader = new THREE.ObjectLoader();
            return _objectLoader.parse(Assets.JSON[name]);
        }
    };

    this.loadGeometry = function(name) {
        if (!_geomLoader) _geomLoader = new THREE.JSONLoader();
        if (!_bufferGeomLoader) _bufferGeomLoader = new THREE.BufferGeometryLoader();

        var json = Assets.JSON[name];
        if (json.type == 'BufferGeometry') {
            return _bufferGeomLoader.parse(json);
        } else {
            return _geomLoader.parse(json.data).geometry;
        }
    };

    this.disposeAllTextures = function() {
        for (var key in _textures) {
            _textures[key].dispose();
        }
    };

    this.loadBufferGeometry = function(name) {
        var data = Assets.JSON[name];
        var geometry = new THREE.BufferGeometry();
        if (data.data) data = data.data;
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(data.position), 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(data.normal || data.position.length), 3));
        geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(data.uv || data.position.length/3 * 2), 2));
        return geometry;
    };

    this.loadSkinnedGeometry = function(name) {
        var data = Assets.JSON[name];
        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(data.position), 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(data.normal), 3));
        geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(data.uv), 2));
        geometry.addAttribute('skinIndex', new THREE.BufferAttribute(new Float32Array(data.skinIndices), 4));
        geometry.addAttribute('skinWeight', new THREE.BufferAttribute(new Float32Array(data.skinWeights), 4));
        geometry.bones = data.bones.slice(0);
        return geometry;
    };

    this.loadCurve = function(obj) {
        if (typeof obj === 'string') obj = Assets.JSON[obj];
        var data = obj;
        var points = [];
        for (var j = 0; j < data.length; j += 3) {
            points.push(new THREE.Vector3(
                data[j + 0],
                data[j + 1],
                data[j + 2]
            ));
        }
        return new THREE.CatmullRomCurve3(points);
    };

    this.setLightCamera = function(light, size, near, far, texture) {
        light.shadow.camera.left = -size;
        light.shadow.camera.right = size;
        light.shadow.camera.top = size;
        light.shadow.camera.bottom = -size;
        light.castShadow = true;

        if (near) light.shadow.camera.near = near;
        if (far) light.shadow.camera.far = far;
        if (texture) light.shadow.mapSize.width = light.shadow.mapSize.height = texture;

        light.shadow.camera.updateProjectionMatrix();
    };

    this.getRepeatTexture = function(src) {
        var texture = this.getTexture(src);
        texture.onload = function() {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        };

        return texture;
    };

    this.forceVisible = function(group) {
        let setProperties = obj => {
            if (typeof obj.visible !== 'undefined') {
                obj.__visible = obj.visible;
                obj.visible = true;
            }

            if (typeof obj.frustumCulled !== 'undefined') {
                obj.__frustumCulled = obj.frustumCulled;
                obj.frustumCulled = false;
            }
        };

        let children = group.children;
        children.forEach(child => {
            setProperties(child);
            if (child.material) setProperties(child.material);
            _this.forceVisible(child);
        });
    };

    this.resetForceVisible = function(group) {
        let setProperties = obj => {
            if (typeof obj.__visible !== 'undefined') {
                obj.visible = obj.__visible;
                delete obj.__visible;
            }

            if (typeof obj.__frustumCulled !== 'undefined') {
                obj.frustumCulled = obj.__frustumCulled;
                delete obj.__frustumCulled;
            }
        };

        let children = group.children;
        children.forEach(child => {
            setProperties(child);
            if (child.material) setProperties(child.material);
            _this.resetForceVisible(child);
        });
    };

    this.findTexturesByPath = function(path) {
        let array = [];
        for (let key in _textures) {
            if (key.includes(path)) array.push(_textures[key]);
        }
        return array;
    };

    this.getHeightFromCamera = function(camera) {
        let dist = camera.position.length();
        let fov = camera.fov;
        return 2.00 * dist * Math.tan(Math.radians(fov) * 0.5);
    }

    this.getPositionFromCameraSize = function(camera, size) {
        let fov = Math.radians(camera.fov);
        return Math.abs(size / Math.sin(fov/2));
    }

    this.geomToExport = function(geom) {
        let output = geom.toJSON();
        let values = {};
        ['position', 'uv', 'normal'].forEach(key => {
            let array = [];
            values[key] = array;
            let attrib = output.data.attributes[key].array;
            for (let i = 0; i < attrib.length; i++) {
                array.push(Number(attrib[i].toFixed(3)));
            }
        });

        return values;
    }

    this.getEquiRect = function(path, refract) {
        let texture = this.getTexture(path);
        texture.mapping = refract ? THREE.EquirectangularRefractionMapping : THREE.EquirectangularReflectionMapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        return texture;
    }

}, 'static');