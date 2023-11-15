import gsap from 'gsap';
import React, { PureComponent, Fragment } from 'react';
import { appStore, 
    STATUS_PLAYING, 

    INSTRUCTIONS_AWAKE_INTRO_HIDDEN,
    INSTRUCTIONS_AWAKE_INTRO_VISIBLE,
    INSTRUCTIONS_AWAKE_GAME_HIDDEN,
    INSTRUCTIONS_AWAKE_GAME_VISIBLE,

    INTERACTION_AWAKE_INIT, 
    INTERACTION_AWAKE_INTRO, 
    INTERACTION_AWAKE_GAME, 
    INTERACTION_AWAKE_OUTRO, 
    INTERACTION_AWAKE_END 
} from 'stores/AppStore';
import { appActions } from 'stores/AppActions';
import { getAsset } from 'utils/AssetLoader';
import { lerp } from 'utils/easing';

import CountdownClock from 'components/CountdownClock';

export default class Awake extends PureComponent {
    constructor(props) {
        super(props);

        this.ui = {
            target: React.createRef(),
            progress: React.createRef(),
            indicator: React.createRef(),
            clock: React.createRef(),
        };

        this._initGame(true);
    }
    
    componentDidMount() {
        this._setupEventListeners();
    }

    componentWillUnmount() {
        this._removeEventListeners();
    }

    _initGame(firstTime) {
        if (firstTime) {
            this.state = {
                visible: false,
                success: false,
                game: false
            };
        }
        else {
            this.setState({
                visible: false,
                success: false,
                game: false
            });
        }

        this._isUp = false;
        this._isDown = false;
        this._isLeft = false;
        this._isRight = false;

        this._force = {
            x: 0,
            y: 0
        };

        this._velocity = {
            x: 0,
            y: 0
        };

        this._rotation = {
            x: appStore.get('awakeRotationX'),
            y: appStore.get('awakeRotationY')
        };

        this._progress = 0;
        
        this._tweenObj = {
            targetScale: 0,
            targetOpacity: 0,

            indicatorScale: 0,
            indicatorOpacity: 0,

            awake: 0
        }
    }

    render() {
        const { visible, success, game } = this.state;
        if(!visible) return null;

        let className = "awake";
        if (success) className += ' awake--success';
        return (
            <Fragment>
                <div className={className}>
                    <div ref={this.ui.target} className="awake__target">
                        <div ref={this.ui.progress} className="awake__target-progress"></div>
                    </div>
                    <div ref={this.ui.indicator} className="awake__indicator"></div>
                </div>
                {game && <CountdownClock duration={8} ref={this.ui.clock} onEnd={() => { 
                    const interactionStatus = appStore.get('interactionStatus');
                    if (interactionStatus !== INTERACTION_AWAKE_GAME) return;
                    
                    appStore.setState('instructionsAwakeIntro', INSTRUCTIONS_AWAKE_INTRO_HIDDEN);
                    appStore.setState('instructionsAwakeGame', INSTRUCTIONS_AWAKE_GAME_HIDDEN);
                    appActions.doEndLose();

                    const y = this._rotation.y + 35;
                    const duration = Math.max(1, this._mapRange(y, 70, 0, 0, 5));

                    const tl = new gsap.timeline();
                    tl.to(this._rotation, { duration, y: 35, ease: 'power1.inOut', onUpdate: () => {
                        appActions.setAwakeRotation(this._rotation);
                        this._updateBlur();
                    }}, 0);
                    this._tweenObj.awake = appStore.get('awake');
                    tl.to(this._tweenObj, { duration, awake: 1, ease: 'power1.inOut', onUpdate: () => {
                        appStore.setState('awake', this._tweenObj.awake);
                    }}, 0);
                }}/> }
            </Fragment>
        )
    }

    _setupEventListeners() {
        // precautions
        this._removeEventListeners();

        gsap.ticker.add(this._tick);
        window.addEventListener('keydown', this._keyDownHandler);
        window.addEventListener('keyup', this._keyUpHandler);
        appStore.addEventListener('change:interactionStatus', this._changeHandler);
    }

    _removeEventListeners() {
        gsap.ticker.remove(this._tick);
        window.removeEventListener('keydown', this._keyDownHandler);
        window.removeEventListener('keyup', this._keyUpHandler);
        appStore.removeEventListener('change:interactionStatus', this._changeHandler);
    }

