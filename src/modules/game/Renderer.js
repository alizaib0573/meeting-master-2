import gsap from 'gsap';

import { getAsset } from 'utils/AssetLoader';
import { appStore } from 'stores/AppStore';
import { EffectComposer, EffectPass, BlurPass, SavePass, RenderPass, SMAAEffect, HueSaturationEffect, BrightnessContrastEffect, SMAAPreset, EdgeDetectionMode } from "postprocessing";
import ScleraEffect from "./postprocessing/sclera/ScleraEffect";

let THREE;
if (process.browser) {
    THREE = require('three');
}
export default class Scene {   
    constructor() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            premultipliedAlpha: true,
            stencil: false,
            alpha: false
        });
        this.renderer.debug.checkShaderErrors = false;
        const dpr = (process.browser && window.devicePixelRatio >= 1.5) ? 1.5 : 1;
        this.renderer.setPixelRatio(dpr);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setClearColor(0x4d6d8c, 1.0);
        this.renderer.shadowMap.autoUpdate = false;

        this._tweenObj = {
            blurScale: 0
        }
    }

    createComposer(scene, camera) {
        this._composer = new EffectComposer(this.renderer);
        this._clock = new THREE.Clock();        
    }

    addRenderPass(scene, camera) {
        this._scene = scene;
        this._camera = camera;

        const renderPass = new RenderPass(scene, camera);
        this._composer.addPass(renderPass);
    }

    addEffects(camera) {        
        this._smaaEffect = new SMAAEffect(
            getAsset('smaa-search'), 
            getAsset('smaa-area'),
            SMAAPreset.HIGH,
			EdgeDetectionMode.COLOR
        );
        const smaaPass = new EffectPass(camera, this._smaaEffect);
        
        const savePass = new SavePass();

        this._blurPass = new BlurPass({
            height: 720
		});
        this._blurPass.scale = 0;
        
        this._scleraEffect = new ScleraEffect();
        const scleraEffect2 = new ScleraEffect();
        this._hueSaturationEffect = new HueSaturationEffect();
        this._brightnessContrastEffect = new BrightnessContrastEffect();
        const effectPass = new EffectPass(camera, this._scleraEffect, scleraEffect2, this._hueSaturationEffect, this._brightnessContrastEffect)
            
        this._composer.addPass(smaaPass);
        this._composer.addPass(savePass);
        this._composer.addPass(this._blurPass);
        this._composer.addPass(effectPass);

        this._scleraTimeline = new gsap.timeline({ paused: true });
        this._scleraTimeline.fromTo(this._scleraEffect.uniforms.get('scale').value, 0.2, { x: 0.5, y: 0.5 }, { x: 0.35, y: 0, ease: 'none'});

        this._timelineSleepy = new gsap.timeline({ paused: true });
        this._timelineSleepy.fromTo(scleraEffect2.uniforms.get('scale').value, 9, { x: 0.5, y: 0.4 }, { x: 0.5, y: 0.25, ease: 'power3.in'}, 0);
        this._timelineSleepy.fromTo(scleraEffect2.uniforms.get('offset').value, 9, { x: 0, y: -0.2 }, { x: 0, y: -0.8, ease: 'power1.in'}, 0);
        this._timelineSleepy.fromTo(scleraEffect2.uniforms.get('smoothing').value, 9, { x: -0.5, y: 0.75 }, { x: -0.5, y: 0.5, ease: 'power1.in'}, 0);
        // more like brightness
        this._timelineSleepy.fromTo(scleraEffect2.uniforms.get('opacity'), 8.7, { value: 0.9 }, { value: 0, ease: 'none'}, 0);
        this._timelineSleepy.fromTo(scleraEffect2.uniforms.get('opacity'), 0.3, { value: 0 }, { value: -1, ease: 'none'}, 8.7);
        this._timelineSleepy.fromTo(this._tweenObj, 7, { blurScale: 0 }, { blurScale: 0.7, ease: 'power1.in'}, 0);
        
        this._timelineAwake = new gsap.timeline({ paused: true });
        this._timelineAwake.fromTo(scleraEffect2.uniforms.get('scale').value, 9, { x: 0.5, y: 0.4 }, { x: 0.5, y: 0.25, ease: 'power3.in'}, 0);
        this._timelineAwake.fromTo(scleraEffect2.uniforms.get('offset').value, 9, { x: 0, y: -0.2 }, { x: 0, y: -0.8, ease: 'power1.in'}, 0);
        this._timelineAwake.fromTo(scleraEffect2.uniforms.get('smoothing').value, 9, { x: -0.5, y: 0.75 }, { x: -0.5, y: 0.5, ease: 'power1.in'}, 0);
        // more like brightness
        this._timelineAwake.fromTo(scleraEffect2.uniforms.get('opacity'), 8.7, { value: 0.9 }, { value: 0, ease: 'none'}, 0);
        this._timelineAwake.fromTo(scleraEffect2.uniforms.get('opacity'), 0.3, { value: 0 }, { value: -1, ease: 'none'}, 8.7);

        scleraEffect2.uniforms.get('opacity').value = 0.9;
        
    }

    destroy() {
        this.renderer.dispose();
        this._composer.dispose();
    }

    render() {
        if (this._scleraTimeline) {
            const scleraProgress = appStore.get('sclera');
            this._scleraTimeline.progress(scleraProgress);
        }

        if (this._timelineSleepy) {
            const sleepyProgress = appStore.get('sleepy');
            if(sleepyProgress) {
                this._timelineSleepy.progress(sleepyProgress);
                this._scleraEffect.uniforms.get('offset').value.y = sleepyProgress * -0.8; 
            }

        }
        if (this._blurPass) {
            this._blurPass.scale = Math.max(this._tweenObj.blurScale, appStore.get('awakeBlur'));
        }

        if (this._timelineAwake) {
            const awakeProgress = appStore.get('awake');
            if (awakeProgress) {
                this._timelineAwake.progress(awakeProgress);
                this._scleraEffect.uniforms.get('offset').value.y = awakeProgress * -0.8; 
            }
        }

        if (this._hueSaturationEffect) {
            const saturation = appStore.get('saturation');
            this._hueSaturationEffect.uniforms.get('saturation').value = saturation;
        }

        if (this._brightnessContrastEffect) {
            const brightness = appStore.get('brightness');
            this._brightnessContrastEffect.uniforms.get('brightness').value = brightness;
        }

        // if(this.renderer) this.renderer.render(this._scene, this._camera);
        if(this._composer) this._composer.render(this._clock.getDelta());
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
        this._composer.setSize(width, height);
    }
}
