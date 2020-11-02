class Wall extends THREE.Group{

    /**
     * Creates a wall of a custom size containing textures and physics
     * @param {number} boxSize Size of a box
     * @param {number} height numbers of rows
     * @param {number} width numbers of boxes in a line
     * @param {boolean} gateWall set to true to have one side ending with a csg and the other with a flat box. Default is false.
     * @constructor
     */
    constructor(boxSize, height, width, gateWall = false) {
        super();
        this.gateWall = gateWall;
        this.initialize(boxSize, height, width, gateWall);

    }

    initialize(boxSize, height, width, gateWall) {
        let brickGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize, 1, 1, 1,);

        let wallTexture = new THREE.TextureLoader().load("src/images/wall_texture.jpg");
        wallTexture.bumpScale = 1;
        wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set( 1, 1 );
        wallTexture.anisotropy = 16;

        let wallBumpMap = new THREE.TextureLoader().load("src/images/brick_bumpmap.png");
        wallBumpMap.bumpScale = 1;
        wallBumpMap.wrapS = wallBumpMap.wrapT = THREE.RepeatWrapping;
        wallBumpMap.repeat.set(1,1);

        let material = new THREE.MeshPhongMaterial({map: wallTexture, bumpMap: wallBumpMap});

        //set the xOffset to the very left to keep the pivot in the middle
        //set the yOffset to place the wall on the ground (y = 0)
        let xOffset = -width*boxSize / 2;
        let yOffset = boxSize / 2;

        /**
         * @author Jörg Viola from Stackoverflow
         * https://stackoverflow.com/questions/20774648/three-js-generate-uv-coordinate
         * @param {THREE.Geometry} scope geometry to recompute to the uv-coordinates
         * @param {boolean} copy if true, existing uv-coordinates will be overwritten by the calculated ones
         * otherwise the computed values will ne pushed to the faceVertexUVs-Array
         */
        function assignUVs(scope, copy = false) {

            scope.computeBoundingBox();

            var max     = scope.boundingBox.max;
            var min     = scope.boundingBox.min;

            var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
            var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

            if (!copy) {
                scope.faceVertexUvs[0] = [];
            }
            var faces = scope.faces;

            for (let i = 0; i < scope.faces.length ; i++) {

                var v1 = scope.vertices[faces[i].a];
                var v2 = scope.vertices[faces[i].b];
                var v3 = scope.vertices[faces[i].c];

                var uv0 = new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y );
                var uv1 = new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y );
                var uv2 = new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y );

                if (copy) {
                    var uvs =scope.faceVertexUvs[0][i];
                    uvs[0].copy(uv0);
                    uvs[1].copy(uv1);
                    uvs[2].copy(uv2);
                } else {
                    scope.faceVertexUvs[0].push([uv0, uv1, uv2]);
                }
            }

            scope.uvsNeedUpdate = true;
        }

        //One loop represents one row
        for (let i = 0; i < height; i++) {

            /*
             * This texture ist slightly different to the one above. Because the threecsg-Mesh is a little messed up and has no
             * computed uv-coordinates, some of them are recomputed through the "assignUVs"-function. For the top side of this mesh
             * a PlaneGeometry was added given an adjusted texture from the above, where the subtracted part is transparent.
             */
            let firstTexture = new THREE.TextureLoader().load("src/images/wall-side_texture.png");
            firstTexture.premultiplyAlpha = true;
            firstTexture.bumpScale = 1;
            firstTexture.wrapS = firstTexture.wrapT = THREE.RepeatWrapping;
            firstTexture.repeat.set( 1, 1 );
            firstTexture.anisotropy = 16;

            let firstMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFFF, map: firstTexture, transparent: true, bumpMap: wallBumpMap});
            let box = new THREE.Mesh(brickGeometry, firstMaterial);

            //Create a Geometry to subtract from the brickBox - this needs to be very similar the size of the Tower() you create
            let cylinderGeometry =  new THREE.CylinderGeometry(90, 90, 300, 20,1, false);
            let cylinder = new THREE.Mesh(cylinderGeometry);

            //xOffset to put the Cylinder nearly in the right place of the box
            //(this applies to a [r = 90]-Cylinder and a box with boxSize = 100
            cylinder.position.x = -97.5;

            let firstBrickMesh = threecsg.subtract(box, cylinder, material);
            assignUVs(firstBrickMesh.geometry);

            let firstBrickPlaneGeometry = new THREE.PlaneGeometry(boxSize - 26, boxSize, 1, 1);
            let firstBrickPlane = new THREE.Mesh(firstBrickPlaneGeometry, firstMaterial);
            firstBrickPlane.rotateX(-90 * DEG_TO_RAD);

            //puts the plane not directly ontop of the mesh but a little bit above
            //to avoid flickering caused by two textures at the same places
            firstBrickPlane.position.y += boxSize /2 + 0.1;

            //xOffset to move the mesh as close as possible to the tower
            firstBrickMesh.position.x += -13.5;

            //Group that parents the created csg and the plane with the applied texture
            let firstBrick = new THREE.Group();
            firstBrick.add(firstBrickMesh);
            firstBrick.add(firstBrickPlane);
            firstBrick.castShadow = true;
            firstBrick.name = "firstBrick";
            firstBrick.position.set(xOffset + 13.5, yOffset, 0);

            //dimX is reduced to avoid colliding with the tower's physical body
            physicalWorld.addBox(firstBrick, "", 3, boxSize - 45, boxSize, boxSize, false, +8);

            xOffset += boxSize;
            this.add(firstBrick);

            //for this row [i] every box between the first (k = 0) and the last (width - 1) is created
            for (let k = 1; k < width -1; k++) {
                let brick = new THREE.Mesh(brickGeometry, material)
                brick.position.set(xOffset, yOffset, 0);
                physicalWorld.addBox(brick, "", 3, boxSize, boxSize, boxSize);
                brick.castShadow = true;
                xOffset += boxSize;
                this.add(brick);
            }

            //the creation of the last brick depents on wether this wall will be next to a gate [gateWall = true]
            //(then there will not be a csg but a half sized box at the end) or not.
            let lastBrick;

            if (this.gateWall) {
                let newGeometry = new THREE.BoxGeometry(boxSize / 2, boxSize, boxSize, 1,1,1);
                lastBrick = new THREE.Mesh(newGeometry, material);
                lastBrick.position.set(xOffset - 25, yOffset, 0);
                physicalWorld.addBox(lastBrick, "", 3, boxSize / 2, boxSize, boxSize);
                xOffset += boxSize;

            } else {
                lastBrick = firstBrick.clone(true);
                lastBrick.position.set(xOffset - 13.5, yOffset, 0);
                lastBrick.rotateY(180 * DEG_TO_RAD);
                physicalWorld.addBox(lastBrick, "", 3, boxSize - 45, boxSize, boxSize, false, +8);
                lastBrick.castShadow = true;
                xOffset += boxSize;
            }

            this.add(lastBrick);

            //the xOffset is reset to the very left
            //the yOffset is increased by the box size as the next mesh goes to the next row
            xOffset = -width*boxSize / 2;
            yOffset += boxSize
        }
    }

    /**
     * @summary rotates the wall around the y-axis
     * @description The physicalWorld needs to apply any rotation or translation directly to
     * the visual objects they are combined with (not their parent object).
     * To keep the physical bodies consistent to the visual Objects
     * the rotateY function is overwritten.
     *
     * @param {number} angle rotation angle in radians
     */
    rotateY(angle) {

        for (let child of this.children) {

            //Matrix for a Rotation around the y-axis
            let rotation = new THREE.Matrix3();
            rotation.set(   Math.cos(angle), 0, Math.sin(angle),
                        0,1,0,
                            -Math.sin(angle), 0, Math.cos(angle));

            child.position.applyMatrix3(rotation);

            //The child itself is rotated as well
            //to keep the the facing direction matching to the applied rotation
            child.rotateY(angle);

            physicalWorld.updatePositions();
        }
    }

    /**
     * moves every child of this object by the given vector
     * @see rotateY
     * @param {THREE.Vector3} translation
     */
    setTranslation(translation) {
        for (const child of this.children) {
            child.position.add(translation);
            physicalWorld.updatePositions();
        }
    }
}
