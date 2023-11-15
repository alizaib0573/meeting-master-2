// import gsap from 'gsap';


import Character from './objects/Character';
import { getAsset } from 'utils/AssetLoader';

let THREE, GLTFLoader;
if (process.browser) {
    THREE = require('three');
}

import { appStore } from 'stores/AppStore';
import { gameVideos } from '../GameVideos';
import { appActions } from '../../stores/AppActions';

export default class Scene {   
    constructor({ renderer, camera } = {}) {
        this._camera = camera;

        this.scene = new THREE.Scene();

        this._glass = getAsset('gltf-glass');
        this._glass.renderOrder = -1;
        const roughnessMap = this._glass.material.roughnessMap;
        this._glass.material = new THREE.MeshPhysicalMaterial({
            roughnessMap,
            roughness: 1,
            emissive: new THREE.Color(appStore.get('glassEmissive')),
            transparent: true,
            transparency: appStore.get('glassTransparency'),
            opacity: 1,
            depthWrite: false
        });
        
        this._floorCeiling = getAsset('gltf-floor-ceiling');
        this._frames = getAsset('gltf-frames');
        this._walls = getAsset('gltf-walls');
        this._clock = getAsset('gltf-clock');
        this._tv = getAsset('gltf-tv');
        this._chair02 = getAsset('gltf-chair_02');
        this._chair03 = getAsset('gltf-chair_03');
        this._chair04 = getAsset('gltf-chair_04');
        this._chair05 = getAsset('gltf-chair_05');
        this._table = getAsset('gltf-table');
        
        this._frames.material.emissiveMap.wrapS = THREE.MirroredRepeatWrapping;
        this._frames.material.emissiveMap.wrapT = THREE.MirroredRepeatWrapping;
        this._floorCeiling.material.emissiveMap.wrapS = THREE.MirroredRepeatWrapping;
        this._floorCeiling.material.emissiveMap.wrapT = THREE.MirroredRepeatWrapping;
        this._table.material.emissiveMap.wrapS = THREE.MirroredRepeatWrapping;
        this._table.material.emissiveMap.wrapT = THREE.MirroredRepeatWrapping;
        this._walls.material.emissiveMap.wrapS = THREE.MirroredRepeatWrapping;
        this._walls.material.emissiveMap.wrapT = THREE.MirroredRepeatWrapping;

        this.scene.add(this._floorCeiling);
        this.scene.add(this._frames);
        this.scene.add(this._glass);
        this.scene.add(this._walls);
        this.scene.add(this._clock);
        this.scene.add(this._tv);
        this.scene.add(this._chair02);
        this.scene.add(this._chair03);
        this.scene.add(this._chair04);
        this.scene.add(this._chair05);
        this.scene.add(this._table);



        
        this._rightArm = getAsset('gltf-right-arm');
        this.scene.add(this._rightArm);

        this._leftArm = this._rightArm.clone(true);
        this.scene.add(this._leftArm);

        var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        this.scene.add( light );

        this._character01 = new Character({
            video: gameVideos.getVideoElement('andrew'),
            width: 1024,
            height: 512
        });
        this.scene.add(this._character01.mesh);

        this._character02 = new Character({
            video: gameVideos.getVideoElement('ava'),
            width: 1024,
            height: 512
        });
        this.scene.add(this._character02.mesh);

        this._character03 = new Character({
            video: gameVideos.getVideoElement('paul'),
            width: 1024,
            height: 512
        });
        this.scene.add(this._character03.mesh);


        this._armsYawn = new Character({
            video: gameVideos.getVideoElement('yawn'),
            width: 1818,
            height: 1024
        });

        this._armsSoda = new Character({
            video: gameVideos.getVideoElement('soda'),
            width: 1818,
            height: 1024
        });

        camera.camera.add(this._armsYawn.mesh);
        camera.camera.add(this._armsSoda.mesh);
        this.scene.add(camera.camera);
        this.scene.add(camera.cameraAwake);


        this._awakeTarget = new THREE.Object3D();
        this._awakeTarget.position.y = appStore.get('cameraPositionY');
        this._awakeTarget.position.z = 0;
        this.scene.add(this._awakeTarget);

        this._awakeIndicator = new THREE.Object3D();
        this._awakeIndicator.position.z = -appStore.get('cameraPositionZ');
        camera.cameraAwake.add(this._awakeIndicator);


        this._glass.material.emissive = new THREE.Color(appStore.get('glassEmissive'));
        appStore.addEventListener('change:glassEmissive', () => {
            this._glass.material.emissive = new THREE.Color(appStore.get('glassEmissive'));
        });

        // gameVideos.getVideoElement('yawn').autoplay = true;

        // this._character04 = new Character({
        //     video: gameVideos.getVideoElement('rebecca'),
        //     width: 1024,
        //     height: 512
        // });
        // this._character04.mesh.renderOrder = 1;
        // this.scene.add(this._character04.mesh);
    }

