import gsap from 'gsap';

import DelayedCalls from 'utils/DelayedCalls';
import FocusObserver from 'utils/FocusObserver';

import { getAsset } from 'utils/AssetLoader';
import { gameAudio } from 'modules/GameAudio';
import { gameVideos } from 'modules/GameVideos';

import {
    appStore,

    STATUS_INIT,
    STATUS_PLAYING,
    STATUS_PAUSED,
    STATUS_END_WIN,
    STATUS_END_LOSE,

    HAS_FOCUS,
    HAS_NO_FOCUS,

    NUM_ROUNDS,

    CONVERSATION_INIT,
    CONVERSATION_NEW_ROUND,
    CONVERSATION_INTRO,
    CONVERSATION_SLEEPY,
    CONVERSATION_STATEMENT,
    CONVERSATION_AGREEMENTS,
    CONVERSATION_RESPONSE,
    CONVERSATION_RESPONSE_FEEDBACK,
    CONVERSATION_REDEEM_CHALLENGE,
    CONVERSATION_REDEEM,
    CONVERSATION_FORGIVENESS,
    CONVERSATION_KICKOUT,
    CONVERSATION_WIN,
    CONVERSATION_END,

    INTERACTION_INIT,
    INTERACTION_NEW_ROUND,
    INTERACTION_AWAKE_INIT,
    INTERACTION_AWAKE_INTRO,
    INTERACTION_AWAKE_GAME,
    INTERACTION_AWAKE_OUTRO,
    INTERACTION_AWAKE_END,
    INTERACTION_HERO_INIT,
    INTERACTION_HERO,
    INTERACTION_HERO_END,
    INTERACTION_SLEEPY_INIT,
    INTERACTION_SLEEPY,
    INTERACTION_SLEEPY_END,
    INTERACTION_RESPONSE,
    INTERACTION_RESPONSE_END,
    INTERACTION_END,

    PLAYER_RESPONSE_CORRECT,
    PLAYER_RESPONSE_WRONG,
    PLAYER_RESPONSE_TYPE_APPEASE,
    PLAYER_RESPONSE_TYPE_DISENGAGE,
    PLAYER_RESPONSE_TYPE_YAWN,
    
    SLEEPY_FAILED_INIT,
    SLEEPY_FAILED_YES,
    SLEEPY_FAILED_NO,

    PLAYER_REDEEM_CORRECT,
    PLAYER_REDEEM_WRONG,

    SLEEPY_COUNTER_HIDDEN,
    SLEEPY_COUNTER_VISIBLE,

    INSTRUCTIONS_AWAKE_INTRO_HIDDEN,
    INSTRUCTIONS_AWAKE_INTRO_VISIBLE,

    INSTRUCTIONS_AWAKE_GAME_HIDDEN,
    INSTRUCTIONS_AWAKE_GAME_VISIBLE,

    INSTRUCTIONS_RESPONSE_HIDDEN,
    INSTRUCTIONS_RESPONSE_VISIBLE,

    CHALLENGE_RESPONSE_HIDDEN,
    CHALLENGE_RESPONSE_VISIBLE,

    INSTRUCTIONS_TAP_HIDDEN,
    INSTRUCTIONS_TAP_VISIBLE,

    CHALLENGE_REDEEM_HIDDEN,
    CHALLENGE_REDEEM_VISIBLE,

    COPY_PULL_UP_HIDDEN,
    COPY_PULL_UP_VISIBLE,

    COPY_STAY_WITH_US_HIDDEN,
    COPY_STAY_WITH_US_VISIBLE,
} from 'stores/AppStore';


