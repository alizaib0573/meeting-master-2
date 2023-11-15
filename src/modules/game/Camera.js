import gsap from 'gsap';
import { lerp } from 'utils/easing';

let THREE;
if (process.browser) {
    THREE = require('three');
}

import { appStore, CONVERSATION_RESPONSE, PLAYER_RESPONSE_CORRECT } from 'stores/AppStore';

export default class Scene {   
    constructor() {
        this._hasTouch = (process.browser && ("ontouchstart" in document.documentElement)) ? true : false;

        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
        this.cameraAwake = new THREE.PerspectiveCamera(45, 1, 0.1, 10);

        this._tweenObj = {
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 0,
                y: 0,
                z: 0
            }
        }

        this._createTimeline();

        this._mousePosition = { x: 0, y: 0 };
        this._mousePositionNormalized = { x: 0, y: 0 };
        this._parallax = {
            current: { x: 0, y: 0 },
            target: { x: 0, y: 0 }
        };

        this._awakeRotationDelay = { x: -appStore.get('awakeRotationY'), y: -appStore.get('awakeRotationX'), z: (-appStore.get('awakeRotationX')*0.5)+(-appStore.get('awakeRotationY')*0.1) };

        this._playerRotation = { x: 0, y: 0, z: 0 };

        this._setupEventListeners();
    }

    destroy() {
        this._removeEventListeners();
    }

    update() {
        const cameraRotationSleepyX = (appStore.get('sleepy') * (-Math.PI * 0.18));
        const cameraRotationSleepyZ = (appStore.get('sleepy') * -0.18);

        this._parallax.current.x = lerp(this._parallax.current.x, this._parallax.target.x, 0.02);
        this._parallax.current.y = lerp(this._parallax.current.y, this._parallax.target.y, 0.02);

        this.camera.position.x = this.cameraAwake.position.x = this._tweenObj.position.x + appStore.get('cameraPositionX');
        this.camera.position.y = this.cameraAwake.position.y = this._tweenObj.position.y + appStore.get('cameraPositionY');
        this.camera.position.z = this.cameraAwake.position.z = this._tweenObj.position.z + appStore.get('cameraPositionZ');

        this._awakeRotationDelay.x = lerp(this._awakeRotationDelay.x, -appStore.get('awakeRotationY'), 0.1);
        this._awakeRotationDelay.y = lerp(this._awakeRotationDelay.y, -appStore.get('awakeRotationX'), 0.1);
        this._awakeRotationDelay.z = lerp(this._awakeRotationDelay.z, (-appStore.get('awakeRotationX')*0.5)+(-appStore.get('awakeRotationY')*0.1), 0.1);
        
        this.cameraAwake.rotation.x = -appStore.get('awakeRotationY') * (Math.PI/180);
        this.cameraAwake.rotation.y = -appStore.get('awakeRotationX') * (Math.PI/180);
        this.cameraAwake.rotation.z = 0;

        this.camera.rotation.x = (this._awakeRotationDelay.x * (Math.PI/180)) + this._tweenObj.rotation.x + this._playerRotation.x + this._parallax.current.x + appStore.get('cameraRotationX') + cameraRotationSleepyX;
        this.camera.rotation.y = (this._awakeRotationDelay.y * (Math.PI/180)) + this._tweenObj.rotation.y + this._playerRotation.y + this._parallax.current.y + appStore.get('cameraRotationY');
        this.camera.rotation.z = (this._awakeRotationDelay.z * (Math.PI/180)) + this._tweenObj.rotation.z + this._playerRotation.z + appStore.get('cameraRotationZ') + cameraRotationSleepyZ;
    }

    setSize(width, height) {
        this._width = width;
        this._height = height;

        this.camera.aspect = this.cameraAwake.aspect = width/height;

        if (this._height > this._width) {
            const horizontalFov = 45;
            this.camera.fov = this.cameraAwake.fov = (Math.atan(Math.tan(((horizontalFov / 2) * Math.PI) / 180) / this.camera.aspect) * 2 * 180) / Math.PI;
        }
        else {
            this.camera.fov = this.cameraAwake.fov = 45;
        }

        this.camera.updateProjectionMatrix();
        this.cameraAwake.updateProjectionMatrix();
    }

    _createTimeline() {
        if (this._timeline) {
            this._timeline.kill();
        }

        this._timeline = gsap.timeline({
            onComplete: () => {
                this._createTimeline();
            }
        });
        
        this._timeline.to(this._tweenObj.rotation, { duration: 2, x: this._getRand(-0.1, 0), ease: 'power1.inOut' });
        this._timeline.to(this._tweenObj.rotation, { duration: 2, y: this._getRand(-0.03, 0.03), ease: 'power1.inOut' });
        // this._timeline.to(this._tweenObj.rotation, { duration: 1, z: this._getRand(-0.1, 0.1), ease: 'power1.inOut' });

        // this._timeline.to(this._tweenObj.position, { duration: 1, x: Math.random() - 0.5, ease: 'power1.inOut' });
        // this._timeline.to(this._tweenObj.position, { duration: 1, y: Math.random() - 0.5, ease: 'power1.inOut' });
        // this._timeline.to(this._tweenObj.position, { duration: 1, z: Math.random() - 0.5, ease: 'power1.inOut' });
    }

    _getRand(min, max) {
        const distance = max - min;
        return (Math.random() * distance) - (distance*0.5)
    }

    _setupEventListeners() {
        window.addEventListener('mousemove', this._mousemoveHandler);

        appStore.addEventListener('change:conversationStatus', this._conversationStatusHandler);
    }

    _removeEventListeners() {
        window.addEventListener('mousemove', this._mousemoveHandler);

        appStore.removeEventListener('change:conversationStatus', this._conversationStatusHandler);
    }

    _mousemoveHandler = (e) => {
        if (this._hasTouch) return;

        this._mousePosition.x = e.pageX;
        this._mousePosition.y = e.pageY;

        this._mousePositionNormalized.x = (e.pageX/this._width) * 2 - 1;
        this._mousePositionNormalized.y = (e.pageY/this._height) * 2 - 1;

        this._parallax.target.x = -this._mousePositionNormalized.y * 0.02;
        this._parallax.target.y = -this._mousePositionNormalized.x * 0.05;
    }

    _agree() {
        const tl = new gsap.timeline();
        tl.to(this._playerRotation, 0.4, {x: 0.003, ease: 'power1.inOut' }, 0.5);
        tl.to(this._playerRotation, 0.4, {x: -0.006, ease: 'power1.inOut' });
        tl.to(this._playerRotation, 0.4, {x: 0.003, ease: 'power1.inOut' });
        tl.to(this._playerRotation, 0.4, {x: 0, ease: 'power1.inOut' });
    }

    _conversationStatusHandler = (value) => {
        if (appStore.get('conversationStatus') === CONVERSATION_RESPONSE && appStore.get('playerResponse') === PLAYER_RESPONSE_CORRECT) {
            this._agree();
        }
    }
}
