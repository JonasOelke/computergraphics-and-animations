raycaster = new THREE.Raycaster();

function executeRaycast(event) {

    raycaster.setFromCamera(mousePosition, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {

        var firstHit = intersects[0].object;

        if (firstHit.name === "gate") {

            let animations = firstHit.userData.animations;
            if (animations.opened && animations.on && !(animations.openAnimation.isPlaying() || animations.closeAnimation.isPlaying())) {
                animations.closeAnimation.start()
                animations.opened = false;
            } else if(!animations.opened && animations.on &&!(animations.openAnimation.isPlaying() || animations.closeAnimation.isPlaying())) {
                animations.openAnimation.start();
                animations.opened = true;
            }
        }
    }
}

/**
 * This is function is not used anymore.
 * It creates objects and physicalBodies inside of the given object.
 * This causes something quite similar to an explosion.
 * At the moment there are just yellow boxes created, but objects original material
 * and texture could be applied as well.
 *
 * So we keep this as a function that might be usefull in the future
 * @param {Object3D} obj object to explode.
 */
function explode(obj) {
    let scaling = 50;
    let geometry = new THREE.BoxGeometry(1 * scaling, 1 * scaling, 1 * scaling, 1, 1, 1,);
    let material = new THREE.MeshLambertMaterial({color: 0xffaa00});
    let width = obj.geometry.parameters.width / scaling;
    let height = obj.geometry.parameters.height / scaling;
    let depth = obj.geometry.parameters.depth / scaling;

    for (let o = 0; o < width; o += 1.2) {
        let meshX = new THREE.Mesh(geometry, material);
        meshX.castShadow = true;
        meshX.position.x = obj.position.x + o;
        meshX.position.y = obj.position.y;
        meshX.position.z = obj.position.z;
        physicalWorld.addBox(meshX, `boxX${o}`, 0.1, 1*scaling, 1*scaling, 1*scaling, true);
        scene.add(meshX)

        for (let l = 0; l < height; l += 1.2) {
            let meshY = new THREE.Mesh(geometry, material);
            meshY.castShadow = true;
            meshY.position.x = meshX.position.x;
            meshY.position.y = obj.position.y + l;
            meshY.position.z = obj.position.z;
            physicalWorld.addBox(meshY, `boxY${l}`, 0.1, 1*scaling, 1*scaling, 1*scaling, true);
            scene.add(meshY);

            for (let e = 0; e < depth; e += 1.2) {
                let meshZ = new THREE.Mesh(geometry, material);
                meshZ.castShadow = true;
                meshZ.position.x = meshX.position.x;
                meshZ.position.y = meshY.position.y;
                meshZ.position.z = obj.position.z + e;
                physicalWorld.addBox(meshZ, `boxZ${e}`, 0.1, 1*scaling, 1*scaling, 1*scaling, true);
                scene.add(meshZ)
            }
        }

    }
}