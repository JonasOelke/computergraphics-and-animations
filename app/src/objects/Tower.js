class Tower extends THREE.Group{

    constructor() {
        super();

        /*
        Translations are usually kept within the children of this class.
        But the aim()-method needs the actual position of this tower.
        So every translation is applied to this vector as well.
         */
        this.translationVec = new THREE.Vector3();

        /*
        CYLINDER DEFINITON
        ------------------
         */

        let cylinderGeometry = new THREE.CylinderGeometry(90, 90, 300, 20,1, false);
        let cylinderMaterial = this.createMaterial(3,7);
        let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.castShadow = true;
        cylinder.position.y += 150;
        cylinder.name = "turm";

        physicalWorld.addCylinder(cylinder, 2, 90, 90, 300, 20, 0,0,0, 90 * DEG_TO_RAD);

        this.add(cylinder);

        /*
        BEVEL DEFINITON
        ---------------
        */

        let bevelMaterial = this.createMaterial(1,8);

        let floorTexture = new THREE.TextureLoader().load("src/images/wood.jpg");
        floorTexture.bumpScale = 1;
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.anisotropy = 16;
        floorTexture.repeat.set(5,5);

        let floorMaterial = new THREE.MeshLambertMaterial({ color: 0x503300, map:floorTexture});

        let materialArray = [   bevelMaterial,
                                floorMaterial,
                                bevelMaterial
                            ]

        let bevelGeometry = new THREE.CylinderGeometry(120,90, 50, 20);
        let bevel = new THREE.Mesh(bevelGeometry, materialArray);
        bevel.position.y = 325;
        bevel.castShadow = true;
        bevel.receiveShadow = true;

        physicalWorld.addCylinder(bevel, 10, 120, 90, 50, 20,0,0,0,270 * DEG_TO_RAD);
        this.add(bevel);


        /*
        TOP DEFINITON
        -------------
        The top of the tower is created by rotation aroung the middle of the tower
        and putting a brick an each (or every second one at the very top) cylinder segment
        */

        let topMaterial = this.createMaterial(0.5,0.5);
        let top = new THREE.Group();

        //The bevel cylinder has 20 segments, there will be one brick on each segment
        //so we need 20 rotation steps to give each segment a brick.
        let rotationStep = 360 / 20;
        let rotation = new THREE.Matrix3();
        let angle = rotationStep * DEG_TO_RAD;
        rotation.set(   Math.cos(angle), 0, Math.sin(angle),
                        0,1,0,
                        -Math.sin(angle), 0, Math.cos(angle));

        //The first brick will be placed on the x-axis
        //going all the way around from there
        let directionVector = new THREE.Vector3(1,0,0);
        directionVector.applyMatrix3(rotation);

        //Getting the vector as long as it needs to be
        //to get the future brick's coordinates
        let outerRadius = 120;
        directionVector.multiplyScalar(outerRadius - 10);

        //r = 120, Perimeter (P) of a circle: P = 2 * PI * r
        //this will be the future width of the geometry
        let outerSegmentLength = (2 * Math.PI * outerRadius) / 20

        let topBrickGeometry = new THREE.BoxGeometry(outerSegmentLength, 30, 20,2,2,2);

        for (let i = 0; i < 20; i++) {
            let mesh = new THREE.Mesh(topBrickGeometry, topMaterial);
            mesh.position.set(directionVector.x, directionVector.y, directionVector.z)

            /*
            brick's rotation about the y-axis:
                2*PI = 360 degree -> 2*PI / 20 = the rotation difference between the segments
                108 Degree is the rotation offset to make it look good, this was just trail and error.
             */
            mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), 2 * Math.PI / 20 * i + 108 * DEG_TO_RAD);
            mesh.castShadow = true;

            physicalWorld.addBox(mesh, "", 5, outerSegmentLength - 10, 30, 20);
            top.add(mesh);

            //Rotation ist applied to direct the vector to the next brick's position. 
            directionVector.applyMatrix3(rotation);
        }

        //yOffset for the second row (box height)
        directionVector.y += 30;

        for (let i = 0; i < 20; i++) {

            let mesh = new THREE.Mesh(topBrickGeometry, topMaterial);
            mesh.position.set(directionVector.x, directionVector.y, directionVector.z)
            mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), 2 * Math.PI / 20 * i + 108 * DEG_TO_RAD);
            mesh.castShadow = true;
            directionVector.applyMatrix3(rotation);

            //just creates every second box and adds it to the physicalWorld
            if (i % 2 == 0) continue;
            physicalWorld.addBox(mesh, "", 5, outerSegmentLength, 30, 20);
            top.add(mesh);
        }

       //Translate the top to the very top of the tower
       for (let child of top.children) {
            child.position.y +=  300 + 50 + 15;
            physicalWorld.updatePositions();
        }

        this.add(top);

       /*
       MORTAR
       ------
       Every tower has a mortar at the top, aiming at targets and firing when a target comes to close
        */

        this.mortar = new Mortar();
        this.mortar.scale.set(0.5,0.5,0.5);

        //soundscape is a global variable of the main.js
        this.mortar.loadSounds(soundscape);

        //allows this mortar to sleep to avoid "slipping" caused by a pile of physical bodies
        this.mortar.physicalBody.allowSleep = true;
        this.mortar.physicalBody.sleep();

        this.mortar.position.set(0,350,0);
        this.mortar.aim(playerMortar, this.mortar.position);

        this.add(this.mortar);


    }


    /**
     * Executes the fire()-method of the tower's mortar
     * If the mortar has aimed to a target a velocity has been calculated.
     * Otherwise the velocity is random between 150 - 600
     * @see Mortar.aim()
     */
    fire() {
        this.mortar.fire();
    }

    /**
     * @summary Executes the aim()-method of the tower's mortar
     * @description The mortar turns so the barrel points to the player's mortar.
     * If the player is in a certain distance to the mortar it will execute the fire()-method as well.
     * Velocity is calculated and set to this.mortar.velocity based on the players distance.
     * @see Mortar.aim()
     */
    aim(){
        this.mortar.aim(playerMortar, this.translationVec);
    }

    /**
     * @summary creates the material for the different parts of the tower
     * @description every part of the tower needs almost the same material, they just
     * differ in how often the texture is repeated on x- and y-direction.
     * It returns the tower material with the given texture repetitions.
     * This method is for internal use only.
     * @private
     * @param repeatY
     * @param repeatX
     * @returns {MeshPhongMaterial}
     */
    createMaterial(repeatY, repeatX) {
        let fortressTexture = new THREE.TextureLoader().load("src/images/wall_texture.jpg");
        fortressTexture.bumpScale = 1;
        fortressTexture.wrapS = fortressTexture.wrapT = THREE.RepeatWrapping;
        fortressTexture.anisotropy = 16;
        fortressTexture.repeat.set(repeatX,repeatY);


        let fortressBumpMap = new THREE.TextureLoader().load("src/images/brick_bumpmap.png");
        fortressBumpMap.bumpScale = 1;
        fortressBumpMap.wrapS = fortressBumpMap.wrapT = THREE.RepeatWrapping;
        fortressBumpMap.repeat.set(repeatX,repeatY);

        let material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, map: fortressTexture, bumpMap: fortressBumpMap});

        return material;
    }

    /**
     * @summary translates every child object by the given vector
     * @description The physicalWorld needs to apply any rotation or translation directly to
     * the visual objects they are combined with (not their parent object).
     * To keep the physical bodies consistent to the visual Objects
     * any translation of the object should applied by this method instead of this.position.set()
     *
     * @param {Vector3} translation to be applied on the tower
     */
    setTranslation(translation) {
        this.translationVec.add(translation);
        for (let child of this.children) {
            if (child.children.length > 0) {
                for (let grandChild of child.children) {
                    grandChild.position.x += translation.x;
                    grandChild.position.y += translation.y;
                    grandChild.position.z += translation.z;
                    physicalWorld.updatePositions();
                }
            } else {
                child.position.x += translation.x;
                child.position.y += translation.y;
                child.position.z += translation.z;
                physicalWorld.updatePositions()
            }
        }

        this.mortar.aim(playerMortar, this.translationVec);

    }
}

