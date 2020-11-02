class Radio extends THREE.Group {

    constructor() {
        super();
        this.addParts();
    }

    addParts() {

        var korpusGeometry = new THREE.BoxGeometry(30, 20, 8);
        var korpusMaterial = new THREE.MeshLambertMaterial({
            color: 0xE77C3E
        });
        var korpus = new THREE.Mesh(korpusGeometry, korpusMaterial);
        this.add(korpus);

        var antenneGeometry = new THREE.CylinderGeometry(0.25, 0.25, 25, 32, 1, false);
        antenneGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 12.5, 0));
        var antenneMaterial = new THREE.MeshLambertMaterial({
            color: 0xE7E7E7
        });
        var antenne = new THREE.Mesh(antenneGeometry, antenneMaterial);
        antenne.position.x = -13;
        antenne.position.y = 10.25;
        antenne.position.z = -2;
        antenne.rotation.z = -70 * DEG_TO_RAD;
        this.add(antenne);

        var einschalterGeometry = new THREE.BoxGeometry(3, 1, 1);
        var einschalterMaterial = new THREE.MeshLambertMaterial({
            color: 0xE7E7E7
        });
        var einschalter = new THREE.Mesh(einschalterGeometry, einschalterMaterial);
        einschalter.position.x = 10;
        einschalter.position.y = 10.5;
        einschalter.position.z = 0;
        this.add(einschalter);

        var lautsprecherteilGeometry = new THREE.BoxGeometry(28, 11.5, 1);
        var lautsprecherteilMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFEAD9
        });
        var lautsprecherteil = new THREE.Mesh(lautsprecherteilGeometry, lautsprecherteilMaterial);
        lautsprecherteil.position.x = 0;
        lautsprecherteil.position.y = -3;
        lautsprecherteil.position.z = 3.75;
        this.add(lautsprecherteil);
    }
}