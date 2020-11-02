class PhysicalWorld {

    /**
     * Initializes the physical world using CannonJS
     * @param {number} gravityX     Gravity in X-Direction.
     * @param {number} gravityY     Gravity in Y-Direction.
     * @param {number} gravityZ     Gravtiy in Z-Direction.
     * @param {number} stepsize     Updating stepsize.
     * @param {boolean} addfloor    If true, adds a floor at y = 0 to the whole world.
     */
    constructor(gravityX, gravityY= -200, gravityZ, stepsize, addfloor = false) {
        this.world = new CANNON.World();
        this.stepSize = 0;
        this.timeToGo = 0;
        this.visualObjects = [];
        this.physicalBodies = [];
        this.bodiesToBeRemoved = [];

        /* this.testMaterial = new CANNON.Material();
        this.testMaterial.friction = 0.0;
        this.testMaterial.restitution = 0.8; */

        this.world.gravity.set(gravityX, gravityY, gravityZ);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.stepSize = stepsize;

    }

    /**
     * Function to be called in your update-method to update the physical-world.
     * @param delta
     */
    update(delta) {

        // Step physics world forward
        this.timeToGo += delta;
        while (this.timeToGo >= this.stepSize) {
            this.world.step(this.stepSize);
            this.timeToGo -= this.stepSize;
        }
        // Copy transformations
        for (let i = 0; i < this.visualObjects.length; i++) {
            this.visualObjects[i].position.copy(this.physicalBodies[i].position);
            this.visualObjects[i].quaternion.copy(this.physicalBodies[i].quaternion);

            //during the update-Method the to be removed bodies (or the one with an expired ttl) are beeing add to an array holding of them
            //the need to be removed after the update method to ensure the physical bodies are fully calculated when removing them.
            this.removeBodies();
        }

    }

    /**
     * @summary update the position of the physical bodies
     * @description If the position of the visual object changed without the change being caused by a physical collision
     * the position of the physical body needs to be adjusted. This function copies the visual object position into the
     * physical objects position instead the other way round.
     *
     * Not calling this function could cause no movement of visual objects, because the position of the physical body is
     * copied onto the visual object every time the this.update() is called.
     */
    updatePositions() {
        for (let i = 0; i < this.physicalBodies.length; i++) {
            this.physicalBodies[i].position.copy(this.visualObjects[i].position);
            this.physicalBodies[i].quaternion.copy(this.visualObjects[i].quaternion);

        }
    }

    /**
     * @summary adds body to the bodiesToBeRemoved-array so they will be removed during the next update call.
     * @description Physical bodies cannot be removed directly,
     * they need to be fully calculated before removing them from the world.
     * Therefore an array is created holding all of the bodies that should be removed from the world.
     * After the body's position is calculated during the update method all bodies in that array will be removed from the visual and physical world.
     * @param {CANNON.Body} body
     */
    addBodyToBeRemoved(body) {
        /*
        The ground cannot be removed!
         */
        if (!(body.name === "ground")){
            this.bodiesToBeRemoved.push(body);
        }
    }

    /**
     * removes all the bodies in this.bodiesToBeRemoved-array from physical and visual world.
     */
    removeBodies(){
        if (this.bodiesToBeRemoved.length > 0) {
            console.log(this.bodiesToBeRemoved);

            for (let k = 0; k < this.bodiesToBeRemoved.length; k++) {
                let body = this.bodiesToBeRemoved.pop()
                let i = this.physicalBodies.indexOf(body)
                this.physicalBodies.splice(i);
                scene.remove(this.visualObjects[i]);
                this.visualObjects.splice(i);
                this.world.remove(body);
            }
        }
    }

    /**
     * Returns the World with all physical bodies and objects.
     * @returns {CANNON.World}
     */
    getWorld() {
        return this.world;
    }

    /**
     * adds the combination of the physical body and visual objects to identify them when calling just one of them.
     * @param visualObject
     * @param body
     */
    addPair(visualObject, body) {
        this.visualObjects.push(visualObject);
        this.physicalBodies.push(body);
    }

    /**
     * Creates a box collider for a given visual object. Initially set to sleep.
     * @param visualObject the visual object to add the physical body to
     * @param name name of the future physicalBody
     * @param mass mass of the physical body
     * @param dimX x-length of the physical body
     * @param dimY y-length of the physical body
     * @param dimZ z-length of the physical body
     * @param exploding set true if this body is created by the exploding function
     * @param offsetX x-offset of the physical body in respect to the visual objects position
     * @param offsetY y-offset of the physical body in respect to the visual objects position
     * @param offsetZ z-offset of the physical body in respect to the visual objects position
     * @returns {Body}
     */
    addBox(visualObject, name, mass, dimX, dimY, dimZ, exploding = false, offsetX = 0, offsetY = 0, offsetZ = 0) {
        let dimension = new CANNON.Vec3(dimX / 2, dimY / 2, dimZ / 2);
        let offset = new CANNON.Vec3(offsetX,offsetY,offsetZ);
        let body = new CANNON.Body({mass:mass});
        body.userData = {ttl: 0};

        /*
        Sets the physical body to sleep to avoid initial sliding of stacked objects.
        Objects will wake up when the collide with a non sleeping object.

        If the body moves so slow that this could be caused by the sliding-bug,
        the physical body will go to sleep again.

        For more informations about this bug visit: https://github.com/schteppe/cannon.js/issues/348
         */
        body.allowSleep = true;
        body.sleep()
        body.sleepSpeedLimit = 3;
        body.sleepTimeLimit = 0.1;
        body.addEventListener("sleep", function (event) {
            this.sleep();
        })

        body.addShape(new CANNON.Box(dimension), offset);
        body.name = name;

        /*
        If exploding is set to true the body has a default time-to-live of 300 frames
        and should be removed by the update method if the ttl is expired.

        --> not implemented yet
         */
        /* if (exploding) {
            body.userData.ttl = 300;
        } */

        //Copy initial transformation from visual object
        body.position.copy(visualObject.position);
        body.quaternion.copy(visualObject.quaternion);

        this.world.addBody(body);
        this.addPair(visualObject, body);

        return body;
    }

    /**
     * Creates a cylinder collider to a given visual object
     * @param visualObject the visual object to add the physical body to
     * @param mass mass of the physical body
     * @param upperRadius upper radius of the physical body
     * @param lowerRadius lower radius of the physical body
     * @param height cylinder's height
     * @param segments number of segments the cylinder is made of - the higher the segments the rounder the physical body
     * @param offsetX x-offset of the physical body in respect to the visual objects position
     * @param offsetY y-offset of the physical body in respect to the visual objects position
     * @param offsetZ z-offset of the physical body in respect to the visual objects position
     * @param eulerX x-rotation of the physical body in respect to the visual objects position
     * @param eulerY y-rotation of the physical body in respect to the visual objects position
     * @param eulerZ z-rotation of the physical body in respect to the visual objects position
     */
    addCylinder(visualObject, mass, upperRadius, lowerRadius, height, segments,
                offsetX = 0, offsetY = 0, offsetZ = 0,
                eulerX = 0, eulerY = 0, eulerZ = 0) {

        var translation = new CANNON.Vec3(offsetX, offsetY, offsetZ);
        var rotation = new CANNON.Quaternion().setFromEuler(eulerX, eulerY, eulerZ, "XYZ");

        var body = new CANNON.Body({mass: mass});
        body.addShape(new CANNON.Cylinder(upperRadius, lowerRadius, height, segments), translation, rotation);

        /*
        See explanation in the addBox()-method
         */
        body.allowSleep = true;
        body.sleepSpeedLimit = 5;
        body.sleepTimeLimit = 0.1;
        body.addEventListener("sleep", function (event) {
            this.sleep();
        })

        body.position.copy(visualObject.position);
        body.quaternion.copy(visualObject.quaternion);

        this.world.addBody(body);

        this.addPair(visualObject, body);
    }

    /**
     * Creates a physical body in sphere shape with a given velocity
     * @param visualObject the visual object to add the physical body to
     * @param mass mass of the physical body
     * @param radius radius of the sphere
     * @param velocityVector the direction and the speed of the sphere - the longer the vector the faster the sphere will be.
     */
    addSpehreWithVelocity(visualObject, mass, radius, velocityVector) {
        let body = new CANNON.Body({mass:mass});
        body.userData = {exploding: false};
        body.addShape(new CANNON.Sphere(radius));

        body.position.copy(visualObject.position);
        body.quaternion.copy(visualObject.quaternion);
        body.name = "ball";
        body.velocity.set(velocityVector.x, velocityVector.y, velocityVector.z);

        body.allowSleep = true;
        body.sleepSpeedLimit = 5;
        body.sleepTimeLimit = 1;
        body.addEventListener("sleep", function (event) {
            this.sleep();
        })

        this.world.addBody(body);
        this.addPair(visualObject, body);

    }

}