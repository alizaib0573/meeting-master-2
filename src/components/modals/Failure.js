import React, { Component } from 'react'
import gsap from 'gsap';

export default class Failure extends Component {
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
            <div ref={this.ui.el}  className="end-screen__modal end-screen__modal--failure">
                <h1 ref={this.ui.header} className="heading">
                    <span className='paragraph__line'style={{marginTop:40}} >Need a kick?</span>
                    {/* <span className='paragraph__line'>get more energy</span> */}
                </h1>

                {/* <p ref={this.ui.body} className="heading">Give yourself a</p> */}

                <img ref={this.ui.logo} className="image-drink"  src="assets/img/image-drink-2.png" width="80" height="447" alt="Mountain Dew" />
                <a href="#">
                <img ref={this.ui.logo} className="image-drink linked-in"  src="assets/img/link-logo.png" width="40" height="20" alt="linked-in" />
                </a>
                <a href="#">
                <img ref={this.ui.logo} className="image-drink facebook-logo"  src="assets/img/fb.png" width="40" height="20" alt="linked-in" />
                </a>

                {/* <div className="won__footer">
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

                    <button ref={this.ui.button} className="button button-try-again" onClick={ this._clickHandler }>Wake up</button>
                </div> */}
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