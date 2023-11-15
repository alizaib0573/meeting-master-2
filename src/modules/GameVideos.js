import gsap from 'gsap';
import conversationAgreements from 'data/conversationAgreements';
import conversationForgiveness from 'data/conversationForgiveness';
import conversationIdle from 'data/conversationIdle';
import conversationIntro from 'data/conversationIntro';
import conversationKickout from 'data/conversationKickout';
import conversationWin from 'data/conversationWin';
import conversationRedeem from 'data/conversationRedeem';
import conversationStatements from 'data/conversationStatements';

import { getAsset } from 'utils/AssetLoader';
import { EventDispatcher } from 'utils/EventDispatcher';

import { 
    appStore, 

    STATUS_INIT, 
    STATUS_PLAYING, 
    STATUS_PAUSED, 
    STATUS_END_WIN, 
    STATUS_END_LOSE, 

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
} from 'stores/AppStore';


const FPS = 25;

class GameVideos extends EventDispatcher {
    
    create() {
        this._chars = ['ava', 'andrew', 'paul'];

        this._videos = {
            ava: {
                video: this._createVideoElement('video-ava'),
                type: null,
                clip: null
            },
            paul: {
                video: this._createVideoElement('video-paul'),
                type: null,
                clip: null
            },
            andrew: {
                video: this._createVideoElement('video-andrew'),
                type: null,
                clip: null
            },

            yawn: {
                video: this._createVideoElement('video-yawn', { loop: false }),
                type: null,
                clip: null
            },
            soda: {
                video: this._createVideoElement('video-soda', { loop: false }),
                type: null,
                clip: null
            },
            // rebecca: {
            //     video: this._createVideoElement('video-rebecca'),
            //     type: null,
            //     clip: null
            // }
        }

        this._setupEventListeners();
    }

    playArmYawn() {
        this._videos['yawn'].video.play();
    }

    playArmSoda() {
        this._videos['soda'].video.play();
    }

    destroy() {
        this._removeEventListeners();
    }

    getVideoElement(char) {
        return this._videos[char].video;
    }

    _setupEventListeners() {
        appStore.addEventListener('change:videoStatus', this._videoStatusChangeHandler);
        appStore.addEventListener('change:status', this._statusChangeHandler);
        gsap.ticker.add(this._tick);
    }

    _removeEventListeners() {
        appStore.removeEventListener('change:videoStatus', this._videoStatusChangeHandler);
        appStore.removeEventListener('change:status', this._statusChangeHandler);
        gsap.ticker.remove(this._tick);
    }

    _createVideoElement(id, options = { loop: true }) {
        const { loop } = options;

        // and we can set it as source on the video element
        const video = document.createElement('video');
        video.preload = 'auto';
        // video.autoload = true;
        video.src = getAsset(id);
        // video.muted = true;
        video.playsinline = true;
        video.setAttribute('playsinline', 'playsinline');
        // video.setAttribute('autoplay', 'autoplay');
        loop && video.setAttribute('loop', 'loop');
        // video.setAttribute('muted', 'muted');
        return video;
    }

    _seekVideo(video, time) {
        video.currentTime = time;
    }

    _playVideo(video) {
        if (video.paused) {
            const playPromise = video.play();

            if (playPromise !== undefined) {
                playPromise.then(function() {
                    // Automatic playback started!
                }).catch(function(error) {
                    // Automatic playback failed.
                });
            }
        }
    }

    _pauseVideo(video) {
        if (!video.paused) {
            video.pause();
        }
    }
    
    _pauseVideos() {
        const chars = ['ava', 'andrew', 'paul'];
        for (let i=0, len=chars.length; i<len; i++) {
            this._pauseVideo(this._videos[chars[i]].video);
        }
    }

    _playVideos() {
        const chars = ['ava', 'andrew', 'paul'];
        for (let i=0, len=chars.length; i<len; i++) {
            this._playVideo(this._videos[chars[i]].video);
        }
    }

    _updateVideos() {
        const chars = ['ava', 'andrew', 'paul'];
        for (let i=0, len=chars.length; i<len; i++) {
            this._updateCharVideo(chars[i]);
        }
    }

    _updateCharVideo(char) {
        const asset = appStore.get(char);

        this._videos[char].type = asset.type;
        this._videos[char].clip = asset.clip;

        // mute / unmute
        if (this._videos[char].type === 'redeem') {
            // this._videos[char].video.muted = false;
        }
        else {
            // this._videos[char].video.muted = true;
        }
        
        this._seekVideo(this._videos[char].video, asset.clip.start/FPS);
        this._playVideo(this._videos[char].video);
    }

