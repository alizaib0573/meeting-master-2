let THREE;
if (process.browser) {
    THREE = require('three');
}

let geometry;
let material;

export default class Character {   
    constructor({ video, width, height }) {        
        this._video = video;

        this._texture = new THREE.Texture(this._video);
        this._texture.minFilter = THREE.LinearFilter;
        this._texture.magFilter = THREE.LinearFilter;
        this._texture.generateMipmaps = false;
        this._texture.format = THREE.RGBFormat;
        this._texture.encoding = THREE.sRGBEncoding;
        this._texture.premultiplyAlpha = false;

        this._geometry = geometry || new THREE.PlaneBufferGeometry(width/300, height/300, 1, 1);
        if (!geometry) geometry = this._geometry;

        this._material = material || new THREE.MeshBasicMaterial({
            color: 0xFFFFFF, 
            side: THREE.FrontSide,
            transparent: true,
            map: this._texture,
            depthTest: false
        });
        this._material.onBeforeCompile = (shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <map_fragment>',
                [
                    `    
                    vec2 positionMask = vUv;
                    positionMask.y *= 1.0*0.5;
                    vec4 colorMask = texture2D(map, positionMask);

                    vec2 positionVideo = positionMask;
                    positionVideo.y += 1.0*0.5;
                    vec4 texelColor = texture2D(map, positionVideo);

                    texelColor = mapTexelToLinear(texelColor);
	                diffuseColor *= texelColor;
                    `
                ].join('\n')
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
                [
                    `   
                    gl_FragColor = vec4(outgoingLight.rgb, colorMask.b);
                    gl_FragColor.rgb *= colorMask.a;
                    `
                ].join('\n')
            );
        };

        this.mesh = new THREE.Mesh(this._geometry, this._material);
    }

    update() {
        if ( this._video.readyState >= this._video.HAVE_CURRENT_DATA && !this._video.paused) {
            // this._i = this._i || 1;
            // if (this._i > 60/25) {
            //     this._i = 0;
                this._texture.needsUpdate = true;
            // }
            // this._i++;
        }
    }

    destroy() {
        this._texture.dispose();
        this._material.dispose();
        this._geometry.dispose();
    }
}