    _reset() {
        this._initGame();
    }

    _updateAwake(max) {
        const y = this._rotation.y;
        const awake = Math.min(max || 0.9, this._mapRange(y, 0, 35, 0, 1));
        appStore.setState('awake', Math.min(1, Math.max(0, awake)));
    }
    _updateBlur() {
        const awakeBlur = this._mapRange(Math.abs(this._rotation.y), 0, 35, 0, 0.7);
        appStore.setState('awakeBlur', awakeBlur);
    }

    _tick = (time, deltaTime) => {
        const interactionStatus = appStore.get('interactionStatus');
        if (appStore.get('status') === STATUS_PLAYING) {
            if (appStore.get('status') === STATUS_PLAYING && (interactionStatus === INTERACTION_AWAKE_INTRO || interactionStatus === INTERACTION_AWAKE_GAME)) {
                this._force = this._getNewForce(deltaTime);
                this._velocity = this._getNewVelocity();
                this._rotation  = this._getNewRotation();
                appActions.setAwakeRotation(this._rotation);

                this._updateAwake();
                this._updateBlur();
            }

            if (interactionStatus === INTERACTION_AWAKE_INTRO) {
                if (this._rotation.y < 15) {
                    appStore.setState('interactionStatus', INTERACTION_AWAKE_GAME);

                    appStore.setState('instructionsAwakeIntro', INSTRUCTIONS_AWAKE_INTRO_HIDDEN);
                    appStore.setState('instructionsAwakeGame', INSTRUCTIONS_AWAKE_GAME_VISIBLE);
                }
            }

            if (interactionStatus === INTERACTION_AWAKE_GAME) {
                if (!this.state.game) this.setState({game: true});

                if (this._progress >= 1) {
                    getAsset('body-language-strong').play();
                    
                    appStore.setState('interactionStatus', INTERACTION_AWAKE_OUTRO);   
                    appStore.setState('instructionsAwakeGame', INSTRUCTIONS_AWAKE_GAME_HIDDEN);                 
                    appActions.addPoints(10);
                    this.setState({success: true});
                }
            }
        }

        this._updateProgress();
        this._updateElements();
    }

