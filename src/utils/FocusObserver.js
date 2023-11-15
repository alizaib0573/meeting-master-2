import EventDispatcher from 'utils/EventDispatcher';

export default class FocusObserver extends EventDispatcher {
    constructor(props) {
        super(props);

        this._focus = true;
        this._setupEventListeners();
    }

    isFocussed() {
        return this._focus;
    }

    _setupEventListeners() {
        window.addEventListener('focus', this._focusHandler);
        window.addEventListener('blur', this._blurHandler);

        if ('hidden' in document) {
            document.addEventListener('visibilitychange', this._changeHandler);
        }
        else if ('webkitHidden' in document) {
            document.addEventListener('webkitisibilitychange', this._changeHandler);
        }
    }

    _focusHandler = () => {
        this._updateFocusState(true);
    }

    _blurHandler = () => {
        this._updateFocusState(false);
    }

    _changeHandler = () => {
        this._updateFocusState(!document.hidden);
    }

    _updateFocusState(bool) {
        this._focus = bool;
        this.dispatchEvent('update', this._focus);
    }
};