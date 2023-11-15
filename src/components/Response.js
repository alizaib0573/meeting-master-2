import gsap from 'gsap';
import React, { Component, Fragment } from 'react';
import AppActions from 'stores/AppActions';
import { appStore, CHALLENGE_RESPONSE_VISIBLE } from 'stores/AppStore';

import CountdownClock from 'components/CountdownClock';
import ButtonsResponse from 'components/ButtonsResponse';

class ReponseVisual extends Component {
    constructor(props) {
        super(props);

        this.ui = {
            responses: React.createRef(),
            clock: React.createRef(),
        }
    }

    componentDidMount() {
        this.transitionIn();
    }

    componentWillUnmount() {
        if(this.transitionInTimeline) this.transitionInTimeline.kill();
        if(this.transitionOutTimeline) this.transitionOutTimeline.kill();
    }

    transitionIn() {
        this.transitionInTimeline = gsap.timeline({paused: true, delay: 0.05});
        this.transitionInTimeline.from(this.ui.clock.current, {duration: 0.4, scale: .2, y: 10, opacity: 0, ease: 'Circ.easeOut'}, '-=0.4')
        this.transitionInTimeline.add(this.ui.responses.current.transitionIn, '-=0.25');
        this.transitionInTimeline.play();
    }

    transitionOut(onComplete) {
        this.transitionOutTimeline = gsap.timeline({paused: true, onComplete});
        this.transitionOutTimeline.add(this.ui.responses.current.transitionOut);
        this.transitionOutTimeline.to(this.ui.clock.current, {duration: 0.25, scale: .2, y: 10, opacity: 0, ease: 'Back.easeIn'}, '+=0.1');
        this.transitionOutTimeline.play();
    }

    render() {
        return (
            <Fragment>
                <CountdownClock duration={2} ref={this.ui.clock} />
                <ButtonsResponse duration={2} ref={this.ui.responses} />
            </Fragment>
        )
    }
}

export default class Response extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false
        };

        this.visualComponent = React.createRef();
    }

    componentDidMount() {
        appStore.addEventListener('change:challengeResponse', this._changeHandler);
    }

    componentWillUnmount() {
        appStore.removeEventListener('change:challengeResponse', this._changeHandler);
    }

    _changeHandler = (value) => {
        const visible = (value === CHALLENGE_RESPONSE_VISIBLE) ? true : false;
        if (this.state.visible !== visible) {
            if(this.state.visible && !visible) {
                this.visualComponent.current.transitionOut(() => this.setState({visible}));
            } else {
                this.setState({ visible });
            }
        }
    }

    render() {
        const { visible } = this.state;
        if(!visible) return null;
        return (
            <ReponseVisual ref={this.visualComponent} {...this.props} />
        )
    }
}