    _rand(num) {
        // return 0;
        return this._getRandomInt(0, num-1);
    }

    _getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _statusChangeHandler = (value) => {
        if (appStore.get('status') === STATUS_PAUSED) {
            this._pauseVideos();
        }
        if (appStore.get('status') === STATUS_PLAYING) {
            this._playVideos();
        }
    }

    _generateStatementsOrder() {
        const order = [];
        const size = Object.keys(conversationStatements).length;
        
        let charIndex = 0;
        let itemIndex = 0;
        for (let char in conversationStatements) {
            let charArray = conversationStatements[char];
            charArray = this._shuffle(charArray); // shuffle

            charArray.forEach((item) => {
                const index = itemIndex*size + charIndex;
                order[index] = {
                    char,
                    clip: item
                };
                itemIndex++;
            })

            itemIndex = 0;
            charIndex++;
        }

        return order.filter((item) => { // remove empty
            return item != null;
        });
    }

    _shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    _videoStatusChangeHandler = (value) => {

        switch (appStore.get('videoStatus')) {
            case CONVERSATION_INIT:
                this._statementsIndex = 0;
                this._statementsOrder = this._generateStatementsOrder();

                this._chars.forEach((char) => {
                    appStore.setState(char, {
                        type: 'idle',
                        clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                    })
                });
                this._pauseVideos();
                break;
            case CONVERSATION_NEW_ROUND:
                this._statementsIndex = this._statementsIndex + 1;
                this._statementsIndex = this._statementsIndex % this._statementsOrder.length;
                break;
            case CONVERSATION_INTRO:
                this._chars.forEach((char) => {
                    // if (char === 'andrew') {
                    //     appStore.setState(char, {
                    //         type: 'statement',
                    //         clip: conversationStatements['andrew'][this._rand(conversationStatements['andrew'].length)]
                    //     });
                    // }
                    // else {
                    //     appStore.setState(char, {
                    //         type: 'idle',
                    //         clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                    //     });
                    // }
                    if (char === 'ava') {
                        appStore.setState(char, {
                            type: 'intro',
                            clip: conversationIntro['ava'][this._rand(conversationIntro['ava'].length)]
                        })
                    }
                    else {
                        appStore.setState(char, {
                            type: 'idle',
                            clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                        })
                    }
                });
                this._updateVideos();
                break;
            case CONVERSATION_SLEEPY:
                this._chars.forEach((char) => {
                    if (char === 'andrew') {
                        appStore.setState(char, {
                            type: 'statement',
                            clip: conversationStatements['andrew'][this._rand(conversationStatements['andrew'].length)]
                        });
                    }
                    else {
                        appStore.setState(char, {
                            type: 'idle',
                            clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                        });
                    }
                });
                this._updateVideos();
                break;
            case CONVERSATION_STATEMENT:
                this._chars.forEach((char) => {
                    if (char === 'andrew') {
                        appStore.setState(char, {
                            type: 'statement',
                            clip: conversationStatements['andrew'][this._rand(conversationStatements['andrew'].length)]
                        });
                    }
                    else {
                        appStore.setState(char, {
                            type: 'idle',
                            clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                        });
                    }

                    // const statement = this._statementsOrder[this._statementsIndex];
                    // if (char === statement.char) {
                    //     appStore.setState(char, {
                    //         type: 'statement',
                    //         clip: statement.clip
                    //     })
                    // }
                    // else {
                    //     appStore.setState(char, {
                    //         type: 'idle',
                    //         clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                    //     })
                    // }
                });
                this._updateVideos();
                break;
            case CONVERSATION_AGREEMENTS:
                this._chars.forEach((char) => {
                    // if (char === 'andrew') {
                    //     appStore.setState(char, {
                    //         type: 'statement',
                    //         clip: conversationStatements['andrew'][this._rand(conversationStatements['andrew'].length)]
                    //     });
                    // }
                    // else {
                    //     appStore.setState(char, {
                    //         type: 'idle',
                    //         clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                    //     });
                    // }
                    const statement = this._statementsOrder[this._statementsIndex];
                    if (char === statement.char || char === 'andrew') { // TODO fix me
                        appStore.setState(char, {
                            type: 'idle',
                            clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                        })
                    }
                    else {
                        appStore.setState(char, {
                            type: 'agreement',
                            clip: conversationAgreements[char][this._rand(conversationAgreements[char].length)]
                        })
                    }
                });
                this._updateVideos();
                break;
            case CONVERSATION_RESPONSE:
                if (char === 'andrew') {
                    appStore.setState(char, {
                        type: 'statement',
                        clip: conversationStatements['andrew'][this._rand(conversationStatements['andrew'].length)]
                    });
                }
                else {
                    appStore.setState(char, {
                        type: 'idle',
                        clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                    });
                }    
                // this._chars.forEach((char) => {
                //     appStore.setState(char, {
                //         type: 'idle',
                //         clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                //     })
                // });
                this._updateVideos();
                break;
            case CONVERSATION_RESPONSE_FEEDBACK:
                this._chars.forEach((char) => {
                    if (char === 'andrew') {
                        appStore.setState(char, {
                            type: 'redeem',
                            clip: conversationRedeem['andrew'][this._rand(conversationRedeem['andrew'].length)]
                        })
                    }
                    else {
                        appStore.setState(char, {
                            type: 'idle',
                            clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                        })
                    }
                });
                this._updateVideos();
                break;
            case CONVERSATION_REDEEM_CHALLENGE:
                this._chars.forEach((char) => {
                    appStore.setState(char, {
                        type: 'idle',
                        clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                    })
                });
                this._updateVideos();
                break;
            case CONVERSATION_REDEEM:
                this._chars.forEach((char) => {
                    appStore.setState(char, {
                        type: 'idle',
                        clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                    })
                });
                this._updateVideos();
                break;
            case CONVERSATION_FORGIVENESS:
                this._chars.forEach((char) => {
                    if (char === 'ava') {
                        appStore.setState(char, {
                            type: 'forgiveness',
                            clip: conversationForgiveness['ava'][this._rand(conversationForgiveness['ava'].length)]
                        })
                    }
                    else {
                        appStore.setState(char, {
                            type: 'idle',
                            clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                        })
                    }
                });
                this._updateVideos();
                break;
            case CONVERSATION_KICKOUT:
                this._chars.forEach((char) => {
                    if (char === 'ava') {
                        appStore.setState(char, {
                            type: 'kickout',
                            clip: conversationKickout['ava'][this._rand(conversationKickout['ava'].length)]
                        })
                    }
                    else {
                        appStore.setState(char, {
                            type: 'idle',
                            clip: conversationIdle[char][this._rand(conversationIdle[char].length)]
                        })
                    }
                });
                this._updateVideos();
                break;
            case CONVERSATION_WIN:
                this._pauseVideos();
                break;
            case CONVERSATION_END:
                this._pauseVideos();
                break;
        }        
    }