    destroy() {
        this._character01.destroy();
        this._character02.destroy();
        this._character03.destroy();
        this._armsYawn.destroy();
        this._armsSoda.destroy();
        // this._character04.destroy();

        this.scene.dispose();
    }

    update() {
        this._character01.update();
        this._character02.update();
        this._character03.update();
        this._armsYawn.update();
        this._armsSoda.update();

        this._character01.mesh.scale.set(appStore.get('character01Scale'), appStore.get('character01Scale'), 1);
        this._character01.mesh.position.x = appStore.get('character01PositionX');
        this._character01.mesh.position.y = appStore.get('character01PositionY');
        this._character01.mesh.position.z = appStore.get('character01PositionZ');

        this._character02.mesh.scale.set(appStore.get('character02Scale'), appStore.get('character02Scale'), 1);
        this._character02.mesh.position.x = appStore.get('character02PositionX');
        this._character02.mesh.position.y = appStore.get('character02PositionY');
        this._character02.mesh.position.z = appStore.get('character02PositionZ');

        this._character03.mesh.scale.set(appStore.get('character03Scale'), appStore.get('character03Scale'), 1);
        this._character03.mesh.position.x = appStore.get('character03PositionX');
        this._character03.mesh.position.y = appStore.get('character03PositionY');
        this._character03.mesh.position.z = appStore.get('character03PositionZ');

        this._armsYawn.mesh.scale.set(appStore.get('armsYawnScale'), appStore.get('armsYawnScale'), 1);
        this._armsYawn.mesh.position.x = appStore.get('armsYawnPositionX');
        this._armsYawn.mesh.position.y = appStore.get('armsYawnPositionY');
        this._armsYawn.mesh.position.z = appStore.get('armsYawnPositionZ');

        this._armsSoda.mesh.scale.set(appStore.get('armsSodaScale'), appStore.get('armsSodaScale'), 1);
        this._armsSoda.mesh.position.x = appStore.get('armsSodaPositionX');
        this._armsSoda.mesh.position.y = appStore.get('armsSodaPositionY');
        this._armsSoda.mesh.position.z = appStore.get('armsSodaPositionZ');

            
        this._rightArm.scale.set(appStore.get('rightArmScale'), appStore.get('rightArmScale'), appStore.get('rightArmScale'));
        this._rightArm.position.x = appStore.get('rightArmPositionX');
        this._rightArm.position.y = appStore.get('rightArmPositionY');
        this._rightArm.position.z = appStore.get('rightArmPositionZ');
        this._rightArm.rotation.x = appStore.get('rightArmRotationX');
        this._rightArm.rotation.y = appStore.get('rightArmRotationY');
        this._rightArm.rotation.z = appStore.get('rightArmRotationZ');

        this._leftArm.scale.set(appStore.get('leftArmScale'), appStore.get('leftArmScale') * -1, appStore.get('leftArmScale'));
        this._leftArm.position.x = appStore.get('leftArmPositionX');
        this._leftArm.position.y = appStore.get('leftArmPositionY');
        this._leftArm.position.z = appStore.get('leftArmPositionZ');
        this._leftArm.rotation.x = appStore.get('leftArmRotationX');
        this._leftArm.rotation.y = appStore.get('leftArmRotationY');
        this._leftArm.rotation.z = appStore.get('leftArmRotationZ');

        // this._character04.mesh.scale.set(appStore.get('character04Scale'), appStore.get('character04Scale'), 1);
        // this._character04.mesh.position.x = appStore.get('character04PositionX');
        // this._character04.mesh.position.y = appStore.get('character04PositionY');
        // this._character04.mesh.position.z = appStore.get('character04PositionZ');

        this._glass.material.transparency = appStore.get('glassTransparency');

        const coordsTarget = this._getScreenCoords(this._awakeTarget);
        const coordsIndicator = this._getScreenCoords(this._awakeIndicator);

        appActions.setAwakeTargetScreenPosition(coordsTarget);
        appActions.setAwakeIndicatorScreenPosition(coordsIndicator);
        appActions.setAwakeIndicatorsDistance(this._dist(coordsTarget, coordsIndicator));
    }

    setSize(width, height) {
        this._width = width,
        this._height = height;
    }

    _getScreenCoords(object) {
        let pos = new THREE.Vector3();
        pos = pos.setFromMatrixPosition(object.matrixWorld);
        pos.project(this._camera.camera);

        let widthHalf = this._width / 2;
        let heightHalf = this._height / 2;

        pos.x = (pos.x * widthHalf) + widthHalf;
        pos.y = - (pos.y * heightHalf) + heightHalf;
        pos.z = 0;
        return {
            x: pos.x,
            y: pos.y
        };
    }

    _dist(p1, p2) {
        const dx = p1.x-p2.x;
        const dy = p1.y-p2.y;
        return Math.sqrt((dx*dx)+(dy*dy));
    }
}
