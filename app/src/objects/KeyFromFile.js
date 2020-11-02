class KeyFromFile extends THREE.Group {

    /**
     * Creates a key
     */
    constructor() {
        super();

        this.fbxLoader = new THREE.FBXLoader();
        this.sounds = new Map();
        this.isCollected = false;
        this.load(this);

    }

    startAnimation() {
        let rotation = { x: 0, y: 1 * DEG_TO_RAD};
        let target = { x: 400, y: 360 * DEG_TO_RAD};
        let _self = this;
        let tween = new TWEEN.Tween(rotation).to(target,5000);
        tween.onUpdate(function () {
            _self.rotation.y = rotation.y;
        });
        tween.repeat(Infinity);
        tween.start();
    }

    loadSounds(soundscape) {
        let collectedSound = soundscape.createSound("src/sound/files/collected.m4a", 500, false);
        this.sounds.set("collected", collectedSound);
    }

    playSound() {
        console.log("Sound wird abgespielt");
        this.sounds.get("collected").play();
    }

    load(thisFBX) {
        this.fbxLoader.load("src/models/key.fbx", function (fbx) {
            var material = new THREE.MeshStandardMaterial({color: 0xFFDF00, metalness: 0.8, roughness: 0.3});

            fbx.traverse(function (child) {
                if (child.isMesh) {
                    child.material = material;
                    child.castShadow = true;
                }
            });

            thisFBX.add(fbx);


        });
    }
}