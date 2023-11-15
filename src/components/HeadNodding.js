import gsap from 'gsap';
import React, { Component } from 'react';
import { getAsset } from 'utils/AssetLoader';

import { appStore, 
    INTERACTION_SLEEPY_INIT, 
    INTERACTION_SLEEPY,
    INTERACTION_SLEEPY_END } from 'stores/AppStore';

import SpritesheetUtils from 'utils/SpritesheetUtils';

const data = {
    "images": [],
    "frames": [
        [1, 1, 227, 227, 0, -32, -11],
        [230, 1, 227, 227, 0, -32, -11],
        [459, 1, 227, 227, 0, -32, -11],
        [688, 1, 227, 227, 0, -32, -11],
        [917, 1, 227, 227, 0, -32, -11],
        [1146, 1, 227, 227, 0, -32, -11],
        [1375, 1, 227, 227, 0, -32, -11],
        [1604, 1, 227, 227, 0, -32, -11],
        [1, 230, 227, 227, 0, -32, -11],
        [230, 230, 227, 227, 0, -32, -11],
        [459, 230, 227, 227, 0, -32, -11],
        [688, 230, 227, 227, 0, -32, -11],
        [917, 230, 227, 227, 0, -32, -11],
        [1146, 230, 227, 227, 0, -32, -11],
        [1375, 230, 227, 227, 0, -32, -11],
        [1604, 230, 227, 227, 0, -32, -11],
        [1, 459, 227, 227, 0, -32, -11],
        [230, 459, 227, 227, 0, -32, -11],
        [459, 459, 227, 227, 0, -32, -11],
        [688, 459, 227, 227, 0, -32, -11],
        [917, 459, 227, 227, 0, -32, -11],
        [1146, 459, 227, 227, 0, -32, -11],
        [1375, 459, 227, 227, 0, -32, -11],
        [1604, 459, 227, 227, 0, -32, -11],
        [1, 688, 227, 227, 0, -32, -11],
        [230, 688, 227, 227, 0, -32, -11],
        [459, 688, 227, 227, 0, -32, -11],
        [688, 688, 227, 227, 0, -32, -11],
        [917, 688, 227, 227, 0, -32, -11],
        [1146, 688, 227, 227, 0, -32, -11],
        [1375, 688, 227, 227, 0, -32, -11],
        [1604, 688, 227, 227, 0, -32, -11],
        [1, 917, 227, 227, 0, -32, -11],
        [230, 917, 227, 227, 0, -32, -11],
        [459, 917, 227, 227, 0, -32, -11],
        [688, 917, 227, 227, 0, -32, -11],
        [917, 917, 227, 227, 0, -32, -11],
        [1146, 917, 227, 227, 0, -32, -11],
        [1375, 917, 227, 227, 0, -32, -11],
        [1604, 917, 227, 227, 0, -32, -11],
        [1, 1146, 227, 227, 0, -32, -11],
        [230, 1146, 227, 227, 0, -32, -11],
        [459, 1146, 227, 227, 0, -32, -11],
        [459, 1146, 227, 227, 0, -32, -11]
    ]
}
    
export default class HeadNodding extends Component {
    constructor(props) {
        super(props);

        this._tweenObj = {
            frame: 0
        };

        this.ui = {
            canvas: React.createRef()
        }

        this.state = {
            visible: false
        };
    }

    componentDidMount() {
        this._setupSpritesheet();
        this.ui.canvas.current.innerHTML = '';
        this.ui.canvas.current.appendChild(this._spritesheet.getCanvas());

        this._setupEventListeners();
    }

    componentDidUpdate() {
        this.ui.canvas.current.innerHTML = '';
        this.ui.canvas.current.appendChild(this._spritesheet.getCanvas());
    }

    componentWillUnmount() {
        this._removeSpritesheet();

        this._removeEventListeners();
    }

    render() {
        const { visible } = this.state;
        const style = {
            display: (visible) ? 'block' : 'none'
        };

        return (
            <div ref={this.ui.canvas} style={style} className="head-nodding"></div>
        )
    }

    _setupEventListeners() {
        appStore.addEventListener('change:interactionStatus', this._changeHandler);
        appStore.addEventListener('change:sleepyHitsTotal', this._hitsChangeHandler);
    }

    _removeEventListeners() {
        appStore.addEventListener('change:interactionStatus', this._changeHandler);
        appStore.removeEventListener('change:sleepyHitsTotal', this._hitsChangeHandler);
    }

    _setupSpritesheet() {
        data.images = [getAsset('head-nodding')];

        const width = 300;
        const height = 246;

        this._spritesheet = new SpritesheetUtils({
            images: data.images,
            frames: data.frames
        });
        this._canvas = this._spritesheet.getCanvas();
        this._spritesheet.setSize(width, height);
        
        this._tween = gsap.fromTo(this._tweenObj, { frame: 0 }, { paused: true, duration: 100/24, frame: data.frames.length-1, ease: 'none', repeat: -1, onUpdate: () => {
            const frame = Math.round(this._tweenObj.frame);
            this._spritesheet.frame(frame);
        }});
    }

    _removeSpritesheet() {
        if (this._tween) {
            this._tween.kill();
        }

        if (this._spritesheet) {
            this._spritesheet.destroy();
        }
    }

    _changeHandler = (value) => {       
        if (value === INTERACTION_SLEEPY_INIT || value === INTERACTION_SLEEPY || value === INTERACTION_SLEEPY_END ) {
            this.setState({ visible: true });
        } 
        else {
            this.setState({ visible: false });
        }
    }

    _hitsChangeHandler = () => {
        const progress = appStore.get('sleepyHitsTotal') / appStore.get('sleepyThresholdTotal')
        this._tween.progress(progress);
    }
}