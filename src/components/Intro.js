import React, { Component, Fragment } from 'react';

import gsap from 'gsap';

class Intro extends Component {
    constructor(props) {
        super(props);

        this.ui = {
            video: React.createRef(),
            headerLine1: React.createRef(),
            headerLine2: React.createRef(),
            button: React.createRef(),
            logo: React.createRef(),
            loading: React.createRef()
        }
    }

    componentDidMount() {
        this._transitionIn();
    }

    componentWillUnmount() {
        if(this.transitionInTimeline) this.transitionInTimeline.kill();
        if(this.transitionOutTimeline)  this.transitionOutTimeline.kill();
    }

    render() {
        const { status, reloadGame, progress } = this.props;
        return (
            <div className="page page-intro">
                <img ref={this.ui.video} className="video page-intro__video" src="/assets/img/intro-temp.jpg" width="2020" height="1080" />
                {/* <video ref={this.ui.video} className="video page-intro__video" src="/assets/videos/intro.mp4" width="2020" height="1080" loop muted autoPlay /> */}

                <div className="page-intro__content">
                    {/* <img ref={this.ui.logo} className="logo-mountain-dew" src="assets/img/logo-md.png" width="500" height="347" alt="Mountain Dew" /> */}
gco                    {/* <h1 className="heading">
                        <span className="heading__line" ref={this.ui.headerLine1}>Meeting</span>
                        <span className="heading__line" ref={this.ui.headerLine2}>master</span>
                    </h1> */}

                    <div>
                        {
                            (status === 'init') &&
                            <span ref={this.ui.loading} className="preloader">Loading: {Math.round(progress * 100)}%</span>
                        }
                        {
                            (status === 'loaded') &&
                            <button ref={this.ui.button} className="button button-intro" onClick={ this._startGameHandler }>Join meeting</button>
                        }
                        {
                            (status === 'error') &&
                            <Fragment>
                                <button ref={this.ui.button} className="button button-intro" onClick={ reloadGame }>Try Again</button>
                                <div className="intro-error">Oh no! We could not load the game.</div>
                            </Fragment>
                        }
                    </div>
                </div>
            </div>
        )
    }

    _transitionIn() {
        const items = [
            this.ui.video.current,
            this.ui.headerLine1.current,
            this.ui.headerLine2.current,
            this.ui.button.current,
            this.ui.logo.current,
            this.ui.loading.current
        ];
        
        this.transitionInTimeline = gsap.timeline({paused: true, onComplete: this.props.loadGame});
        this.transitionInTimeline.set(items, { autoAlpha: 0 });
        
        this.transitionInTimeline.to(this.ui.video.current, {duration: 1, autoAlpha: 1, ease: 'none'}, 0);
        
        this.transitionInTimeline.from(this.ui.logo.current, {duration: 0.6, x: -60, y: 15, ease: 'power3.out'}, 0.6);
        this.transitionInTimeline.to(this.ui.logo.current, {duration: 0.6, autoAlpha: 1, ease: 'none'}, 0.6);
        
        this.transitionInTimeline.from(this.ui.headerLine1.current, {duration: 1, x: 100, ease: 'power4.out'}, 0.7);
        this.transitionInTimeline.to(this.ui.headerLine1.current, {duration: 0.6, autoAlpha: 1, ease: 'none'}, 0.8);

        this.transitionInTimeline.from(this.ui.headerLine2.current, {duration: 1, x: -100, ease: 'power4.out'}, 0.9);
        this.transitionInTimeline.to(this.ui.headerLine2.current, {duration: 0.6, autoAlpha: 1, ease: 'none'}, 1.0);
        
        this.transitionInTimeline.from(this.ui.loading.current, {duration: 1, x: 50, ease: 'power4.out'}, 1.0);
        this.transitionInTimeline.to(this.ui.loading.current, {duration: 0.6, autoAlpha: 1, ease: 'none'}, 1.1);
                
        this.transitionInTimeline.play();
    }

    _transitionOut(onComplete) {
        this.transitoinOutTimeline = gsap.timeline({paused: true, onComplete});
        this.transitoinOutTimeline.to(this.ui.logo.current, {duration: 0.36, opacity: 0, y: -40, ease: 'power3.in'})
        this.transitoinOutTimeline.to(this.ui.headerLine1.current, {duration: 0.36, y: -40, opacity: 0, ease: 'power3.in'}, '-=0.2');
        this.transitoinOutTimeline.to(this.ui.headerLine2.current, {duration: 0.36, y: -40, opacity: 0, ease: 'power3.in'}, '-=0.2');
        this.transitoinOutTimeline.to(this.ui.button.current, {duration: 0.36, opacity: 0, y: -40, ease: 'power3.in'}, '-=0.2');
        this.transitoinOutTimeline.to(this.ui.video.current, {duration: 1, opacity: 0, ease: 'none'});
        this.transitoinOutTimeline.play();
    }

    _startGameHandler = () => {
        this._transitionOut(this.props.startGame);
    }
}

export default Intro;