import {Howl, Howler} from 'howler';

import { SMAAImageLoader } from "postprocessing";

let THREE, GLTFLoader, RGBELoader;
if (process.browser) {
    THREE = require('three');
    GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader').GLTFLoader;
    RGBELoader = require('three/examples/jsm/loaders/RGBELoader').RGBELoader;
}

const DEBUG = false;
const assets = [];

const imageLoader = function({ id, src }) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => {
            assets[id] = { result: img };
            DEBUG && console.log(`asset loaded: ${id}`);
            resolve();
        });
        img.addEventListener('error', () => {
            DEBUG && console.warn(`asset failed: ${id}`);
            reject(`asset failed: ${id}`);
        });
        img.src = src;
    });
}

const videoLoader = function({ id, src }) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open('GET', src, true);
        req.responseType = 'blob';
        req.onload = function() {
            // Onload is triggered even on 404
            // so we need to check the status code
            if (this.status === 200) {
                const videoBlob = this.response;
                const vid = URL.createObjectURL(videoBlob); // IE10+
                // Video is now downloaded
                assets[id] = { result: vid };
                resolve();
            }
        }
        req.onerror = function() {
            DEBUG && console.warn(`asset failed: ${id}`);
            reject(`asset failed: ${id}`);
        }
        req.send();
    });
}

const jsonLoader = function({ id, src }) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', src);
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 400) {
                assets[id] = { result: JSON.parse(xhr.responseText) };
                DEBUG && console.log(`asset loaded: ${id}`);
                resolve();
            }
            else {
                DEBUG && console.warn(`asset failed: ${id}`);
                reject(`asset failed: ${id}`);
            }
        });
        xhr.addEventListener('error', () => {
            DEBUG && console.warn(`asset failed: ${id}`);
            reject(`asset failed: ${id}`);
        });
        xhr.send();
    });
}

const gltfLoader = function({ id, src }) {
    return new Promise((resolve, reject) => {
        new GLTFLoader()
        .load(src, (gltf) => {
            let mesh;
            gltf.scene.traverse( (child) => {
                if ( child.isMesh ) {
                    mesh = child;
                }
            });
            if (mesh) {
                assets[id] = { result: mesh };
                DEBUG && console.log(`asset loaded: ${id}`);
                resolve();
            }
            else {
                DEBUG && console.warn(`asset failed: ${id}`);
                reject(`asset failed: ${id}`);
            }
        },
        () => {
            // progress
        },
        () => {
            DEBUG && console.warn(`asset failed: ${id}`);
            reject(`asset failed: ${id}`);
        });
    });
}

const hdrLoader = function({ id, src }) {
    return new Promise((resolve, reject) => {
        new RGBELoader()
        .setDataType( THREE.UnsignedByteType )
        .load(src, (envTexture) => {
            assets[id] = { result: envTexture };
            DEBUG && console.log(`asset loaded: ${id}`);
            resolve();
        },
        () => {
            // progress
        },
        () => {
            DEBUG && console.warn(`asset failed: ${id}`);
            reject(`asset failed: ${id}`);
        });
    });
}

const howlLoader = function({ id, src, sprite = null }) {
    return new Promise((resolve, reject) => {
        const sound = new Howl({
            autoplay: false,
            src: [src],
            sprite,
            onload: () => {
                DEBUG && console.log(`asset loaded: ${id}`);
                assets[id] = { result: sound };
                resolve();
            },
            onloaderror: () => {
                DEBUG && console.warn(`asset failed: ${id}`);
                reject(`asset failed: ${id}`);
            }
        });
    });
}

const smaaLoader = function({ id, src }) {
    return new Promise((resolve, reject) => {
        const smaaImageLoader = new SMAAImageLoader();
        smaaImageLoader.load(([search, area]) => {
            DEBUG && console.log(`SMAA assets loaded`);
            assets['smaa-search'] = { result: search };
            assets['smaa-area'] = { result: area };
            resolve();
        });
    });
}

const globalLoader = function(obj) {
    switch (obj.type) {
        case 'image':
            return imageLoader(obj);
        case 'video':
            return videoLoader(obj);
        case 'json':
            return jsonLoader(obj);
        case 'gltf':
            return gltfLoader(obj);
        case 'hdr':
            return hdrLoader(obj);
        case 'howl':
            return howlLoader(obj);
        case 'smaa':
            return smaaLoader(obj);
    }
}

export const loadManifest = function(arrayIn, { onProgress = null } = {}) {
    const array = arrayIn.filter((item) => {
        return !getAsset(item.id);
    });
    const numItems = array.length;
    let numLoaded = 0;
    let failed = [];

    return new Promise((resolve, reject) => {
        const ready = function() {
            const itemsProgressed = numLoaded + failed.length;
            if (itemsProgressed === numItems) {
                if (failed.length) {
                    reject(failed);
                }
                else {
                    resolve();
                }
            }

            if (onProgress) {
                const progress = itemsProgressed / numItems;
                onProgress(progress);
            }
        }

        if (numItems <= 0) {
            console.log('all assets already loaded');
            resolve();
        }

        for (let i=0, len=numItems; i < len; i++) {
            globalLoader(array[i])
                .then(() => {
                    numLoaded++;
                    ready();
                })
                .catch((err) => {
                    failed.push(err);
                    ready();
                });
        }
    });
}

export const loadFile = function(obj) {
    return globalLoader(obj);
}

export const getAsset = function(id) {
    if (assets[id] && assets[id].result) {
        return assets[id].result
    }
    return null;
}

export const hasAssets = function(array) {
    for (let i=0, len=array.length; i<len; i++) {
        if (!assets[array[i]]) {
            return false;
        }
    }
    return true;
}