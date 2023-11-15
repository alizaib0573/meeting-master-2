import gsap from 'gsap';

let THREE;
if (process.browser) {
    THREE = require('three');
}

import Renderer from './Renderer';
import Scene from './Scene';
import Camera from './Camera';

export default class GameMain {
    create() {
        this._renderer = new Renderer();
        this._camera = new Camera({ renderer: this._renderer.renderer });
        this._scene = new Scene({ renderer: this._renderer.renderer, camera: this._camera });

        this._renderer.createComposer(this._camera, this._scene);
        this._renderer.addRenderPass(this._scene.scene, this._camera.camera);
        this._renderer.addEffects(this._camera.camera);
        
        this._resize();
        this._update();
        this._render();
    }
    
    mount(options) {
        this._container = options.container;
        this._container.appendChild(this._renderer.renderer.domElement);
        this._setupEventListeners();
        this._resize();
    }

    destroy() {
        this._removeEventListeners();
        this._scene.destroy();
        this._camera.destroy();
        this._renderer.destroy();
    }

    _setupEventListeners() {
        gsap.ticker.add(this._tick);
        window.addEventListener('resize', this._resize);
    }

    _removeEventListeners() {
        gsap.ticker.remove(this._tick);
        window.removeEventListener('resize', this._resize);
    }

    _update() {
        this._scene.update();
        this._camera.update();
    }

    _render() {
        this._renderer.render();
    }

    _tick = (time, deltaTime) => {
        this._update();
        this._render();
    }

    _resize = () => {
        let w = 100;
        let h = 100;
        if (this._container) {
            w = this._container.clientWidth;
            h = this._container.clientHeight;
        }
        
        this._width = w;
        this._height = h;

        this._renderer.setSize(this._width, this._height);
        this._camera.setSize(this._width, this._height);
        this._scene.setSize(this._width, this._height);
    }
}

export const gameMain = new GameMain();