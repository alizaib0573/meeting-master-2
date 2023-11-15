import React, { Component } from 'react'
import gsap from 'gsap';

export default class Succes extends Component {
    constructor(props) {
        super(props);

        this.ui = {
            el: React.createRef(),
            header: React.createRef(),
            body: React.createRef(),
            button: React.createRef(),
            share: React.createRef(),
            linkedIn: React.createRef(),
            facebook: React.createRef()
        }
    }

    componentDidMount() {
        this._transitionIn();
    }

    componentWillUnmount() {
        if(this.transitionInTimeline) this.transitionInTimeline.kill();
        if(this.transitionOutTimeline) this.transitionOutTimeline.kill();
    }

    render() {
        const {shareLinkedIn, shareFacebook} = this.props;
        return (
            <div ref={this.ui.el} className="end-screen__modal end-screen__modal--success">
                <h1 ref={this.ui.header} className="heading"><span>You're a</span> meeting master!</h1>
                <p ref={this.ui.body} className="paragraph">You survided another torturous meeting.</p>

                <div className="won__footer">
                    <div ref={this.ui.share} className="share">
                        <span className="share__heading">Share</span>
                        <ul className="list list--horizontal share__list">
                            <li className="list__item share__list-item">
                                <button ref={this.ui.linkedIn} className="button button-share button-share--linkedin" onClick={ shareLinkedIn }>Linkedin</button>
                            </li>
                            <li className="list__item share__list-item">
                                <button ref={this.ui.facebook} className="button button-share button-share--facebook" onClick={ shareFacebook }>Facebook</button>
                            </li>
                        </ul>
                    </div>

                    <button ref={this.ui.button} className="button button-try-again" onClick={ this._clickHandler }>Go again</button>
                </div>
            </div>
        )
    }

    _transitionIn = () => {
        this.transitionInTimeline = gsap.timeline({paused: true});
        this.transitionInTimeline.from(this.ui.el.current, {duration: 0.6, opacity: 0, ease: 'Circ.easeOut'});
        this.transitionInTimeline.from(this.ui.header.current, {duration: 0.5, y: 100, opacity: 0, ease: 'Circ.easeOut'}, '-=0.24');
        this.transitionInTimeline.from(this.ui.body.current, {duration: 0.5, y: 100, opacity: 0, ease: 'Circ.easeOut'}, '-=0.3');
        this.transitionInTimeline.from(this.ui.share.current, {duration: 0.5, y: 100, opacity: 0, ease: 'Circ.easeOut'}, '-=0.3');
        this.transitionInTimeline.from(this.ui.button.current, {duration: 0.5, y: 100, opacity: 0, ease: 'Circ.easeOut'}, '-=0.4');
        this.transitionInTimeline.play();
    }

    _transitionOut = (onComplete) => {
        this.transitionOutTimeline = gsap.timeline({paused: true, onComplete});
        this.transitionOutTimeline.to(this.ui.button.current, {duration: 0.3, scale: 0, ease: 'Back.easeIn'});
        this.transitionOutTimeline.to(this.ui.el.current, {duration: 0.5, opacity: 0, ease: 'none'}, '-=0.05');
        this.transitionOutTimeline.play();
    }

    _clickHandler = () => {
        this._transitionOut(this.props.tryAgain);
    }
}