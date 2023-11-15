class DelayedCall {
    constructor(duration, callback) {
        this._delayedCallDuration = duration;
        this._delayedCallCallback = callback;
    }

    update(deltaTime) {
        if (this._killed) return;

        if (!this._delayedCallDuration) return;
        this._delayedCallDuration = Math.max(this._delayedCallDuration - deltaTime);
        if(this._delayedCallDuration <= 0) {
            return true;
        }
        return false;
    }

    trigger() {
        if (this._killed) return;

        this._delayedCallCallback && this._delayedCallCallback();
        this._delayedCallCallback = null;
    }

    kill() {
        this._killed = true;
    }

    isKilled() {
        return this._killed;
    }
}

export default class DelayedCalls {
    constructor() {
        this._list = [];
    }

    create(duration, callback) {
        const delayedCall = new DelayedCall(duration, callback);
        this._list.push(delayedCall);

        return delayedCall;
    }

    update(deltaTime) {
        for (let i=this._list.length-1; i >= 0; i--) {
            const isKilled = this._list[i].isKilled();
            if (isKilled) {
                this._list.splice(i, 1);
            }
        }

        for (let i=this._list.length-1; i >= 0; i--) {
            const triggerCallback = this._list[i].update(deltaTime);
            if (triggerCallback) {
                this._list[i].trigger();
                this._list.splice(i, 1);
            }
        }
    }

    removeAll() {
        this._list = [];
    }
}