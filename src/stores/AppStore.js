import EventDispatcher from 'utils/EventDispatcher';

export const STATUS_INIT = 'init';
export const STATUS_PLAYING = 'playing';
export const STATUS_PAUSED = 'paused';
export const STATUS_END_WIN = 'win';
export const STATUS_END_LOSE = 'lose';

export const HAS_FOCUS = 'focus';
export const HAS_NO_FOCUS = 'no-focus';

export const NUM_ROUNDS = 10;

export const FAILURE_TIME = 2;
export const FAILURE_SPEED = 0.5;

export const CONVERSATION_INIT = 'init';
export const CONVERSATION_NEW_ROUND = 'new round';
export const CONVERSATION_INTRO = 'intro';
export const CONVERSATION_SLEEPY = 'sleepy';
export const CONVERSATION_STATEMENT = 'statement';
export const CONVERSATION_AGREEMENTS = 'agreements';
export const CONVERSATION_RESPONSE = 'response';
export const CONVERSATION_RESPONSE_FEEDBACK = 'response-feedback';
export const CONVERSATION_REDEEM_CHALLENGE = 'redeem-challenge';
export const CONVERSATION_REDEEM = 'redeem';
export const CONVERSATION_FORGIVENESS = 'forgiveness';
export const CONVERSATION_KICKOUT = 'kickout';
export const CONVERSATION_WIN = 'win';
export const CONVERSATION_END = 'end';

export const INTERACTION_INIT = 'init';
export const INTERACTION_NEW_ROUND = 'new-round';
export const INTERACTION_AWAKE_INIT = 'awake-init';
export const INTERACTION_AWAKE_INTRO = 'awake-intro';
export const INTERACTION_AWAKE_GAME = 'awake-game';
export const INTERACTION_AWAKE_OUTRO = 'awake-outro';
export const INTERACTION_AWAKE_END = 'awake-end';
export const INTERACTION_HERO_INIT = 'hero-init';
export const INTERACTION_HERO = 'hero';
export const INTERACTION_HERO_END = 'hero-end';
export const INTERACTION_SLEEPY_INIT = 'sleepy-init';
export const INTERACTION_SLEEPY = 'sleepy';
export const INTERACTION_SLEEPY_END = 'sleepy-end';
export const INTERACTION_RESPONSE = 'responce';
export const INTERACTION_RESPONSE_END = 'response-end';
export const INTERACTION_END = 'end';

export const PLAYER_RESPONSE_CORRECT = 'correct';
export const PLAYER_RESPONSE_WRONG = 'wrong';
export const PLAYER_RESPONSE_TYPE_APPEASE = 'appease';
export const PLAYER_RESPONSE_TYPE_DISENGAGE = 'disengage';
export const PLAYER_RESPONSE_TYPE_YAWN = 'yawn';

export const PLAYER_REDEEM_CORRECT = 'correct';
export const PLAYER_REDEEM_WRONG = 'wrong';

export const SLEEPY_FAILED_INIT = 'init';
export const SLEEPY_FAILED_YES = 'yes';
export const SLEEPY_FAILED_NO = 'no';

export const INSTRUCTIONS_AWAKE_INTRO_HIDDEN = 'hidden';
export const INSTRUCTIONS_AWAKE_INTRO_VISIBLE = 'visible';

export const INSTRUCTIONS_AWAKE_GAME_HIDDEN = 'hidden';
export const INSTRUCTIONS_AWAKE_GAME_VISIBLE = 'visible';

export const INSTRUCTIONS_RESPONSE_HIDDEN = 'hidden';
export const INSTRUCTIONS_RESPONSE_VISIBLE = 'visible';

export const SLEEPY_COUNTER_HIDDEN = 'hidden';
export const SLEEPY_COUNTER_VISIBLE = 'visible';

export const CHALLENGE_RESPONSE_HIDDEN = 'hidden';
export const CHALLENGE_RESPONSE_VISIBLE = 'visible';

export const INSTRUCTIONS_TAP_HIDDEN = 'hidden';
export const INSTRUCTIONS_TAP_VISIBLE = 'visible';

export const INSTRUCTIONS_REDEEM_HIDDEN = 'hidden';
export const INSTRUCTIONS_REDEEM_VISIBLE = 'visible';

export const CHALLENGE_REDEEM_HIDDEN = 'hidden';
export const CHALLENGE_REDEEM_VISIBLE = 'visible';

export const COPY_PULL_UP_HIDDEN = 'hidden';
export const COPY_PULL_UP_VISIBLE = 'visible';

export const COPY_STAY_WITH_US_HIDDEN = 'hidden';
export const COPY_STAY_WITH_US_VISIBLE = 'visible';

