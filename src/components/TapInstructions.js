import gsap from 'gsap';
import React, { Component, Fragment } from 'react';
import { appStore, INSTRUCTIONS_TAP_VISIBLE } from 'stores/AppStore';

import Instructions from './Instructions';

export default class TapInstructions extends Component {
    constructor(props) {
        super(props);

        this.ui = {
            instructions: React.createRef
        };

        this._hasTouch = (process.browser && ("ontouchstart" in document.documentElement)) ? true : false;

        this.state = {
            visible: false,
            copy: this._hasTouch ? 'Tap the screen rapidly to stay awake' : 'Tap the arrow key rapidly to stay awake'
        };


        this.visualComponent = React.createRef();
    }

    componentDidMount() {
        appStore.addEventListener('change:instructionsTap', this._changeHandler);
    }

    componentWillUnmount() {
        appStore.removeEventListener('change:instructionsTap', this._changeHandler);
    }

    render() {
        const { visible } = this.state;
        if(!visible) return null;
        return (
            <Instructions ref={this.ui.instructions}>
                <div className="icon-tap"></div>
                { this.state.copy }
            </Instructions>
        )
    }

    _changeHandler = (value) => {
        const visible = (value === INSTRUCTIONS_TAP_VISIBLE) ? true : false;
        if (this.state.visible !== visible) {
            this.setState({ visible });
        }
    }
}