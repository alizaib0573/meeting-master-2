import gsap from 'gsap';
import React, { Component } from 'react';

export default class Rounds extends Component {
    constructor(props) {
        super(props);

        this.el = React.createRef();
    }

    componentDidMount() {
        if (this.props.type === 'difference') {
            const start = this._calcStart();

            this._timeline = gsap.timeline({ onComplete: () => {
                if (this.props.removeElement) this.props.removeElement();
            }});
            this._timeline.from(this.el.current, { duration: 1, x: start.x, y: start.y, ease: 'power2.inOut' }, 0);
            this._timeline.from(this.el.current, { duration: 0.3, alpha: 0, ease: 'none' }, 0);
        }
    }

    componentWillUnmount() {
        if (this._timeline) {
            this._timeline.kill();
            this._timeline = null;
        }
    }

    render() {
        let { value, type } = this.props;

        let sign = (value > 0) ? '+' : '-';

        let className = 'points';
        className += ` ${type}`;
        className += (value > 0) ? ' positive' : ' negative';

        return (
            <div ref={this.el} className={className}>
                { (type === 'difference' || (type === 'static' && value < 0) ) && <span className="points__sign">{ sign }</span> }
                <span className="points__current">{ Math.abs(value) }</span>
                <span className="points__title">
                    <span className="points__title-line">Brownie</span>
                    <span className="points__title-line">points</span>
                </span>
            </div>
        )
    }

    _calcStart() {
        const bounds = this.el.current.getBoundingClientRect();
        const center = { x: window.innerWidth/2, y: window.innerHeight/2 };
        const coords = {
            x: center.x - (bounds.left || bounds.x),
            y: center.y - (bounds.top || bounds.y)
        } 
        return coords;
    }
}