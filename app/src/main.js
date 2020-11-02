// External libraries
document.write('<script type="text/javascript" src="../lib/three.js-r113/build/three.js"></script>');
document.write('<script type="text/javascript" src="../lib/three.js-r113/examples/js/controls/OrbitControls.js"></script>');
document.write('<script type="text/javascript" src="../lib/three.js-r113/examples/js/libs/inflate.min.js"></script>');
document.write('<script type="text/javascript" src="../lib/three.js-r113/examples/js/loaders/FBXLoader.js"></script>');
document.write('<script type="text/javascript" src="../lib/three.js-r113/examples/js/libs/stats.min.js"></script>');
document.write('<script type="text/javascript" src="../lib/dat.gui-0.7.7/build/dat.gui.js"></script>');
document.write('<script type="text/javascript" src="../lib/cannon.js-0.6.2/build/cannon.js"></script>');
document.write('<script type="text/javascript" src="../lib/cannon.js-0.6.2/tools/threejs/CannonDebugRenderer.js"></script>');
document.write('<script type="text/javascript" src="../lib/ThreeCSG-1/three-csg.js"></script>')
document.write('<script type="text/javascript" src="src/animation/Tween.js"></script>')

//Own classes and objects
document.write('<script type="text/javascript" src="src/physics/PhysicalWorld.js"></script>');
document.write('<script type="text/javascript" src="src/sound/Soundscape.js"></script>');
document.write('<script type="text/javascript" src="src/objects/KeyFromFile.js"></script>');
document.write('<script type="text/javascript" src="src/objects/Mortar.js"></script>');
document.write('<script type="text/javascript" src="src/objects/Wall.js"></script>');
document.write('<script type="text/javascript" src="src/objects/Fortress.js"></script>');
document.write('<script type="text/javascript" src="src/objects/Tower.js"></script>');
document.write('<script type="text/javascript" src="src/objects/Gate.js"></script>');

//Eventfunctions
document.write('<script type="text/javascript" src="src/eventfunctions/updateAspectRatio.js"></script>');
document.write('<script type="text/javascript" src="src/eventfunctions/executeKeyAction.js"></script>');
document.write('<script type="text/javascript" src="src/eventfunctions/calculateMousePosition.js"></script>');
document.write('<script type="text/javascript" src="src/eventfunctions/executeRaycast.js"></script>');
document.write('<script type="text/javascript" src="src/objects/Playground.js"></script>');

/**
 * Set this true to enable the visualDebugger, dat.Gui and framerate stats
 * @type {boolean}
 */
development = false;

/**
 * multiply with it wherever you need to convert degree to radians
 * @type {number}
 */
const DEG_TO_RAD = Math.PI / 180;

/**
 * Main function to be called right at the beginning or whenever you want to start rendering the scene
 * It also contains the mainloop()
 */
function main() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xEEfaff);
    scene.fog = new THREE.Fog( 0xEEfaff, 5000, 10000 );

    physicalWorld = new PhysicalWorld(0,-200,0,1/60,true);
    physicalWorld.getWorld().allowSleep = true;
    soundscape = new Soundscape();

    /* loadingManager = new THREE.LoadingManager( () => {

        const loadingScreen = document.getElementById( 'loading-screen' );
        loadingScreen.classList.add( 'fade-out' );

        // optional: remove loader from DOM via event listener
        loadingScreen.addEventListener( 'transitionend', onTransitionEnd );

    } ); */


    /*
   RENDERER
   --------
    */
    var clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xffffff));
    renderer.shadowMap.enabled = true;
    document.getElementById("3d_content").appendChild(renderer.domElement);

    /*
    LIGHTS
    -------
     */

    var hemiLight = new THREE.HemisphereLight( 0xDDDDFF, 0x668866 );
    hemiLight.position.set( 0, 500, 0 );
    scene.add( hemiLight );

    var light = new THREE.DirectionalLight( 0xdfebff, 1 );
    light.position.set( 77, 440, 68 );
    light.position.multiplyScalar( 1.3 );
    light.castShadow = true;

    light.shadow.mapSize.width = 2048 / 2;
    light.shadow.mapSize.height = 2048 / 2;

    /**
     * This must be quite high to render the shadows for the whole scene
     * @type {number}
     */
    var d = 6000;
    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;

    light.shadow.camera.far = 4000;

    scene.add( light );

    /*
    OBJECTS
    ------
     */

    let playground = new Playground(20000,20000,1, physicalWorld);
    scene.add(playground);

    playerMortar = new Mortar(600,2);
    playerMortar.scale.set(0.5,0.5,0.5);
    playerMortar.position.set(-50,0,900);
    playerMortar.rotateY(90 * DEG_TO_RAD);
    playerMortar.loadSounds(soundscape);
    scene.add(playerMortar)

    fortress = new Fortress();
    scene.add(fortress);

    key = new KeyFromFile();
    key.scale.x = key.scale.y = key.scale.z = 5;
    key.position.set(-100,100,-600);
    key.loadSounds(soundscape);
    key.startAnimation();
    scene.add(key);

    /*
    CAMERA AND ORBIT CONTROLS
    ------
     */
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 1600, 2600);
    camera.add(soundscape.getAudioListener());
    camera.lookAt(0, 83, 0);

    let orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.target = new THREE.Vector3(0, 83, 0);
    orbitControls.enableKeys = false;
    orbitControls.minDistance = 2000;
    orbitControls.maxDistance = 5000;

    //Limit the user rotation to 90 degree so they cannot rotate below the playground.
    orbitControls.maxPolarAngle = Math.PI / 2;
    orbitControls.update();

    /*
    DEVELOPMENT OPTIONS
    -------------------
     */
    if (development) {

        physicsVisualDebugger = new THREE.CannonDebugRenderer(scene, physicalWorld.getWorld());
        let axes = new THREE.AxesHelper(20);
        scene.add(axes);

        stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);

        var gui = new dat.GUI();
        gui.add(light.position, "x", -200, 200);
        gui.add(light.position, "y", -200, 2000);
        gui.add(light.position, "z", -200, 200);
    }

    function mainLoop() {
        if (development) stats.begin()
        if (development) physicsVisualDebugger.update();

        var delta = clock.getDelta();

        //Update animations
        TWEEN.update();

        //Update physical world
        physicalWorld.update(delta);

        renderer.render(scene, camera);

        if (development) stats.end();

        requestAnimationFrame(mainLoop);
    }

    mainLoop()

    window.onresize = updateAspectRatio;
    window.onmousemove = calculateMousePosition;
    window.onkeydown = keyDownAction;
    window.onkeyup = keyUpAction;

    /*
     * setting the onclick-function right from the beginning could cause a raycast on the gate
     * from the click on the starting button of the overlay. To avoid this the onClick-function
     * is set one second after the scene started loading
     */
    setTimeout(function () {
        window.onclick = executeRaycast;

    }, 1000);

}

document.getElementById("startButton").addEventListener("click", function () {
    main();
    document.getElementById("overlay").remove();
});