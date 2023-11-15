import { getAsset } from 'utils/AssetLoader';

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
    CONVERSATION_STATEMENT,
    CONVERSATION_AGREEMENTS,
    CONVERSATION_RESPONSE,
    CONVERSATION_RESPONSE_FEEDBACK,
    CONVERSATION_REDEEM_CHALLENGE,
    CONVERSATION_REDEEM,
    CONVERSATION_FORGIVENESS,
    CONVERSATION_KICKOUT,
    CONVERSATION_END,
} from 'stores/AppStore';

class GameAudio {
    create() {
        this._setupEventListeners();
    }

    mute(bool) {
        if (bool) {
            console.log('mute');
        }
        else {
            console.log('unmute');
        }
    }

    play(id, spriteId = null) {
        if(getAsset(id)) {
            getAsset(id).play(spriteId);
        }
    }

    _setupEventListeners() {
        appStore.addEventListener('change:status', this._statusChangeHandler);
        appStore.addEventListener('change:conversationStatus', this._conversationStatusChangeHandler);
    }

    _statusChangeHandler = (value) => {
        if (appStore.get('status') === STATUS_INIT) {
            this._stopBackground();
            // this._stopMono();
        }

        if (appStore.get('status') === STATUS_PAUSED) {
            this._pauseBackground();
            // this._pauseMono();
        }

        if (appStore.get('status') === STATUS_PLAYING) {
            this._playBackground();
            // this._playMono();
        }

        if (appStore.get('status') === STATUS_END_WIN) {
            this._pauseBackground();
            // this._pauseMono();
        }

        if (appStore.get('status') === STATUS_END_LOSE) {
            this._pauseBackground();
            // this._pauseMono();
            this._playEndLose();
        }
        else {
            this._stopEndLose();
        }
    }

    _conversationStatusChangeHandler(value) {
        if (appStore.get('conversationStatus') === CONVERSATION_INTRO) {
            getAsset('join-meeting').play();
        }
    }

    _playBackground() {
        getAsset('background').pause();
        getAsset('background').loop(true);
        getAsset('background').play();
    }

    _pauseBackground() {
        getAsset('background').pause();
    }

    _stopBackground() {
        getAsset('background').stop();
    }

    // _playMono() {
    //     getAsset('monologue').pause();
    //     getAsset('monologue').loop(true);
    //     getAsset('monologue').play();
    // }

    // _pauseMono() {
    //     getAsset('monologue').pause();
    // }

    // _stopMono() {
    //     getAsset('monologue').stop();
    // }

    _playEndLose() {
        getAsset('out-like-a-light').play();
    }

    _stopEndLose() {
        getAsset('out-like-a-light').stop();
    }
}

export const gameAudio = new GameAudio();