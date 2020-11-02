/**
 * When triggered by window.onresize it updates camera viewport and renderer size to fit the new screen size
 * @param {Event} event     window.onresize
 */
function updateAspectRatio(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}