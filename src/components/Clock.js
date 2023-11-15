import gsap from 'gsap';
import React, { Component } from 'react';

import { appStore } from 'stores/AppStore';

export default class Clock extends Component {
    constructor(props) {
        super(props);

        this.el = React.createRef();
    }

    componentDidMount() {
        this._setupEventListeners();
    }

    componentWillUnmount() {
        this._removeEventListeners();
    }

    render() {
        return (
            <div ref={this.el} className="clock"></div>
        )
    }

    _setupEventListeners() {
        gsap.ticker.add(this._tick);
    }

    _removeEventListeners() {
        gsap.ticker.remove(this._tick);
    }

    _tick = () => {
        const maxTime = appStore.get('maxTime');
        const currentTime = appStore.get('currentTime');
        this.el.current.textContent = `Time left: ${(maxTime - currentTime).toFixed(2)}`;
    }
}