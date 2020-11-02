/*
to identify keycodes go to: https://keycode.info/
 */

let spaceDown = false;

/**
 * holding all steps to execute triggered by a downkey event
 * @param event
 */
function keyDownAction(event) {
    switch (event.keyCode) {

        /*
        case 32 = space
        calls the fire()-method of the player's mortar
         */
        case 32:
            if (!spaceDown) {
                spaceDown = true;
                playerMortar.fire();

            }
            break;

        /*
        case 37 = arrow left
         */
        case 37:
            playerMortar.rotateY(10 * DEG_TO_RAD)
            physicalWorld.updatePositions()
            break;

        /*
        case 38 = arrow top
        player moves forward,

        distance to the key to collected is checked, if the player is close enough
        the key will be removed from the scene and the collecting sound of the key is played
        The game is assumed solved after this step.

        The fortress will point all of its holding mortars to the players new position
         */
        case 38:
            playerMortar.move();
            let distanceVector = playerMortar.position.distanceTo(key.position);

            if (playerMortar.position.distanceTo(key.position) < 120 && !key.isCollected) {
                key.isCollected = true;
                scene.remove(key);
                key.playSound();
            }
            fortress.aim();
            break;

        /*
        case 39 = arrow right
         */
        case 39:
            playerMortar.rotateY(-10 * DEG_TO_RAD);
            physicalWorld.updatePositions();
    }
}

function keyUpAction(event) {
    switch (event.keyCode) {
        case 32:
            if (spaceDown) spaceDown = false;
            break;
    }
}