export default class AppActions {
    create() {
        const tweenObj = {
            sclera: 0,
            pixelation: 0,
            saturation: 0,
            brightness: 0,
        };
        this._tweenSclera = gsap.fromTo(tweenObj, 0.1, { sclera: 0 }, { sclera: 1, ease: 'none', paused: true, onUpdate: () => {
            appStore.setState('sclera', tweenObj.sclera);
        } });
        this._tweenSclera.progress(1);

        this._tweenPixelation = gsap.fromTo(tweenObj, 1, { pixelation: 10 }, { pixelation: 0, ease: 'none', paused: true, onUpdate: () => {
            appStore.setState('pixelation', tweenObj.pixelation);
        } });

        this._tweenSaturation = gsap.fromTo(tweenObj, 0.3, { saturation: 0 }, { saturation: -1, ease: 'none', paused: true, onUpdate: () => {
            appStore.setState('saturation', tweenObj.saturation);
        } });

        this._tweenBrightness = gsap.fromTo(tweenObj, 0.3, { brightness: 0 }, { brightness: -0.01, ease: 'none', paused: true, onUpdate: () => {
            appStore.setState('brightness', tweenObj.brightness);
        } });

        gameVideos.create();
        gameVideos.addEventListener('clipBeforeEnd', this._clipBeforeEndHandler);

        gameAudio.create();

        this._delayedCalls = new DelayedCalls();

        this._setupEventListeners();

        this._focusObserver = new FocusObserver();
        this._focusObserver.addEventListener('update', (focus) => {
            if (focus && appStore.get('status') === STATUS_PAUSED) {
                appStore.setState('focus', HAS_FOCUS);
                this._tweenSaturation.reverse();
                this._tweenBrightness.reverse();
                this.doPlay();
            }
            else if(!focus && appStore.get('status') === STATUS_PLAYING) {
                appStore.setState('focus', HAS_NO_FOCUS);
                this._tweenSaturation.play();
                this._tweenBrightness.play();
                this.doPause();
            }
        });

        window.addEventListener('keydown', (e) => {
            if(e.keyCode === 192) {
                if (!this._gui || this._guiHidden) {
                    this.showDebug();
                }
                else {
                    this.hideDebug();
                }
            }

            if (!(appStore.get('interactionStatus') === INTERACTION_AWAKE_INIT || appStore.get('interactionStatus') === INTERACTION_AWAKE_GAME || appStore.get('interactionStatus') === INTERACTION_AWAKE_INTRO || appStore.get('interactionStatus') === INTERACTION_AWAKE_OUTRO)) {
                if(e.keyCode === 37) {
                    this.playArmSoda();
                }
                if(e.keyCode === 39) {
                    this.playArmYawn();
                }
            }

            if (appStore.get('interactionStatus') === INTERACTION_SLEEPY ) {
                if(e.keyCode === 38) { // up
                    this._sleepHit();
                }
            }
        });

        window.addEventListener('touchstart', () => {
            this._sleepHit();
        });
    }

    _sleepHit() {
        if (appStore.get('sleepyFailed') !== SLEEPY_FAILED_INIT) return;

        const hits = appStore.get('sleepyHits');
        const newHits = hits + 1;
        appStore.setState('sleepyHits', newHits);

        const hitsTotal = appStore.get('sleepyHitsTotal');
        const newHitsTotal = hitsTotal + 1;
        appStore.setState('sleepyHitsTotal', newHitsTotal);

        if (newHitsTotal >= appStore.get('sleepyThresholdTotal')) {
            appStore.setState('sleepyFailed', SLEEPY_FAILED_NO);
        }

        if (newHits >= appStore.get('sleepyThreshold')) {
            appStore.setState('sleepyHits', 0);

            const index = Math.floor(Math.random()*2.9999);
            const eases = ['sleep1', 'sleep2', 'sleep3'];

            const tweenObj = {
                current: appStore.get('sleepProgressContra'),
                target: appStore.get('sleepProgressContra') + 0.2,
            };
            this._tweenContra = gsap.to(tweenObj, { duration: 1, current: tweenObj.target, ease: eases[index], onUpdate: () => {
                appStore.setState('sleepProgressContra', tweenObj.current);
            } })
        }
    }

    setGlobalGameStatusCallback(callback) {
        this._setGlobalGameStatus = callback;
    }

    destroy() {
        this._destroy();
        gameVideos.removeEventListener('clipBeforeEnd', this._clipBeforeEndHandler);
        gameVideos.destroy();
        this._killDelayedCall();
    }

    showDebug() {
        this._setupDebug();
    }

    hideDebug() {
        this._removeDebug();
    }

    addPoints(value) {
        // internals
        const points = appStore.get('points');
        const newPoints = points+value;
        appStore.setState('points', newPoints);
        
        if (value > 0) {
            getAsset('brownie-points').play();
        }
        else {
            getAsset('brownie-points-negative').play();
        }

        // for visual
        appStore.dispatchEvent('points:add', value);
    }

    doInit = () => {
        this.doEnd();

        appStore.setInitialState();
        
        // randomize
        const pos = [-10 -8, -6, 6, 8, 10];
        const random = Math.floor(Math.random() * pos.length);
        appStore.setState('awakeRotationX', pos[random]);

        this._killDelayedCall();
        this._createTimelines();
        this._setGlobalGameStatus && this._setGlobalGameStatus('game');
    }

    doPlay = () => {
        if(appStore.get('status') === STATUS_INIT) {
            appStore.setState('conversationStatus', CONVERSATION_NEW_ROUND);
            appStore.setState('interactionStatus', INTERACTION_NEW_ROUND);
            appStore.setState('status', STATUS_PLAYING);
        }
        else if(appStore.get('status') === STATUS_PAUSED) {
            appStore.setState('status', STATUS_PLAYING);
        }
        else {
            // console.log('Action not possible, initialize first');
        }
    }

