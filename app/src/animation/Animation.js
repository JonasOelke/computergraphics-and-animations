AnimationType = {
    TRANSLATION: 0,
    ROTATION: 1
};

AnimationAxis = {
    X: 0,
    Y: 1,
    Z: 2
};

class Animation {

    constructor(target, type, axis) {

        this.target = target;
        this.type = type;
        this.axis = axis;
        this.amount = 0;
        this.speed = 0;
        this.initialPositionIsEndPosition = true;   // true so that the object will initially not move

        this.initialPosition = target.position.clone();
        this.initialRotation = target.rotation.toVector3().clone();
    }

    setAmount(amount) {
        this.amount = amount;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    toggleEndPosition() {
        this.initialPositionIsEndPosition = !this.initialPositionIsEndPosition;
    }

    update(delta) {

        var endPositionValue = 0;

        // Assume the initial position/rotation to be the end position/rotation
        switch (this.type) {
            case AnimationType.TRANSLATION:
                endPositionValue = this.initialPosition.getComponent(this.axis);
                break;
            case AnimationType.ROTATION:
                endPositionValue = this.initialRotation.getComponent(this.axis);
                break;
        }

        // If the initial position/rotation is NOT the end position/rotation, add the animation amount
        if (!this.initialPositionIsEndPosition)
            endPositionValue += this.amount;

        // Move as required
        switch (this.type) {

            case AnimationType.TRANSLATION:

                var newTranslation = 0;

                if (Math.abs(this.target.position.getComponent(this.axis) - endPositionValue) < 0.01) {

                    // If the current position is less than 0.01 units away from the end position, set it finally
                    this.target.position.setComponent(this.axis, endPositionValue);

                } else {

                    // Else increase or decrease the current position by (speed * delta)
                    if (this.target.position.getComponent(this.axis) < endPositionValue) {
                        newTranslation = this.target.position.getComponent(this.axis) + this.speed * delta;
                    } else {
                        newTranslation = this.target.position.getComponent(this.axis) - this.speed * delta;
                    }
                    this.target.position.setComponent(this.axis, newTranslation);
                }
                break;

            case AnimationType.ROTATION:

                var newRotation = this.initialRotation.clone();

                if (Math.abs(this.target.rotation.toVector3().getComponent(this.axis) - endPositionValue) < 0.01) {

                    // If the current rotation is less than 0.01 radians away from the end rotation, set it finally
                    newRotation.setComponent(this.axis, endPositionValue);
                    this.target.rotation.setFromVector3(newRotation);

                } else {

                    // Else increase or decrease the current rotation by (speed * delta)
                    if (this.target.rotation.toVector3().getComponent(this.axis) < endPositionValue) {
                        newRotation.setComponent(this.axis, this.target.rotation.toVector3().getComponent(this.axis) + this.speed * delta);
                    } else {
                        newRotation.setComponent(this.axis, this.target.rotation.toVector3().getComponent(this.axis) - this.speed * delta);
                    }
                    this.target.rotation.setFromVector3(newRotation);
                }
                break;
        }
    }
}