    _checkVideoDuration() {
        const chars = ['ava', 'andrew', 'paul'];
        for (let i=0, len=chars.length; i<len; i++) {
            const char = chars[i];
            const video = this._videos[char].video;
            const clip = this._videos[char].clip;
            const type = this._videos[char].type;
            if (!video || !clip) {
                return;
            }
            // console.log(duration);
            if (video.currentTime > clip.start/FPS + (clip.duration-1)/FPS) {
                if (type === 'idle') {
                    // update clip
                    this._videos[char].clip = conversationIdle[char][this._rand(conversationIdle[char].length)];
                    this._seekVideo(video, this._videos[char].clip.start/FPS);
                    this._playVideo(video);
                }
                else if (type === 'statement') {
                    // update clip
                    this._videos[char].clip = conversationStatements[char][this._rand(conversationStatements[char].length)];
                    this._seekVideo(video, this._videos[char].clip.start/FPS);
                    this._playVideo(video);
                }
                else {
                    this._pauseVideo(video);
                }
            }
        }
    }

    _checkEyes() {
        let clipBeforeEnd = false;
        const chars = ['ava', 'andrew', 'paul'];
        for (let i=0, len=chars.length; i<len; i++) {
            const char = chars[i];
            const video = this._videos[char].video;
            const clip = this._videos[char].clip;
            if (!video || !clip ) {
                return;
            }
            if (video.currentTime < (clip.start+1)/FPS || video.currentTime > clip.start/FPS + (clip.duration-1)/FPS) {
                clipBeforeEnd = true;
            }
        }

        if (this._previousClipBeforeEnd !== clipBeforeEnd) {
            this._previousClipBeforeEnd = clipBeforeEnd;
            this.dispatchEvent('clipBeforeEnd', clipBeforeEnd);
        }
    }

    _tick = () => {
        this._checkEyes();
        this._checkVideoDuration();
    }
}

export const gameVideos = new GameVideos();