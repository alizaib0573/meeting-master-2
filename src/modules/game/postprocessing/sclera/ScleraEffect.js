let THREE;
if (process.browser) {
    THREE = require('three');
}

import { BlendFunction, Effect } from "postprocessing";

import fragmentShader from "./shader.frag";

export default class ScleraEffect extends Effect {

	constructor(options = {}) {

		const settings = Object.assign({
			blendFunction: BlendFunction.NORMAL,
			// width: 0.5,
			// height: 0.5,
			// offsetY: 0,
			// smoothness: 0.4,
			// roundness: 1.0,

			// xy scale
			scale: new THREE.Vector2(1, 1),
			// aspect ratio for vignette
			opacity: 0,
			aspect: 1,
			// radial gradient colors A->B
			color1: [1, 1, 1],
			color2: [0, 0, 0],
			// smoothstep low/high input
			smoothing: new THREE.Vector2(-0.5, 0.5),
			// % opacity of noise grain (0 -> disabled)
			noiseAlpha: 0,
			// whether or not the noise is monochromatic
			coloredNoise: false,
			// offset the vignette
			offset: new THREE.Vector2(0, 0)
		}, options);

		super("ScleraEffect", fragmentShader, {
			blendFunction: settings.blendFunction,

			uniforms: new Map([
				["noiseAlpha", new THREE.Uniform(settings.noiseAlpha)],
				["coloredNoise", new THREE.Uniform(settings.coloredNoise)],
				["opacity", new THREE.Uniform(settings.opacity)],
				["scale", new THREE.Uniform(settings.scale)],
				["aspect", new THREE.Uniform(settings.aspect)],
				["color1", new THREE.Uniform(settings.color1)],
				["color2", new THREE.Uniform(settings.color2)],
				["smoothing", new THREE.Uniform(settings.smoothing)],
				["offset", new THREE.Uniform(settings.offset)],
			])
		});
	}
}