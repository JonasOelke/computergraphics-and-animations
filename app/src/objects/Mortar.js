class Mortar extends THREE.Group {
    /**
     * Imports a mortar from a fbx-file as a THREE.Group object.
     * The mortar is able to fire a cannon ball and play a sound while fireing
     * @param velocity
     * @param mass
     */
    constructor(velocity, mass) {
        super();

        this.sounds = new Map();
        this.fbxLoader = new THREE.FBXLoader();

        /*
        An initial velocity and mass can be set,
        if that's the case it is set here.
         */
        this.veloctiy = !isNaN(velocity) ? velocity : undefined;
        this.mass = !isNaN(mass) ? mass : 2;

        this.physicalBody = physicalWorld.addBox(this, "", this.mass, 150, 75,100, false, 0,40,0);

        /*
        physical bodies are set to sleep() by initialization.
        The mortar should not be asleep as this would cause no physical effect for the playerMortar.
        Therefore the physicalBody is woke up and not allowed to go to sleep anymore.

        Furthermore the physicalBody is kept as an attribute of this class. If this setting need to be changed for any reason,
        it can be done by just calling this.physicalBody.[any property or method supplied]
         */
        this.physicalBody.wakeUp();
        this.physicalBody.allowSleep = false;
        this.load(this);
    }

    /**
     *  Loads the fbx-model and adds all meshes as children to this class
     * @param {THREE.Group} thisFBX
     */
    load(thisFBX) {
        this.fbxLoader.load("src/models/old_mortar1.fbx", function (fbx) {
            /*
            as the mortar fbx has physical materials that three js does not support (and causing problems when trying to import),
            the material is overwritten by a newly created material that just contains the diffuse and normal map.
             */
            let texture = new THREE.TextureLoader().load("src/images/mortar_basecolor.png");
            let normalmap = new THREE.TextureLoader().load("src/images/mortar_normalmap.png");

            fbx.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, map: texture, normalMap: normalmap});
                }
                //the object has a plane where the mortar stands on, we do not want to see it so the object needs not to be visible
                if (child.name === "Plane") {
                    child.visible = false;
                }
            });
            thisFBX.add(fbx);
        });
    }

    /**
     *
     * @param {Soundscape} soundscape The soundscape object for your scene.
     */
    loadSounds(soundscape) {
        let fire = soundscape.createSound("src/sound/files/mortar_fire.mp3", 500, false);
        this.sounds.set("fire", fire);
    }

    /**
     * @summary Plays the given sound.
     * @description Searchs for the given sound name in this.sounds.
     * If a sound was found to the matching keyword, the sound is played.
     * @param {String} sound Name of the sound to play
     */
    playSound(sound) {
        this.sounds.get(sound).play();
    }

    /**
     * Returns the sound object identified by the given string if existing.
     * @param {String} sound
     * @returns {PositionalAudio}
     */
    getSound(sound) {
        return this.sounds.get(sound);
    }

    /**
     * Moves the mortar forward assuming that the barrel's direction is forward.
     */
    move() {
        let mortarPosition = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
        let moveVector = new THREE.Vector3(1, 0, 0);

        moveVector.normalize();
        moveVector.applyEuler(this.rotation);
        moveVector.multiplyScalar(10);

        moveVector.add(mortarPosition);
        this.position.set(moveVector.x, moveVector.y, moveVector.z);

        physicalWorld.updatePositions();

    }

    /**
     * Turns this mortar in the direction of the target object
     * @param {Object3D} target the object to aim for
     * @param {Vector3} position the position in world coordinates of this mortar or parent group
     */
    aim(target, position){
        //directionalVector is this position vector subtracted from target location vector
        let directionalVector = new THREE.Vector2(target.position.x, target.position.z);
        directionalVector.sub(new THREE.Vector2(position.x,position.z));

        //if the target comes closer then 900 units the mortar will shoot
        if (directionalVector.length() < 900) {
            let factor = directionalVector.length() / 900;

            /*  the velocity depends on the actual distance but is at least 200.
                350 is a good velocity for an object in a distance of 900 units
                based on a position at about y = 350.
             */

            this.veloctiy = 350 * factor < 200 ? 200 : 350 * factor;
            this.fire();
        }

        //.angle(): Computes the angle in radians of this vector with respect to the positive x-axis.
        let rotationAngle = directionalVector.angle()

        this.setRotationFromEuler(new THREE.Euler(0,-rotationAngle,0, "XYZ"));
        physicalWorld.updatePositions();
    }

    /**
     * Fires a ball with a velocity in the direction this mortar is aiming to
     * As it looks the mortar has a shooting angle around 28 degree, this is respected
     * in the directional vector of the ball
     */
    fire() {
        /*  If the sound of the previous shot is still playing,
            another ball should not be fired and the function ends right here
         */

        if (this.getSound("fire").isPlaying) return;

        let ballRadius = 8;
        let ballGeometry = new THREE.SphereGeometry(ballRadius,16,16);
        let ball = new THREE.Mesh(ballGeometry, new THREE.MeshLambertMaterial({color:0x222233}));

        let mortarPosition = new THREE.Vector3(this.position.x, this.position.y, this.position.z);

        /*  initial position is inside the mortar mesh, trying to be as close as possible to the barrel
            but still outside the physicalBody (turn on visual debugger to see) so there should not be
            any movement of the mortar caused by two physicalBodies at the same place.
         */
        ball.position.set(mortarPosition.x, mortarPosition.y + 85, mortarPosition.z - 6);

        ball.castShadow = true;
        scene.add(ball);

        let launchAngle = 28 * DEG_TO_RAD;
        let zRotation = new THREE.Matrix3();
        zRotation.set(  Math.cos(launchAngle), -Math.sin(launchAngle), 0,
            Math.sin(launchAngle), Math.cos(launchAngle), 0,
            0,0,1);

        let velocityVectorWC = new THREE.Vector3(1, 0, 0);
        velocityVectorWC.applyMatrix3(zRotation);
        velocityVectorWC.applyEuler(this.rotation);
        velocityVectorWC.normalize();

        //if no velocity is set a random velocity between 150 and 600 is generated
        if (isNaN(this.veloctiy)) {
            const MIN = 150;
            const MAX = 600;
            this.veloctiy =  Math.floor( Math.random() * (MAX-MIN) + MIN);
        }

        velocityVectorWC.multiplyScalar(this.veloctiy);

        physicalWorld.addSpehreWithVelocity(ball, 8, ballRadius, velocityVectorWC);

        //the sound needs to be loaded by calling the loadSounds()-method and passing the scene's soundscape
        //If a sound has been loaded it start playing it
        if ( this.sounds.get("fire") != undefined) this.playSound("fire");

    }

}