    _mapRange(value, in_min, in_max, out_min, out_max) {
        return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    _updateElements() {
        const transformTarget = `translate(${appStore.get('awakeTargetScreenPosition').x}px, ${appStore.get('awakeTargetScreenPosition').y}px) scale(${this._tweenObj.targetScale})`;
        if(this.ui.target.current) this.ui.target.current.style.transform = transformTarget;
        if(this.ui.target.current) this.ui.target.current.style.opacity = this._tweenObj.targetOpacity;
        
        const transformIndicator = `translate(${appStore.get('awakeIndicatorScreenPosition').x}px, ${appStore.get('awakeIndicatorScreenPosition').y}px) scale(${this._tweenObj.indicatorScale})`;
        if(this.ui.indicator.current) this.ui.indicator.current.style.transform = transformIndicator;
        if(this.ui.indicator.current) this.ui.indicator.current.style.opacity = this._tweenObj.indicatorOpacity;
        
        const transformProgress = `scale(${this._progress})`;
        if(this.ui.progress.current) this.ui.progress.current.style.transform = transformProgress;
    }

    _updateProgress() {
        let progress = this._progress;
        if (appStore.get('awakeIndicatorsDistance') < 100) {
            progress += 0.01;
            progress = Math.min(1, progress);
        }
        else {
            progress -= 0.02;
            progress = Math.max(0, progress);
        }
        this._progress = Math.round(progress*100)/100;
    }

    _getNewForce(deltaTime) {
        let force = {
            x: 0,
            y: 0
        };

        const g = deltaTime / 800; // 16/700 = 0.022
        const f = deltaTime / 600; // 16/500 = 0.032
        // console.log(deltaTime, f, g);

        const gravity = g;
        if(this._isLeft) {
            force.x += -f;
        }
        if (this._isUp){
            force.y += -f;
        }
        else {
            force.y += gravity;
        }
        if (this._isRight){
            force.x += f;
        }
        if (this._isDown){
            force.y += f;
        }
        if (this._isUp && this._isDown){
            force.y += gravity;
        }

        return force;
    }

    _getNewVelocity() {
        let velocity = {
            x: this._velocity.x,
            y: this._velocity.y
        }

        velocity.x += this._force.x;
        velocity.y += this._force.y;

        velocity.x *= 0.99;
        velocity.y *= 0.98;

        return velocity;
    }

    _getNewRotation() {
        let rotation = {
            x: this._rotation.x,
            y: this._rotation.y
        }

        rotation.x += this._velocity.x;
        rotation.y += this._velocity.y;

        rotation.x = Math.min(35, Math.max(-35, rotation.x));
        rotation.y = Math.min(35, Math.max(-35, rotation.y));
        
        if (Math.abs(rotation.x) === 35) {
            this._velocity.x = 0;
        }

        if (Math.abs(rotation.y) === 35) {
            this._velocity.y = 0;
        }

        return rotation;
    }


    _keyDownHandler = (e) => {
        const interactionStatus = appStore.get('interactionStatus');
        if (appStore.get('status') === STATUS_PLAYING && (interactionStatus === INTERACTION_AWAKE_INTRO)) {
            if (e.keyCode === 38){ // up
                this._isUp = true;
            }
        }
        else if (appStore.get('status') === STATUS_PLAYING && (interactionStatus === INTERACTION_AWAKE_GAME)) {
            if(e.keyCode === 37) { // left
                this._isLeft = true;
            }
            else if (e.keyCode === 38){ // up
                this._isUp = true;
            }
            else if (e.keyCode === 39){ // right
                this._isRight = true;
            }
            else if (e.keyCode === 40){ // right
                this._isDown = true;
            }
        }
    }

    _keyUpHandler = (e) => {
        const interactionStatus = appStore.get('interactionStatus');
        if (appStore.get('status') === STATUS_PLAYING && (interactionStatus === INTERACTION_AWAKE_INTRO)) {
            if (e.keyCode === 38){ // up
                this._isUp = false;
            }
        }
        else if (appStore.get('status') === STATUS_PLAYING && (interactionStatus === INTERACTION_AWAKE_GAME)) {
            if(e.keyCode === 37) { // left
                this._isLeft = false;
            }
            else if (e.keyCode === 38){ // up
                this._isUp = false;
            }
            else if (e.keyCode === 39){ // right
                this._isRight = false;
            }
            else if (e.keyCode === 40){ // right
                this._isDown = false;
            }
        }
    }

    _changeHandler = (value) => {
        if (value === INTERACTION_AWAKE_INIT) {
            this._reset();
        }
        
        if (value === INTERACTION_AWAKE_INTRO) {
            const tl = new gsap.timeline();
            tl.to(this._tweenObj, { duration: 0.5, indicatorScale: 1, ease: 'back.out'}, 0);
            tl.to(this._tweenObj, { duration: 0.5, indicatorOpacity: 1, ease: 'none'}, 0);
            tl.to(this._tweenObj, { duration: 0.5, targetScale: 1, ease: 'back.out'}, 0);
            tl.to(this._tweenObj, { duration: 0.5, targetOpacity: 1, ease: 'none'}, 0);
        }

        if (value === INTERACTION_AWAKE_OUTRO) {
            const tl = new gsap.timeline({
                onComplete: () => {
                    appStore.setState('interactionStatus', INTERACTION_AWAKE_END);
                }
            });
            tl.to(this._tweenObj, { duration: 0.3, indicatorScale: 0, ease: 'back.in'}, 0);
            tl.to(this._tweenObj, { duration: 0.2, indicatorOpacity: 0, ease: 'none'}, 0.1);
            tl.to(this._tweenObj, { duration: 0.5, targetScale: 0, ease: 'power1.in'}, 0.2);
            tl.to(this._tweenObj, { duration: 0.5, targetOpacity: 0, ease: 'none'}, 0.2);
            tl.to(this._rotation, { duration: 0.5, x: 0, y: 0, ease: 'power1.inOut', onUpdate: () => {
                appActions.setAwakeRotation(this._rotation);
                this._updateBlur();
            }}, 0);
        }

        if (value === INTERACTION_AWAKE_END) {
            this._reset();
        }

        const visible = (value === INTERACTION_AWAKE_INIT || value === INTERACTION_AWAKE_INTRO || value === INTERACTION_AWAKE_GAME || value === INTERACTION_AWAKE_OUTRO) ? true : false;
        if (this.state.visible !== visible) {
            this.setState({ visible });
        }
    }
}