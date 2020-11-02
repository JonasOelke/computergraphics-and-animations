class Gate extends THREE.Group{

    constructor() {
        super();

        let gateGeometry = new THREE.BoxGeometry(220,300,20,1,1,1);

        let gateTexture = new THREE.TextureLoader().load("src/images/wood_gate.jpg");
        gateTexture.repeat.set(2,3);
        gateTexture.encoding = THREE.LinearEncoding;
        gateTexture.wrapS = gateTexture.wrapT = THREE.RepeatWrapping;
        gateTexture.anisotropy = 16;

        let gateMaterial = new THREE.MeshLambertMaterial({color: 0xAAAAAA, map: gateTexture});

        let gate = new THREE.Mesh(gateGeometry, gateMaterial);

        //yOffset to place the gate on the ground [y = 0]
        gate.position.y = 150;
        gate.castShadow = true;
        gate.name = "gate";

        /*
        OPENING AND CLOSING ANIMATION
        -----------------------------
         */

        //You can't call this class by using "this" inside an eventfunction,
        //use _self instead.
        let _self = this;
        let startPosition;
        let openingRotation = {rotateX: 0};
        let openingRotationTarget = {rotateX: 90 * DEG_TO_RAD};

        /*
        The starting position is saved in the startPosition-Vector.
        The rotateX-Value of the rotation Object is increased every TWEEN.Update()-call.
        When applying the new rotation during the animation the position and the rotation is reset
        to the values before the new (increased) rotation is applied.

        To have the gate rotation about the x-axis and not about the gate itself, the "gate"-mesh
        is translated half of the gate height on the y-axis inside this class so the gates bottom
        is a the class pivot.

        When calling the _self.rotateX()-method a rotation matrix is applied to all children of this THREE.Group
        including the gate-mesh. The gate-mesh gets a new position and new rotation in respect to this class.
        This is why they need to be reset each step even if it looks like the gates rotation and position should not have been changed.

         */
        let openTween = new TWEEN.Tween(openingRotation).to(openingRotationTarget, 2000);
        openTween.onStart(function () {
            startPosition = gate.position.clone();
        });
        openTween.onUpdate(function () {
            gate.position.set(startPosition.x, startPosition.y, startPosition.z);
            gate.rotation.set(0,0,0);
            _self.rotateX(openingRotation.rotateX);
        });
        openTween.onComplete(function () {
            gate.position.y += 10;
        });

        /*
        See explanation above. It's simply the same thing just backwards.
         */
        let closingRotation = {rotateX: 0};
        let closingRotationTarget = {rotateX: 90 * DEG_TO_RAD};
        let closeTween = new TWEEN.Tween(closingRotation).to(closingRotationTarget, 2000);
        closeTween.onStart(function () {
            if (openTween.isPlaying()) closeTween.stop();
            startPosition = gate.position.clone();
        });
        closeTween.onUpdate(function () {
            gate.position.set(startPosition.x, startPosition.y, startPosition.z);

            //because the closing rotation should just be called when it is already open,
            //the rotation is set the value it should have after being opened
            gate.setRotationFromEuler(new THREE.Euler(90 * DEG_TO_RAD, 0,0));

            //decreasing the rotation from -1 to -90 degree as a rotation of 90 degree
            //subtracted by 90 degree means no rotation. And this is what we want to achieve.
            _self.rotateX(-closingRotation.rotateX);
        });


        /*
        Animations are usually always executed when calling them. The parameters "on" and "opened" must be used from external.
        There is ne pre-animation state checking implemented yet - note that this might change in the future.
        @TODO: Implement pre-animation state checking
         */
        gate.userData.animations = {on: true, opened: false, openAnimation: openTween, closeAnimation: closeTween};

        //If the gate has been attacked, there must have been a collision between the gate and another object causing
        //dispatch of the "collide" event. Animations should not be started in this case,
        //so the animation state "on" is set to false.
        physicalWorld.addBox(gate, "", 1, 220,300, 15).addEventListener("collide", function () {
            gate.userData.animations.on = false;
        });

        this.add(gate);
    }

    /**
     * @summary rotates the wall around the x-axis
     * @description The physicalWorld needs to apply any rotation or translation directly to
     * the visual objects they are combined with (not their parent object).
     * To keep the physical bodies consistent to the visual Objects
     * the rotateY function is overwritten.
     *
     * @param {number} angle rotation angle in radians
     */
    rotateX(angle) {

        for (let child of this.children) {

            //Matrix for a Rotation around the y-axis
            let rotation = new THREE.Matrix3();
            rotation.set(   1,0,0,
                0,Math.cos(angle), -Math.sin(angle),
                0, Math.sin(angle), Math.cos(angle));

            child.position.applyMatrix3(rotation);

            //The child itself is rotated as well
            //to keep the the facing direction matching to the applied rotation
            child.rotateX(angle);
            physicalWorld.updatePositions();
        }
    }

    /**
     * moves every child of this object by the given vector
     * @see rotateX
     * @param {Vector3} translation
     */
    setTranslation(translation) {
        for (const child of this.children) {
            child.position.add(translation);
            physicalWorld.updatePositions();
        }
    }

}