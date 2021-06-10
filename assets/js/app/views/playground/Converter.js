Class(function Converter() {
    Inherit(this, Object3D);
    const _this = this;
    var _geom, _file;

    //*** Constructor
    (function () {
        if (Utils.query('mesh')) initMesh(Utils.query('mesh'));
        if (Utils.query('test')) test(Utils.query('test'));
        if (Utils.query('object')) initObject(Utils.query('object'));
    })();

    function test(file) {
        let geom = Utils3D.loadBufferGeometry(`geometry/resized/${file}`);
        let mat = new THREE.MeshNormalMaterial({wireframe: false, side: THREE.DoubleSide});
        let mesh = new THREE.Mesh(geom, mat);
        _this.add(mesh);
    }

    function initMesh(file) {
        let json = Assets.JSON['geometry/original/'+file];
        let geom = new THREE.BufferGeometry();
        for (let key in json.data.attributes) {
            let attrib = json.data.attributes[key];
            geom.addAttribute(key, new THREE.BufferAttribute(new Float32Array(attrib.array), attrib.itemSize));
        }

        geom.computeBoundingBox();
        let tx = geom.boundingBox.max.x + geom.boundingBox.min.x;
        let ty = geom.boundingBox.max.y + geom.boundingBox.min.y;
        let tz = geom.boundingBox.max.z + geom.boundingBox.min.z;
        geom.translate(-tx/2, -ty/2, -tz/2);

        geom.computeBoundingSphere();
        let scale = 1 / geom.boundingSphere.radius;
        geom.scale(scale, scale, scale);

        let mat = new THREE.MeshNormalMaterial({wireframe: true});
        let mesh = new THREE.Mesh(geom, mat);
        _this.add(mesh);
        
        _geom = geom;
        _file = file;
    }

    function initObject(file) {
        let base, tree, both = null;
        let json = Assets.JSON['geometry/original/'+file];
        json.geometries.forEach((g, i) => {
            let geom = new THREE.BufferGeometry();
            for (let key in g.data.attributes) {
                let attrib = g.data.attributes[key];
                geom.addAttribute(key, new THREE.BufferAttribute(new Float32Array(attrib.array), attrib.itemSize));
            }

            if (!both) both = geom;
            both.merge(geom);

            if (i == 0) {
                base = geom;
            } else {
                if (!tree) tree = geom;
                else {
                    tree.merge(geom);
                }
            }
        });

        both.computeBoundingBox();
        let tx = both.boundingBox.max.x + both.boundingBox.min.x;
        let ty = both.boundingBox.max.y + both.boundingBox.min.y;
        let tz = both.boundingBox.max.z + both.boundingBox.min.z;
        both.translate(-tx/2, -ty/2, -tz/2);

        both.computeBoundingSphere();
        let scale = 1 / both.boundingSphere.radius;
        both.scale(scale, scale, scale);

        [base, tree].forEach(geom => {
            geom.computeBoundingBox();
            let tx = geom.boundingBox.max.x + geom.boundingBox.min.x;
            let ty = geom.boundingBox.max.y + geom.boundingBox.min.y;
            let tz = geom.boundingBox.max.z + geom.boundingBox.min.z;
            geom.translate(-tx/2, -ty/2, -tz/2);

            geom.computeBoundingSphere();
            let scale = 1 / geom.boundingSphere.radius;
            geom.scale(scale, scale, scale);
        });

        let mat = new THREE.MeshNormalMaterial({wireframe: true});
        let mesh = new THREE.Mesh(base, mat);
        _this.add(mesh);

        _geom = base;
        _file = file;
    }

    function getJSON() {
        let output = _geom.toJSON();
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

    //*** Event handlers

    //*** Public methods
    Dev.expose('save', _ => {
        Dev.writeFile(`assets/geometry/resized/${_file}.json?compress`, getJSON());
    });
});