    doPause = () => {
        if (appStore.get('status') === STATUS_PLAYING) {
            appStore.setState('status', STATUS_PAUSED);
            appStore.setState('deltaTime', 0);
        }
        else {
            // console.log('Action not possible, game is not playing');
        }
    }

    doEndWin() {
        this.doEnd(STATUS_END_WIN);
    }

    doEndLose() {
        this.doEnd(STATUS_END_LOSE);
    }

    doEnd = (status) => {
        this._killTimelines();
        this._killDelayedCall();

        this._tweenPixelation.reverse();

        appStore.setState('sleepyCounter', SLEEPY_COUNTER_HIDDEN);
        appStore.setState('instructionsTap', INSTRUCTIONS_TAP_HIDDEN);
        appStore.setState('copyPullUp', COPY_PULL_UP_HIDDEN);
        appStore.setState('copyStayWithUs', COPY_STAY_WITH_US_HIDDEN);

        appStore.setState('deltaTime', 0);
        appStore.setState('status', status || STATUS_END_LOSE);
        
        appStore.setState('interactionStatus', INTERACTION_END);
        appStore.setState('conversationStatus', CONVERSATION_END);
        appStore.setState('videoStatus', CONVERSATION_END);
        this._setGlobalGameStatus && this._setGlobalGameStatus('game-end');

        this._updatesEyes(false);
    }

    doPlayerResponseCorrect(type = PLAYER_RESPONSE_TYPE_APPEASE) {
        if (appStore.get('challengeResponse') === CHALLENGE_RESPONSE_VISIBLE) {
            // console.log('player responded correct', type);
            appStore.setState('playerResponseType', type);
            appStore.setState('playerResponse', PLAYER_RESPONSE_CORRECT);
        }
    }

    doPlayerResponseWrong(type = PLAYER_RESPONSE_TYPE_DISENGAGE) {
        if (appStore.get('challengeResponse') === CHALLENGE_RESPONSE_VISIBLE) {
            // console.log('player responsed wrong', type);
            appStore.setState('playerResponseType', type);
            appStore.setState('playerResponse', PLAYER_RESPONSE_WRONG);
        }
    }

    doPlayerRedeemCorrect() {
        console.log('player redeemed correct');
        appStore.setState('playerRedeem', PLAYER_REDEEM_CORRECT);
    }

    doPlayerRedeemWrong() {
        console.log('player redeemed wrong');
        appStore.setState('playerRedeem', PLAYER_REDEEM_WRONG);
    }

    setAwakeRotation(rotation) { // in degrees
        appStore.setState('awakeRotationX', rotation.x);
        appStore.setState('awakeRotationY', rotation.y);
    }

    setAwakeTargetScreenPosition(coords) {
        appStore.setState('awakeTargetScreenPosition', coords);
    }

    setAwakeIndicatorScreenPosition(coords) {
        appStore.setState('awakeIndicatorScreenPosition', coords);
    }

    setAwakeIndicatorsDistance(distance) {
        appStore.setState('awakeIndicatorsDistance', distance);
    }

    _killDelayedCall() {
        this._delayedCalls.removeAll();
    }

    _createTimelines() {
        this._killTimelines();

        const tweenObj = {
            sleepy: 0,
        };

        this._tweenSleepy = gsap.timeline({ 
            paused: true,
            onUpdate: () => {
                appStore.setState('sleepy', tweenObj.sleepy);
            }
        });
        this._tweenSleepy.fromTo(tweenObj, 9, { sleepy: 0 }, { sleepy: 1, ease: 'custom' }, 0);
        this._tweenSleepy.add(() => {
            appStore.setState('instructionsTap', INSTRUCTIONS_TAP_HIDDEN);
        }, 0.001);
        this._tweenSleepy.add(() => {
            appStore.setState('copyPullUp', COPY_PULL_UP_HIDDEN);
        }, 0.001)
        this._tweenSleepy.add(() => {
            if (appStore.get('sleepyFailed') === SLEEPY_FAILED_YES) return; 
            appStore.setState('instructionsTap', INSTRUCTIONS_TAP_VISIBLE);
        }, 0.002);
        this._tweenSleepy.add(() => {
            appStore.setState('instructionsTap', INSTRUCTIONS_TAP_HIDDEN);
        }, 3.8);
        this._tweenSleepy.add(() => {
            if (appStore.get('sleepyFailed') === SLEEPY_FAILED_YES) return;
            appStore.setState('copyPullUp', COPY_PULL_UP_VISIBLE);
        }, 4);
        this._tweenSleepy.add(() => {
            if (appStore.get('sleepyFailed') === SLEEPY_FAILED_YES) return;
            appStore.setState('copyPullUp', COPY_PULL_UP_VISIBLE);
        }, 6.799);
        this._tweenSleepy.add(() => {
            appStore.setState('copyPullUp', COPY_PULL_UP_HIDDEN);
        }, 6.8)
        this._tweenSleepy.add(() => {
            appStore.setState('copyStayWithUs', COPY_STAY_WITH_US_HIDDEN);
        }, 6.999);
        this._tweenSleepy.add(() => {
            if (appStore.get('sleepyFailed') === SLEEPY_FAILED_YES) return;
            appStore.setState('copyStayWithUs', COPY_STAY_WITH_US_VISIBLE);
        }, 7);
        this._tweenSleepy.add(() => {
            if (appStore.get('sleepyFailed') === SLEEPY_FAILED_YES) return;
            appStore.setState('copyStayWithUs', COPY_STAY_WITH_US_VISIBLE);
        }, 8.499);
        this._tweenSleepy.add(() => {
            appStore.setState('copyStayWithUs', COPY_STAY_WITH_US_HIDDEN);
        }, 8.5);
    }

