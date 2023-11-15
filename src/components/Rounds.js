import gsap from 'gsap';
import React, { Component } from 'react';

import { appStore } from 'stores/AppStore';
import { NUM_ROUNDS } from 'stores/AppStore';

export default class Rounds extends Component {
    constructor(props) {
        super(props);

        this.state = {
            round: 1
        };
    }

    componentDidMount() {
        this._setupEventListeners();
    }


    componentWillUnmount() {
        this._removeEventListeners();
    }

    render() {
        let { round } = this.state;
        return (
            <div className="rounds">
                <span className="rounds__title">Round</span>
                <span className="rounds__current">{ Math.min(round, NUM_ROUNDS) }</span> 
                <span className="rounds__divider">/</span> 
                <span className="rounds__max">{ NUM_ROUNDS }</span>
            </div>
        )
    }

    _setupEventListeners() {
        appStore.addEventListener('change:rounds', this._changeRoundsHandler);
    }

    _removeEventListeners() {
        appStore.removeEventListener('change:rounds', this._changeRoundsHandler);
    }

    _changeRoundsHandler = () => {
        const rounds = appStore.get('rounds');
        this.setState({
            round: rounds+1
        });
    }
}