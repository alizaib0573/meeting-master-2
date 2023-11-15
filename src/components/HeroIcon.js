import gsap from 'gsap';
import React, { Component, Fragment } from 'react';

export default class HeroIson extends Component {
    constructor(props) {
        super(props);

        this.el = React.createRef();
    }

    componentDidMount() {
        gsap.fromTo(this.el.current, { scale: 0 }, { duration: 0.4, scale: 1, ease: 'back.out' });
    }

    componentWillUnmount() {
        const { isHit, onMiss } = this.props;
        if (!isHit) {
            onMiss && onMiss();
        }
    }

    render() {
        const { type, isHit } = this.props;

        let className = `hero-icon hero-icon--${type}`;
        if (isHit) className += ' hero-icon--hit';

        return (
            <span className={className} ref={this.el}>
                {type}      
            </span>
        )
    }
}