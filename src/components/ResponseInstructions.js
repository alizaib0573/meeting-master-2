import gsap from 'gsap';
import React, { Component, Fragment } from 'react';
import { appStore, INSTRUCTIONS_RESPONSE_VISIBLE } from 'stores/AppStore';

import Instructions from './Instructions';

export default class Redeem extends Component {
    constructor(props) {
        super(props);

        this.ui = {
            instructions: React.createRef()
        };

        this._hasTouch = (process.browser && ("ontouchstart" in document.documentElement)) ? true : false;

        this.state = {
            visible: false
        };

        this.visualComponent = React.createRef();
    }

    componentDidMount() {
        appStore.addEventListener('change:instructionsResponse', this._changeHandler);
    }

    componentWillUnmount() {
        appStore.removeEventListener('change:instructionsResponse', this._changeHandler);
    }

    render() {
        const { visible } = this.state;
        if(!visible) return null;
        return (
            <Instructions ref={this.ui.instructions}>
                { this._hasTouch && <Fragment>Tap your screen to agree</Fragment> }
                { !this._hasTouch && <Fragment>Press <span>Spacebar</span> to agree</Fragment> }
            </Instructions>
        )
    }

    _changeHandler = (value) => {
        const visible = (value === INSTRUCTIONS_RESPONSE_VISIBLE) ? true : false;
        if (this.state.visible !== visible) {
            this.setState({ visible });
        }
    }
}