    _killTimelines() {
        if (this._tweenSleepy) {
            this._tweenSleepy.kill();
            this._tweenSleepy = null;
        }
    }

    _destroy() {
        // this._removeDebug();
        // this._removeEventListeners();
    }

    _setupEventListeners() {
        gsap.ticker.add(this._tick);
        appStore.addEventListener('change:interactionStatus', this._interactionStatusChangeHandler);
        appStore.addEventListener('change:conversationStatus', this._conversationStatusChangeHandler);
    }

    _removeEventListeners() {
        gsap.ticker.remove(this._tick);
        appStore.removeEventListener('change:interactionStatus', this._interactionStatusChangeHandler);
        appStore.removeEventListener('change:conversationStatus', this._conversationStatusChangeHandler);
    }

    _tick = (time, deltaTime) => {
        this._updateTime(deltaTime);
    }

    _updateTime(deltaTime) {
        if (appStore.get('status') === STATUS_PLAYING) {
            let currentTime = appStore.get('currentTime') + ((deltaTime/1000) * appStore.get('speed'));
            if (currentTime >= appStore.get('maxTime')) {
                appStore.setState('currentTime', appStore.get('maxTime'));
                appStore.setState('conversationStatus', CONVERSATION_WIN);
            }
            else {
                appStore.setState('currentTime', currentTime);
            }

            appStore.setState('deltaTime', deltaTime);
            this._delayedCalls.update(deltaTime);

            if (appStore.get('interactionStatus') === INTERACTION_SLEEPY) {
                this._updateSleepy(deltaTime);
            }
        }
    }

    _updateSleepy(deltaTime) {  
        const direction = appStore.get('sleepyFailed') === SLEEPY_FAILED_NO ? -1 : 1;

        const duration = 6.5;
        const prevProgress = appStore.get('sleepProgress');
        const progress = prevProgress + ((deltaTime/1000/duration) * direction);
        appStore.setState('sleepProgress', progress);
        const progressContra = appStore.get('sleepProgressContra')

        const p = Math.max(0, Math.min(1, progress - progressContra));
        this._tweenSleepy.progress(p);
        
        if (p >= 1) {
            this.doEndLose();
        }
        else if(p <= 0) {
            this.addPoints(5);

            if (this._delayedCallInteractionSleep) {
                this._delayedCallInteractionSleep.kill();
            }

            appStore.setState('sleepyCounter', SLEEPY_COUNTER_HIDDEN);
            appStore.setState('instructionsTap', INSTRUCTIONS_TAP_HIDDEN);
            appStore.setState('copyPullUp', COPY_PULL_UP_HIDDEN);
            appStore.setState('copyStayWithUs', COPY_STAY_WITH_US_HIDDEN);

            appStore.setState('interactionStatus', INTERACTION_SLEEPY_END);
        }
    }

    _resetSleep() {
        if (this._tweenContra) {
            this._tweenContra.kill();
            this._tweenContra = null;
        }

        if (this._delayedCallInteractionSleep) {
            this._delayedCallInteractionSleep.kill();
        }

        appStore.setState('sleepyHits', 0);
        appStore.setState('sleepyHitsTotal', 0);
        appStore.setState('sleepProgress', 0);
        appStore.setState('sleepProgressContra', 0);

        appStore.setState('sleepyCounter', SLEEPY_COUNTER_HIDDEN);
        appStore.setState('instructionsTap', INSTRUCTIONS_TAP_HIDDEN);
        appStore.setState('copyPullUp', COPY_PULL_UP_HIDDEN);
        appStore.setState('copyStayWithUs', COPY_STAY_WITH_US_HIDDEN);
        
        appStore.setState('sleepyFailed', SLEEPY_FAILED_INIT);
        
        this._tweenSleepy.progress(0);
    }

