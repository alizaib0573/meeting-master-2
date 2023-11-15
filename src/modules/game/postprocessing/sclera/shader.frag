// #pragma glslify: vignette = require(glsl-vignette/advanced) 

// uniform float offsetY;
// uniform float width;
// uniform float height;
// uniform float roundness;
// uniform float smoothness;

// void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
//     vec2 pos = uv;
//     pos.y += offsetY;
//     float vignetteValue = vignette(pos, vec2(width, height), roundness, smoothness);
//     outputColor = inputColor * vignetteValue;
// }

// precision mediump float;

// varying vec2 vUv;

// #pragma glslify: random = require('glsl-random')
// #pragma glslify: blend = require('glsl-blend-overlay')

uniform float opacity;
uniform float aspect;
uniform vec2 scale; 
uniform vec2 offset;
uniform bool coloredNoise;

uniform vec2 smoothing;
uniform float noiseAlpha;

uniform vec3 color1;
uniform vec3 color2;

  
// highp float random(vec2 co)
// {
//     highp float a = 12.9898;
//     highp float b = 78.233;
//     highp float c = 43758.5453;
//     highp float dt= dot(co.xy ,vec2(a,b));
//     highp float sn= mod(dt,3.14);
//     return fract(sin(sn) * c);
// }

// vec3 blendOverlay(vec3 base, vec3 blend) {
//     return mix(1.0 - 2.0 * (1.0 - base) * (1.0 - blend), 2.0 * base * blend, step(base, vec3(0.5)));
//     // with conditionals, may be worth benchmarking
//     // return vec3(
//     //     base.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r)),
//     //     base.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g)),
//     //     base.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b))
//     // );
// }

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {	
	vec2 pos = uv;
	pos -= 0.5;

	pos.x *= aspect;
	pos /= scale;
	pos -= offset;

	float dist = length(pos);
	dist = smoothstep(smoothing.x, smoothing.y, 1.-dist);

	vec4 color = vec4(1.0);
	color.rgb = mix(color2, color1, dist);

	// if (noiseAlpha > 0.0) {
	// 	vec3 noise = coloredNoise ? vec3(random(vUv * 1.5), random(vUv * 2.5), random(vUv)) : vec3(random(vUv));
	// 	color.rgb = mix(color.rgb, blendOverlay(color.rgb, noise), noiseAlpha);
	// }
	outputColor = inputColor*clamp((color+opacity), 0., 1.);
}