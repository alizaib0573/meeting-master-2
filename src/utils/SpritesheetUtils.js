export default class Spritesheet {
    constructor(options = {}) {
        this._options = options;
        this._options.devicePixelRatio = this._options.devicePixelRatio || 1;

        this.el = options.el || this._createCanvas();
        this.images = options.images || [];
        this.frames = options.frames || [];

        this._ctx = this.el.getContext("2d");

        this._setSize();
    }

    destroy() {
        this.el = null;
        this.images = null;
        this.frames = null;

        this._ctx = null;

        this._width = null;
        this._height = null;

        this._activeFrame = null;
    }

    getCanvas() {
        return this.el;
    }

    setSize(width, height) {
        this._width = width;
        this._height = height;

        this.el.width = this._width * this._options.devicePixelRatio;
        this.el.height = this._height * this._options.devicePixelRatio;
    }

    frame(index) {
        if(index === undefined || index === null) {
            return this._activeFrame || 0;
        }
        this._activeFrame = index;

        this._render();
    }

    _createCanvas() {
        return document.createElement('canvas');
    }

    _setSize() {
        this._width = this.el.width;
        this._height = this.el.height;

        this.el.width = this._width * this._options.devicePixelRatio;
        this.el.height = this._height * this._options.devicePixelRatio;
    }

    _render() {
        var frameData = this._getFrameData();
        var image = this._getImage(frameData);

        this._ctx.clearRect(0, 0, this._width * this._options.devicePixelRatio, this._height * this._options.devicePixelRatio);
        this._ctx.drawImage(image, frameData[0], frameData[1], frameData[2], frameData[3], -frameData[5], -frameData[6], frameData[2], frameData[3]);
    }

    _getFrameData() {
        var frameData = this.frames[this._activeFrame];
        if(!frameData) {
            console.log('Frame with index "'+ this._activeFrame +'" not found');
            return;
        }

        return frameData;
    }

    _getImage(frameData) {
        if(!frameData) return;

        var imageIndex = frameData[4];
        var image = this.images[imageIndex];
        if(!image) {
            console.log('Image with index "'+ imageIndex +'" not found');
            return;
        }

        return image;
    }
};