    _playRedeemAnswer(answers, flow) {
        const spriteLabelArray = Object.keys(flow.asset.sprite);
        const spriteIdArray = Object.values(flow.asset.sprite);
        const tl = gsap.timeline({paused: true});
        let delay = 0;
        answers.forEach(a => {
            if(typeof a === 'number') {
                tl.add(() => gameAudio.play(flow.asset.id, spriteLabelArray[a]), delay / 1000);
                delay += spriteIdArray[a][1];
            }
        });
        tl.play();
    }


    // interaction

    _interactionStatusChangeHandler = (value) => {
        this._interactionStateMachine(value);
    }

    _interactionStateMachine(value) {
        switch (value) {
            case INTERACTION_INIT:

                break;
            case INTERACTION_NEW_ROUND:
                this._delayedCall(1000, () => {
                    this._resetSleep();
                    appStore.setState('interactionStatus', INTERACTION_AWAKE_INIT); // start
                });
                break;
            case INTERACTION_AWAKE_INIT:
                console.log('init');
                this._delayedCall(1000, () => {
                    appStore.setState('interactionStatus', INTERACTION_AWAKE_INTRO);
                    appStore.setState('instructionsAwakeIntro', INSTRUCTIONS_AWAKE_INTRO_VISIBLE);
                });
                break;
            case INTERACTION_AWAKE_INTRO:
                console.log('awake intro');
                // done in the hero component
                // this._delayedCall(20000, () => {
                //     appStore.setState('interactionStatus', INTERACTION_AWAKE_GAME);
                // });
                break;
            case INTERACTION_AWAKE_GAME:
                console.log('awake game');
                // done in the hero component
                // this._delayedCall(1000, () => {
                //     appStore.setState('interactionStatus', INTERACTION_AWAKE_END);
                // });
                break;
            case INTERACTION_AWAKE_OUTRO:
                console.log('awake outro');
                // done in the hero component
                // this._delayedCall(1000, () => {
                //     appStore.setState('interactionStatus', INTERACTION_AWAKE_END);
                // });
                break;
            case INTERACTION_AWAKE_END:
                console.log('end');
                // this._delayedCall(1000, () => {
                //     appStore.setState('interactionStatus', INTERACTION_RESPONSE);
                // });
                break;
            case INTERACTION_HERO_INIT:
                console.log('init');
                this._delayedCall(1000, () => {
                    appStore.setState('interactionStatus', INTERACTION_HERO);
                });
                break;
            case INTERACTION_HERO:
                console.log('hero');
                // done in the hero component
                // this._delayedCall(20000, () => {
                //     appStore.setState('interactionStatus', INTERACTION_HERO_END);
                // });
                break;
            case INTERACTION_HERO_END:
                console.log('end');
                this._delayedCall(1000, () => {
                    appStore.setState('interactionStatus', INTERACTION_SLEEPY_INIT);
                });
                break;
            case INTERACTION_SLEEPY_INIT:
                this._resetSleep();
                appStore.setState('interactionStatus', INTERACTION_SLEEPY);
                break;
            case INTERACTION_SLEEPY:
                appStore.setState('sleepyCounter', SLEEPY_COUNTER_VISIBLE);

                this._delayedCallInteractionSleep = this._delayedCall(6000, () => {
                    if (appStore.get('sleepyFailed') === SLEEPY_FAILED_INIT) {
                        appStore.setState('sleepyFailed', SLEEPY_FAILED_YES);
                    }
                    appStore.setState('sleepyCounter', SLEEPY_COUNTER_HIDDEN);
                    appStore.setState('instructionsTap', INSTRUCTIONS_TAP_HIDDEN);
                    appStore.setState('copyPullUp', COPY_PULL_UP_HIDDEN);
                    appStore.setState('copyStayWithUs', COPY_STAY_WITH_US_HIDDEN);
                });
                break;
            case INTERACTION_SLEEPY_END:
                this._delayedCall(1000, () => {
                    appStore.setState('interactionStatus', INTERACTION_RESPONSE);
                });

                break;
            case INTERACTION_RESPONSE:
                appStore.setState('playerResponse', PLAYER_RESPONSE_WRONG);
                appStore.setState('playerResponseType', PLAYER_RESPONSE_TYPE_DISENGAGE);
                
                appStore.setState('instructionsResponse', INSTRUCTIONS_RESPONSE_VISIBLE);
                
                this._delayedCall(1000, function() {
                    appStore.setState('instructionsResponse', INSTRUCTIONS_RESPONSE_HIDDEN);
                });

                this._delayedCall(1000, function() {
                    appStore.setState('challengeResponse', CHALLENGE_RESPONSE_VISIBLE);
                });
                this._delayedCall(4000, function() {
                    appStore.setState('interactionStatus', INTERACTION_RESPONSE_END);
                });
                break;
                case INTERACTION_RESPONSE_END:
                    appStore.setState('challengeResponse', CHALLENGE_RESPONSE_HIDDEN);

                    const type = appStore.get('playerResponseType');
                    let index;
                    let track;
                    switch (type) {
                        case PLAYER_RESPONSE_TYPE_APPEASE:
                            this.addPoints(10);
                            index = Math.floor(Math.random()*3.9999);
                            track = `${type}-${index}`;
                            break;
                        case PLAYER_RESPONSE_TYPE_DISENGAGE:
                            this.addPoints(-10);
                            index = Math.floor(Math.random()*2.9999);
                            track = `${type}-${index}`;
                            break;
                        case PLAYER_RESPONSE_TYPE_YAWN:
                            index = 0;
                            track = `${type}-${index}`;
                            break;
                    }
                    let sound = getAsset(track);
                    sound.play();

                    if(appStore.get('playerResponse') === PLAYER_RESPONSE_CORRECT) {
                        this._delayedCall(3000, () => {
                            appStore.setState('interactionStatus', INTERACTION_RESPONSE); // loop
                        });
                    }
                    else {
                        this._killDelayedCall();
                        // For some weird reason this is required? 
                        // Still need to investigate
                        this._delayedCall(10, () => {});
                        
                        this._delayedCall(1000, () => {
                            appStore.setState('conversationStatus', CONVERSATION_RESPONSE_FEEDBACK);
                        });

                        this._delayedCall(7000, () => {
                            appStore.setState('interactionStatus', INTERACTION_RESPONSE); // loop
                        });
                    }

                break;   
            case INTERACTION_END:
                appStore.setState('sleepyCounter', SLEEPY_COUNTER_HIDDEN);
                appStore.setState('instructionsTap', INSTRUCTIONS_TAP_HIDDEN);
                appStore.setState('copyPullUp', COPY_PULL_UP_HIDDEN);
                appStore.setState('copyStayWithUs', COPY_STAY_WITH_US_HIDDEN);
                appStore.setState('challengeResponse', CHALLENGE_RESPONSE_HIDDEN);
                break;
        }         
    }

