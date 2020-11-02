class Soundscape {

    constructor() {

        this.audioListener = new THREE.AudioListener();
        this.audioLoader = new THREE.AudioLoader();
    }

    getAudioListener() {

        return this.audioListener;
    }

    createSound(path, refDistance = 10, directional = false) {

        var sound = new THREE.PositionalAudio(this.audioListener);

        this.audioLoader.load(path, function (buffer) {

            sound.setBuffer(buffer);
            sound.setRefDistance(refDistance);

            if (directional) {

                // Apply a directional sound (omnidirectional otherwise)
                // Parameters: inner angle, outer angle, outer angle gain
                sound.setDirectionalCone(150, 180, 0.3);
            }
        });

        return sound;
    }
}