class AppStore extends EventDispatcher {
    constructor() {
        super();

        this.state = {
            // game state

            status: STATUS_INIT,
            currentTime: 0,
            deltaTime: 0,
            maxTime: 120,
            points: 0,

            focus: HAS_FOCUS,

            rounds: 0,

            speed: 1,

            sleepy: 0,
            sleepyHits: 0,
            sleepyThreshold: 10,
            sleepyHitsTotal: 0,
            sleepyThresholdTotal: 42,

            sleepyFailed: SLEEPY_FAILED_INIT,
            sleepyCounter: SLEEPY_COUNTER_HIDDEN,
            sleepProgress: 0,
            sleepProgressContra: 0,

            interactionStatus: INTERACTION_INIT,

            conversationStatus: CONVERSATION_INIT,
            conversationPlayIntro: true,
            conversationIntroDurationLeft: 0,
            conversationStatementDurationLeft: 0,
            conversationAgreementsDurationLeft: 0,
            conversationResponseDurationLeft: 0,
            conversationResponseFeedbackDurationLeft: 0,
            conversationRedeemChallengeDurationLeft: 0,
            conversationRedeemDurationLeft: 0,
            conversationForgivenessDurationLeft: 0,
            conversationKickoutDurationLeft: 0,

            videoStatus: CONVERSATION_INIT,

            playerResponse: PLAYER_RESPONSE_WRONG,
            playerResponseType: PLAYER_RESPONSE_TYPE_DISENGAGE,
            playerRedeem: PLAYER_REDEEM_WRONG,
            
            challengeResponse: CHALLENGE_RESPONSE_HIDDEN,
            challengeRedeem: CHALLENGE_REDEEM_HIDDEN,

            instructionsResponse: INSTRUCTIONS_RESPONSE_HIDDEN,
            instructionsRedeem: INSTRUCTIONS_REDEEM_HIDDEN,
            instructionsTap: INSTRUCTIONS_TAP_HIDDEN,

            copyPullUp: COPY_PULL_UP_HIDDEN,
            copyStayWithUs: COPY_STAY_WITH_US_HIDDEN,

            // TODO: Randomize redeem flow
            redeemFlow: null,
            redeemAnswer: [null, null, null, null, null],

            // character state

            ava: null,
            paul: null,
            andrew: null,
            // rebecca: null,


            sclera: 1,
            pixelation: 0,
            saturation: 0,


            // awake

            awakeRotationX: 0,
            awakeRotationY: 35,
            awakeRotationZ: 0,

            awakeTargetScreenPosition: null,
            awakeIndicatorScreenPosition: null,
            awakeIndicatorsDistance: null,

            awake: 0.9,
            awakeBlur: 0.7,

            instructionsAwakeIntro: INSTRUCTIONS_AWAKE_INTRO_HIDDEN,
            instructionsAwakeGame: INSTRUCTIONS_AWAKE_GAME_HIDDEN,

            // scene debugger

            cameraPositionX: 0,
            cameraPositionY: 1.27,
            cameraPositionZ: 1.72,

            cameraRotationX: 0,
            cameraRotationY: 0,
            cameraRotationZ: 0,


            glassEmissive: '#5F6059',
            glassTransparency: 0.15,

            character01Scale: 0.95,
            character01PositionX: -0.06,
            character01PositionY: 0.97,
            character01PositionZ: -0.33,

            character02Scale: 0.89,
            character02PositionX: 0.91,
            character02PositionY: 1.21,
            character02PositionZ: -1.2,

            character03Scale: 1.06,
            character03PositionX: 0.02,
            character03PositionY: 0.92,
            character03PositionZ: -0.41,

            character04Scale: 0.62,
            character04PositionX: 0.08,
            character04PositionY: 1.04,
            character04PositionZ: 0.64,

            armsYawnScale: 0.69,
            armsYawnPositionX: 0,
            armsYawnPositionY: 0,
            armsYawnPositionZ: -1.32,

            armsSodaScale: 0.69,
            armsSodaPositionX: 0,
            armsSodaPositionY: 0,
            armsSodaPositionZ: -1.32,

            rightArmScale: 140,
            rightArmPositionX: 0.13,
            rightArmPositionY: 0.79,
            rightArmPositionZ: 1.01,
            rightArmRotationX: 0,
            rightArmRotationY: 3.61,
            rightArmRotationZ: 0,

            leftArmScale: 140,
            leftArmPositionX: -0.17,
            leftArmPositionY: 0.78,
            leftArmPositionZ: 1.01,
            leftArmRotationX: 0.01,
            leftArmRotationY: 2.7,
            leftArmRotationZ: 3.14,
        }

        this._initialStateAppStore = Object.assign({}, this.state);
    }

    setInitialState() {
        for(let key in this._initialStateAppStore) {
            this.setState(key, this._initialStateAppStore[key]);
        }
    }

    setState(key, value) {
        const previousState = this.state[key];
        if (previousState !== value) {
            this.state[key] = value;
            this.dispatchEvent(`change:${key}`, value);
        }
    }

    get(key) {
        return this.state[key];
    }
}

export const appStore = new AppStore();