    // conversation

    _conversationStatusChangeHandler = (value) => {
        this._conversationStateMachine(value);
    }

    _conversationStateMachine(value) {
        switch (value) {
            case CONVERSATION_INIT:
                appStore.setState('videoStatus', CONVERSATION_INIT);
                
                this._tweenPixelation.progress(0);
                
                this._tweenSclera.pause();
                this._tweenSclera.progress(1);

                break;
            case CONVERSATION_NEW_ROUND:
                this._tweenPixelation.play();

                if (appStore.get('conversationPlayIntro')) {
                    appStore.setState('conversationStatus', CONVERSATION_INTRO);
                }
                else {
                    appStore.setState('conversationStatus', CONVERSATION_STATEMENT);
                }
                break;
            case CONVERSATION_INTRO:
                appStore.setState('conversationPlayIntro', false);

                appStore.setState('videoStatus', CONVERSATION_INTRO);

                this._delayedCall(4000, () => {
                    appStore.setState('conversationStatus', CONVERSATION_STATEMENT);
                });
                break;
            case CONVERSATION_STATEMENT:
                appStore.setState('videoStatus', CONVERSATION_STATEMENT);
                
                this._delayedCall(4000, function() {
                    appStore.setState('conversationStatus', CONVERSATION_RESPONSE);
                });

                break;
            case CONVERSATION_RESPONSE:
                appStore.setState('videoStatus', CONVERSATION_AGREEMENTS);
                this._delayedCall(3000, () => {   
                    appStore.setState('videoStatus', CONVERSATION_NEW_ROUND);
                    appStore.setState('conversationStatus', CONVERSATION_NEW_ROUND);
                });
                break
            case CONVERSATION_RESPONSE_FEEDBACK:
                appStore.setState('videoStatus', CONVERSATION_RESPONSE_FEEDBACK);

                this._delayedCall(6000, () => {
                    appStore.setState('videoStatus', CONVERSATION_NEW_ROUND);
                    appStore.setState('conversationStatus', CONVERSATION_NEW_ROUND);
                });
                break;
            case CONVERSATION_WIN:
                appStore.setState('conversationStatus', CONVERSATION_END);
                this.doEndWin();
                break;
            case CONVERSATION_END:
                // nope
                break;
        }
    }

    _addRound() {
        let rounds = appStore.get('rounds');
        appStore.setState('rounds', ++rounds);
    }

    _delayedCall(duration, callback) {
        return this._delayedCalls.create(duration, callback);
    }

    _clipBeforeEndHandler = (clipBeforeEnd) => {
        this._updatesEyes(clipBeforeEnd);
    }

