import gsap from 'gsap';
import React, { Component } from 'react';

import { appStore } from 'stores/AppStore';

class CountdownClock extends Component {
    constructor(props) {
        super(props);

        this.ui = {
            number: React.createRef(),
            canvas: React.createRef()
        };

        this._tweenObj = {
            seconds: this.props.duration
        };
    }

    componentDidMount() {
        const { duration } = this.props;

        this._ctx = this.ui.canvas.current.getContext('2d');
        this._ctx.fillStyle = 'black';
        this._ctx.lineWidth = 4;
        this._drawCanvas();

        this._tween = gsap.to(this._tweenObj, { duration, seconds: 0, ease: 'none', onUpdate: () => {
            this.ui.number.current.textContent = Math.ceil(this._tweenObj.seconds);
            this._drawCanvas();
        },
        onComplete: ()=> {
            if(this.props.onEnd) this.props.onEnd();
        } });
    }


    componentWillUnmount() {
        this.ui.number.current.textContent = 0;

        if (this._tween) {
            this._tween.kill();
            this._tween = null;
        }
    }

    render() {
        const {fRef} = this.props;

        let className = 'countdown-clock';
        if (this.props.className) className += ` ${this.props.className}`;

        return (
            <div ref={fRef} className={className}>
                <canvas ref={ this.ui.canvas } className="countdown-clock__canvas" width="100" height="100"></canvas>
                <div ref={ this.ui.number } className="countdown-clock__number"></div>
            </div>
        )
    }

    _drawCanvas() {
        this._ctx.clearRect(0, 0, 100, 100);

        const progress = (this._tween) ? this._tween.progress() : 1;
        const start = -Math.PI*0.5;
        const end = start + Math.PI*2*(1-progress);

        this._ctx.beginPath();
        this._ctx.arc(50, 50, 48, 0, 2*Math.PI, false);
        this._ctx.fill();
        this._ctx.strokeStyle = 'gray';
        this._ctx.stroke();

        this._ctx.beginPath();
        this._ctx.arc(50, 50, 48, start, end, false);
        this._ctx.strokeStyle = 'white';
        this._ctx.stroke();
    }
}

export default React.forwardRef((props, ref) => <CountdownClock {...props} fRef={ref} />)