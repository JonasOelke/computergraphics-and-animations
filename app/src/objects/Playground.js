class Playground extends THREE.Mesh {
    /**
     *
     * @param {number} dimX Playground-Dimension in X-Direction
     * @param {number} dimY Playground-Dimension in Y-Direction
     * @param {number} segments number of segments the playground is made of
     * @param {PhysicalWorld} physicalWorld If physics should be enabled, a physical world must be given.
     */
    constructor(dimX,dimY,segments) {
        super();

        let groundTexture = new THREE.TextureLoader().load( 'src/images/grass_texture.jpg' );
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set( 25, 25 );
        groundTexture.anisotropy = 16;
        groundTexture.encoding = THREE.sRGBEncoding;

        var groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );
        this.material = groundMaterial;
        this.geometry = new THREE.PlaneBufferGeometry( dimX, dimY );
        this.rotation.x = -90 * DEG_TO_RAD;
        this.name = "Playground";

        this.position.y = 0;
        this.rotation.x = - Math.PI / 2;

        this.receiveShadow = true;

        if (physicalWorld instanceof PhysicalWorld) {
            let material = new CANNON.Material();
            material.friction = 0;
            material.restitution = 0;
            let shape = new CANNON.Box(new CANNON.Vec3(2000,2000,0.1));
            var floor = new CANNON.Body({
                mass: 0,
                shape: shape
            });


            floor.userData = {exploding: false};
            floor.name = "ground";

            /*
             * This part could remove exploding objects when they reach the ground.
             * Could be used when the exploding function is implemented.
             */

            /* floor.addEventListener("collide", function (e) {
                console.log(e);
                if (e.target.userData.exploding) {
                    //physicalWorld.remove(e.contact.bi);
                    physicalWorld.addBodyToBeRemoved(e.target);
                } /* else if (e.contact.bj.userData.exploding) {
                    physicalWorld.addBodyToBeRemoved(e.contact.bj);
                }
            }) */

            floor.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
            physicalWorld.getWorld().addBody(floor);
        }
    }
}