    _updatesEyes(clipBeforeEnd) {
        this._tweenSclera.timeScale(1);
        if (appStore.get('conversationStatus') === CONVERSATION_END || appStore.get('conversationStatus') === CONVERSATION_INIT) {
            this._tweenSclera.reverse();
        }
        else if (clipBeforeEnd) {
            if (appStore.get('conversationStatus') === CONVERSATION_INTRO) { 
                this._tweenSclera.timeScale(4);    
            }
            this._tweenSclera.play();
        }
        else {
            this._tweenSclera.reverse();
        }
    }


    // debug

    playArmYawn = () => {
        gameVideos.playArmYawn();
    }
    
    playArmSoda = () => {
        gameVideos.playArmSoda();
    }

    _setupDebug() {
        if (!process.browser) return;
        if (this._gui) {
            this._gui.open();
            this._guiHidden = false;
            return;
        }
        
        const dat = require('dat.gui');

        this._gui = new dat.GUI();
        this._gui.open();


        const global = this._gui.addFolder('Global');
        global.open();
        global.add(this, 'doInit').name('Init game');
        global.add(this, 'doPlay').name('Play game');
        global.add(this, 'doPause').name('Pause game');
        global.add(this, 'doEndLose').name('End game (lose)');
        global.add(this, 'doEndWin').name('End game (win)');

        global.add(appStore.state, 'points').listen();
        global.add(appStore.state, 'status').listen();
        global.add(appStore.state, 'maxTime', 0, 600, 1).name('maxTime (s)').listen();
        global.add(appStore.state, 'currentTime', 0, null, 0.001).name('currentTime (s)').listen();
        global.add(appStore.state, 'deltaTime', 0, 32, 1).name('deltaTime (ms)').listen();
        // global.add(appStore.state, 'speed', 0, 3, 0.01).listen();

        global.add(appStore.state, 'sclera', 0, 1, 0.001).listen();
        
        const sleepy = global.addFolder('Sleepy');
        sleepy.open();
        sleepy.add(appStore.state, 'sleepy', 0, 1, 0.001).name('progress').listen();
        sleepy.add(appStore.state, 'sleepyThreshold', 0, 50, 1).name('threshold').listen();
        sleepy.add(appStore.state, 'sleepyHits', 0, 50, 1).name('hits').listen();
        sleepy.add(appStore.state, 'sleepyThresholdTotal', 0, 50, 1).name('total threshold').listen();
        sleepy.add(appStore.state, 'sleepyHitsTotal', 0, 50, 1).name('total hits').listen();


        const conversation = global.addFolder('Conversation');
        conversation.open();
        conversation.add(appStore.state, 'conversationStatus').name('status').listen();


        const interactions = this._gui.addFolder('Interactions');
        interactions.open();
        interactions.add(this, 'doPlayerResponseCorrect').name('Correct response');
        interactions.add(this, 'doPlayerResponseWrong').name('Wrong response');
        // interactions.add(this, 'doPlayerRedeemCorrect').name('correct redeem');
        // interactions.add(this, 'doPlayerRedeemWrong').name('wrong redeem');



        const camera = this._gui.addFolder('Camera');
        // camera.open();
        const cameraPosition = camera.addFolder('Position');
        cameraPosition.open();
        cameraPosition.add(appStore.state, 'cameraPositionX', undefined, undefined, 0.01).name('x').listen();
        cameraPosition.add(appStore.state, 'cameraPositionY', undefined, undefined, 0.01).name('y').listen();
        cameraPosition.add(appStore.state, 'cameraPositionZ', undefined, undefined, 0.01).name('z').listen();
        const cameraRotation = camera.addFolder('Rotation');
        cameraRotation.open();
        cameraRotation.add(appStore.state, 'cameraRotationX', undefined, undefined, 0.01).name('x').listen();
        cameraRotation.add(appStore.state, 'cameraRotationY', undefined, undefined, 0.01).name('y').listen();
        cameraRotation.add(appStore.state, 'cameraRotationZ', undefined, undefined, 0.01).name('z').listen();



        const scene = this._gui.addFolder('Scene');
        scene.open();

        const room = scene.addFolder('Room');
        room.open();

        const glass = room.addFolder('Glass');
        
        glass.open();
        const s = {glassEmissive: appStore.state.glassEmissive};
        glass.addColor(s, 'glassEmissive').name('emissive').listen().onChange((e) => { appStore.setState('glassEmissive', e )});
        glass.add(appStore.state, 'glassTransparency', 0, 1, 0.01).name('transparency').listen();

        const person = scene.addFolder('Person');
        person.open();
        const rightArm = person.addFolder('Right Arm');
        rightArm.open();
        rightArm.add(appStore.state, 'rightArmScale', 0, undefined, 0.01).name('scale').listen();
        rightArm.add(appStore.state, 'rightArmPositionX', undefined, undefined, 0.01).name('pos x').listen();
        rightArm.add(appStore.state, 'rightArmPositionY', undefined, undefined, 0.01).name('pos y').listen();
        rightArm.add(appStore.state, 'rightArmPositionZ', undefined, undefined, 0.01).name('pos z').listen();
        rightArm.add(appStore.state, 'rightArmRotationX', undefined, undefined, 0.01).name('rot x').listen();
        rightArm.add(appStore.state, 'rightArmRotationY', undefined, undefined, 0.01).name('rot y').listen();
        rightArm.add(appStore.state, 'rightArmRotationZ', undefined, undefined, 0.01).name('rot z').listen();

        const leftArm = person.addFolder('Left Arm');
        leftArm.open();
        leftArm.add(appStore.state, 'leftArmScale', 0, undefined, 0.01).name('scale').listen();
        leftArm.add(appStore.state, 'leftArmPositionX', undefined, undefined, 0.01).name('pos x').listen();
        leftArm.add(appStore.state, 'leftArmPositionY', undefined, undefined, 0.01).name('pos y').listen();
        leftArm.add(appStore.state, 'leftArmPositionZ', undefined, undefined, 0.01).name('pos z').listen();
        leftArm.add(appStore.state, 'leftArmRotationX', undefined, undefined, 0.01).name('rot x').listen();
        leftArm.add(appStore.state, 'leftArmRotationY', undefined, undefined, 0.01).name('rot y').listen();
        leftArm.add(appStore.state, 'leftArmRotationZ', undefined, undefined, 0.01).name('rot z').listen();


        const armsYawn = person.addFolder('armsYawn');
        armsYawn.open();
        armsYawn.add(appStore.state, 'armsYawnScale', 0, undefined, 0.01).name('scale').listen();
        armsYawn.add(appStore.state, 'armsYawnPositionX', undefined, undefined, 0.01).name('x').listen();
        armsYawn.add(appStore.state, 'armsYawnPositionY', undefined, undefined, 0.01).name('y').listen();
        armsYawn.add(appStore.state, 'armsYawnPositionZ', undefined, undefined, 0.01).name('z').listen();
        armsYawn.add(this, 'playArmYawn').name('play arm yawn');

        const armsSoda = person.addFolder('armsSoda');
        armsSoda.open();
        armsSoda.add(appStore.state, 'armsSodaScale', 0, undefined, 0.01).name('scale').listen();
        armsSoda.add(appStore.state, 'armsSodaPositionX', undefined, undefined, 0.01).name('x').listen();
        armsSoda.add(appStore.state, 'armsSodaPositionY', undefined, undefined, 0.01).name('y').listen();
        armsSoda.add(appStore.state, 'armsSodaPositionZ', undefined, undefined, 0.01).name('z').listen();
        armsSoda.add(this, 'playArmSoda').name('play arm soda');

        const characters = scene.addFolder('Characters');

        const character01 = characters.addFolder('Andrew');
        character01.open();
        character01.add(appStore.state, 'character01Scale', 0, undefined, 0.01).name('scale').listen();
        character01.add(appStore.state, 'character01PositionX', undefined, undefined, 0.01).name('x').listen();
        character01.add(appStore.state, 'character01PositionY', undefined, undefined, 0.01).name('y').listen();
        character01.add(appStore.state, 'character01PositionZ', undefined, undefined, 0.01).name('z').listen();

        const character02 = characters.addFolder('Ava');
        character02.open();
        character02.add(appStore.state, 'character02Scale', 0, undefined, 0.01).name('scale').listen();
        character02.add(appStore.state, 'character02PositionX', undefined, undefined, 0.01).name('x').listen();
        character02.add(appStore.state, 'character02PositionY', undefined, undefined, 0.01).name('y').listen();
        character02.add(appStore.state, 'character02PositionZ', undefined, undefined, 0.01).name('z').listen();

        const character03 = characters.addFolder('Paul');
        character03.open();
        character03.add(appStore.state, 'character03Scale', 0, undefined, 0.01).name('scale').listen();
        character03.add(appStore.state, 'character03PositionX', undefined, undefined, 0.01).name('x').listen();
        character03.add(appStore.state, 'character03PositionY', undefined, undefined, 0.01).name('y').listen();
        character03.add(appStore.state, 'character03PositionZ', undefined, undefined, 0.01).name('z').listen();

        // const character04 = characters.addFolder('character04');
        // // character04.open();
        // character04.add(appStore.state, 'character04Scale', 0, undefined, 0.01).name('scale').listen();
        // character04.add(appStore.state, 'character04PositionX', undefined, undefined, 0.01).name('x').listen();
        // character04.add(appStore.state, 'character04PositionY', undefined, undefined, 0.01).name('y').listen();
        // character04.add(appStore.state, 'character04PositionZ', undefined, undefined, 0.01).name('z').listen();
    }

    _removeDebug() {
        if (this._gui) {
            this._guiHidden = true;
            this._gui.close();
        }
    }
}

export const appActions = new AppActions();