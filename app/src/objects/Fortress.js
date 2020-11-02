class Fortress extends THREE.Group{
    /*
     * Brick texture used the fortress is from: http://3degiovi.weebly.com/brick-wall.html
     */
    constructor() {
        super();
        this.userData.animations = [];
        this.towers = [];

        let towerFrontLeft = new Tower();
        towerFrontLeft.setTranslation(new THREE.Vector3(-600,0,-50))
        this.towers.push(towerFrontLeft);
        this.add(towerFrontLeft);


        let towerFrontRight = new Tower();
        towerFrontRight.setTranslation(new THREE.Vector3(400,0,-50));
        this.towers.push(towerFrontRight);
        this.add(towerFrontRight);

        let towerBackLeft = new Tower();
        towerBackLeft.setTranslation(new THREE.Vector3(-600,0,-1150));
        this.towers.push(towerBackLeft);
        this.add(towerBackLeft);

        let towerBackRight = new Tower();
        towerBackRight.setTranslation(new THREE.Vector3(400,0,-1150));
        this.towers.push(towerBackRight);
        this.add(towerBackRight);

        /*
        WALL DEFINITION
         */

        let wallFrontLeft = new Wall(100,3,4, true);
        wallFrontLeft.setTranslation(new THREE.Vector3(-300,0,-50));
        this.add(wallFrontLeft);

        let wallFrontRight = new Wall(100,3,4, true);
        wallFrontRight.rotateY(180*DEG_TO_RAD);
        wallFrontRight.setTranslation(new THREE.Vector3(100,0,-50));
        this.add(wallFrontRight)

        let wallLeft = new Wall(100,3,10);
        wallLeft.rotateY(90 * DEG_TO_RAD);
        wallLeft.setTranslation(new THREE.Vector3(-600,0,-650));
        this.add(wallLeft);

        let wallRight = new Wall(100,3,10);
        wallRight.rotateY(90 * DEG_TO_RAD);
        wallRight.setTranslation(new THREE.Vector3(400,0,-650));
        this.add(wallRight);

        let wallBack = new Wall(100,3,9);
        wallBack.setTranslation(new THREE.Vector3(-50,0,-1150));
        this.add(wallBack);

        let gate = new Gate();
        gate.setTranslation(new THREE.Vector3(-100,0,0));

        this.add(gate);

        /*
        Mortars on top of the Towers
         */

    }

    fire() {
        for (let tower of this.towers) {
            tower.fire();
        }
    }

    aim() {
        for (let tower of this.towers) {
            tower.aim();
        }
    }
}