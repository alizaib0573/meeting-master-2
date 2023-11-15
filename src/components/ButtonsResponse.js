import gsap from 'gsap';
import React, { Component } from 'react';
import { appActions } from 'stores/AppActions';

import reponses from '../data/responses.json';
import ButtonReponse from './ButtonReponse';

export default class ButtonsResponse extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeButtonId: Math.round(Math.random() * (reponses.length-1)),
            selectedButtonId: null
        };

        this.ui = {
            buttons: []
        }

        this._speed = this.props.duration / 6 / 2; // duration - items - rounds;
    }

    componentDidMount() {
        this._setupEventListeners();

        this._gotoNextButton();

        this.transitionInTimeline = gsap.timeline({paused: true});
        this.transitionInTimeline.from(this.ui.buttons, {stagger: 0.03, duration: 0.3, y: 25, opacity: 0, ease: 'Power3.easeOut'});

        this.transitionOutTimeline = gsap.timeline({paused: true});
        this.transitionOutTimeline.to(this.ui.buttons, {stagger: 0.032, duration: 0.3, y: 25, opacity: 0, ease: 'Power3.easeIn'});

    }

    componentWillUnmount() {
        this._killDelayedCall();
        this._removeEventListeners();

        this.transitionInTimeline.kill();
        this.transitionOutTimeline.kill();
    }

    // Called from Response.js => _transitionIn()
    transitionIn = () => {
        this.transitionInTimeline.play();
    }

    // Called from Response.js => _transitionOut()
    transitionOut = () => {
        this.transitionOutTimeline.play();
    }

    render() {
        const { activeButtonId, selectedButtonId } = this.state;

        return (
            <div className="button-response__wrapper">
                {reponses.map((el, i) =>
                    <ButtonReponse
                        ref={el => this.ui.buttons[i] = el}
                        key={i}
                        label={el.label}
                        isPositive={el.isPositive}
                        isHighlighted={activeButtonId === i}
                        isDisabled={!selectedButtonId}
                    />
                )}
            </div>
        )
    }

    _setupEventListeners() {
        window.addEventListener('touchstart', this._touchstartHandler);
        window.addEventListener('keydown', this._keydownHandler);
    }

    _removeEventListeners() {
        window.removeEventListener('touchstart', this._touchstartHandler);
        window.removeEventListener('keydown', this._keydownHandler);
    }

    _gotoNextButton() {
        this._delayedCall = gsap.delayedCall(this._speed, () => {
            const { activeButtonId } = this.state;
            this.setState({ activeButtonId: (activeButtonId + 1) % reponses.length });
            this._gotoNextButton();
        });
    }

    _killDelayedCall() {
        if (this._delayedCall) {
            this._delayedCall.kill();
            this._delayedCall = null;
        }
    }

    _submitAnswer() {
        const { activeButtonId, selectedButtonId } = this.state;

        if(!selectedButtonId) {
            this._killDelayedCall();
            this.setState({ selectedButtonId: activeButtonId });

            const isPositive = reponses[activeButtonId].isPositive;
            if(isPositive) {
                appActions.doPlayerResponseCorrect(reponses[activeButtonId].type);
            } else {
                appActions.doPlayerResponseWrong(reponses[activeButtonId].type);
            }
        }
    }

    _keydownHandler = (e) => {
        if(e.keyCode === 32) {
            this._submitAnswer();
        }
    }

    _touchstartHandler = () => {
        this._submitAnswer();
    }
}

