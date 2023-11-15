import gsap from 'gsap';
import React, { Component, Fragment } from 'react';

import { 
    appStore, 

    STATUS_INIT
} from 'stores/AppStore';

import Points from 'components/Points';

export default class Rounds extends Component {
    constructor(props) {
        super(props);

        this.state = {
            points: 0,
            differences: []
        };
    }

    componentDidMount() {
        this._setupEventListeners();
    }


    componentWillUnmount() {
        this._removeEventListeners();
    }

    render() {
        let { points, differences } = this.state;

        return (
            <Fragment>
                <Points type="static" value={points} />
                { differences.map((difference) => <Points key={difference.key} type="difference" value={difference.value} removeElement={() => { this._removeElement(difference) }} />) }
            </Fragment>
        )
    }

    _setupEventListeners() {
        appStore.addEventListener('change:status', this._statusChangeHandler);
        appStore.addEventListener('points:add', this._pointsAddHandler);
    }

    _removeEventListeners() {
        appStore.removeEventListener('points:add', this._pointsAddHandler);
    }

    _statusChangeHandler = () => {
        if (appStore.get('status') === STATUS_INIT) {
            this.setState({
                points: 0,
                differences: []
            });
        }
    }

    _removeElement(difference) {
        const differences = this.state.differences;
        differences.map((diff, index) => {
            if (difference === diff) {
                differences.splice(index, 1);
            }
        });

        this.setState({
            points: this.state.points + difference.value,
            differences
        });
    }

    _pointsAddHandler = (value) => {
        const differences = this.state.differences;
        differences.push({ key: Date.now(), value });

        this.setState({
            differences
        });
    }
}