import gsap from 'gsap';
import React, { Component } from 'react';
import { appStore, COPY_STAY_WITH_US_HIDDEN, COPY_STAY_WITH_US_VISIBLE } from 'stores/AppStore';

export default class CopyStayWithUs extends Component {
    constructor(props) {
        super(props);

        this.el = React.createRef();
    }

    componentDidMount() {
        this._setupEventListeners();
    }
    
    componentWillUnmount() {
        this._killTweens();
        this._removeEventListeners();
    }

    render() {
        return (
            <div ref={this.el} className="copy-stay-with-us">
                <span className="copy-stay-with-us__icon"></span>
                <span className="copy-stay-with-us__copy">Stay with us</span>
            </div>
        )
    }

    _setupEventListeners() {
        appStore.addEventListener('change:copyStayWithUs', this._changeHandler);
    }

    _removeEventListeners() {
        appStore.removeEventListener('change:copyStayWithUs', this._changeHandler);
    }

    _changeHandler = () => {
        if (appStore.get('copyStayWithUs') === COPY_STAY_WITH_US_VISIBLE) {
            this._show();
        }
        else {
            this._hide();
        }
    }

    _killTweens() {
        if (this._tweenShow) {
            this._tweenShow.kill();
            this._tweenShow = null;
        }

        if (this._tweenHide) {
            this._tweenHide.kill();
            this._tweenHide = null;
        }
    }

    _show() {
        this._killTweens();
        this._tweenShow = gsap.to(this.el.current, { duration: 0.1, alpha: 1, ease: 'none', yoyo: true, repeat: -1 });
    }

    _hide() {
        this._killTweens();
        this._tweenHide = gsap.to(this.el.current, { duration: 0.15, alpha: 0, ease: 'none' });
    }
}