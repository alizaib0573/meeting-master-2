import gsap from 'gsap';
import React, { PureComponent, Fragment } from 'react';
import { appStore, STATUS_PLAYING, INTERACTION_HERO_INIT, INTERACTION_HERO, INTERACTION_HERO_END } from 'stores/AppStore';
import { appActions } from 'stores/AppActions';
import { getAsset } from 'utils/AssetLoader';

import HeroIcon from './HeroIcon';

const HEIGHT = 70;
const SPEED = 3;
const LINES = 3;
const MAX_MISSES = 5;

export default class Hero extends PureComponent {
    constructor(props) {
        super(props);

        this.ui = {
            instructions: React.createRef
        };

        this._initGame(true);
    }
    
    componentDidMount() {
        this._setupEventListeners();
    }

    componentWillUnmount() {
        this._removeEventListeners();
    }

    _initGame(firstTime) {
        if (firstTime) {
            this.state = {
                misses: 0,
                hits: [],
                lines: [],
                visible: false
            };
        }
        else {
            this.setState({
                misses: 0,
                hits: [],
                lines: [],
                visible: false
            });
        }
        
        this._tweenObj = {
            current: -LINES
        };
    }

    render() {
        const { visible, lines, misses } = this.state;
        if(!visible) return null;

        return (
            <div className="hero">
                <div className="hero__line"></div>
                <div className="hero__dashboard">
                    Misses: {misses} / {MAX_MISSES}
                </div>

                { lines && lines.map(({index, offset}) => {
                    if (index < 0) return null;

                    const y = offset * -1;
                    const style = {
                        position: 'absolute',
                        transform: `translateY(${y}px)`
                    };
                    const line = this._level[index];

                    const leftActive = line[0] ? true : false;
                    const upActive = line[1] ? true : false;
                    const rightActive = line[2] ? true : false;

                    return (
                        <div key={index} style={style}>
                            { leftActive && <HeroIcon key={`${index}-left`} type="left" isHit={this._isHit(`${index}-left`)} onMiss={this._doMiss} /> }
                            { upActive && <HeroIcon key={`${index}-up`} type="up" isHit={this._isHit(`${index}-up`)} onMiss={this._doMiss} /> }
                            { rightActive && <HeroIcon key={`${index}-right`} type="right" isHit={this._isHit(`${index}-right`)} onMiss={this._doMiss} /> }
                        </div>
                    )
                })}                
            </div>
        )
    }

    _doMiss = () => {
        let { misses } = this.state;
        misses++;

        getAsset('brownie-points-negative').play();

        if (misses >= MAX_MISSES) {
            appStore.setState('interactionStatus', INTERACTION_HERO_END);
            return;
        }
        this.setState({ misses });
    }

    _isHit(key) {
        const { hits } = this.state;
        return (hits.indexOf(key) > -1);
    }

    _setupEventListeners() {
        // precautions
        this._removeEventListeners();

        gsap.ticker.add(this._tick);
        window.addEventListener('keydown', this._keyDownHandler);
        appStore.addEventListener('change:interactionStatus', this._changeHandler);
    }

    _removeEventListeners() {
        gsap.ticker.remove(this._tick);
        window.removeEventListener('keydown', this._keyDownHandler);
        appStore.removeEventListener('change:interactionStatus', this._changeHandler);
    }

    _reset() {
        this._initGame();
        this._generateLevel();
    }

    _tick = (time, deltaTime) => {
        if (appStore.get('status') === STATUS_PLAYING && appStore.get('interactionStatus') === INTERACTION_HERO) {
            this._tweenObj.current += (deltaTime/1000) * SPEED;
            
            const index = Math.floor((this._tweenObj.current));
            const y = this._tweenObj.current;
            const floor = y - Math.floor(y);

            const lines = [];
            for (let i=0; i<LINES; i++) {
                lines.push({
                    index: index + i,
                    offset: (HEIGHT * floor) - (HEIGHT * i) + (HEIGHT * LINES)
                });
            }

            this.setState({lines});
        }
    }

    _generateLevel() {
        this._level = [];

        const easy = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        const medium = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [0, 1, 1], [1, 0, 1]];

        for (let i=0; i<1000; i++) {
            if (i<=60) {
                if (i % 3 === 0) {
                    this._level.push(this._random(easy));
                }
                else {
                    this._level.push([0, 0, 0]);
                }
            }
            else if(i>60 && i<=100) {
                if (i % 2 === 0) {
                    this._level.push(this._random(easy));
                }
                else {
                    this._level.push([0, 0, 0]);
                }
            }
            else if(i>100 && i<150) {
                this._level.push(this._random(easy));
            }
            else {
                this._level.push(this._random(medium));
            }
        }
    }

    _random(array) {
        return array[Math.floor(Math.random()*array.length)];
    }

    _shoot(location, arrow) {
        if (!this._level) return;

        const { lines, hits } = this.state;
        
        let line;
        let hit = false;
        for (let i=0, len=lines.length; i<len; i++) {
            const { index, offset } = lines[i];
            line = this._level[index];
            if (!line) break; // you pressed too soon

            const key = `${index}-${arrow}`;
            if (line[location] && hits.indexOf(key) <= -1) {
                hit = true;
                hits.push(key);
                this.setState({ hits });

                appActions.addPoints(1);

                break;
            }
        }

        if (!hit) {
            this._doMiss();
        }
    }

    _keyDownHandler = (e) => {
        if (appStore.get('interactionStatus') !== INTERACTION_HERO) return;

        if(e.keyCode === 37) { // left
            this._shoot(0, 'left'); //index
        }
        else if (e.keyCode === 38){ // up
            this._shoot(1, 'up'); //index
        }
        else if (e.keyCode === 39){ // right
            this._shoot(2, 'right'); //index
        }
    }

    _changeHandler = (value) => {
        if (value === INTERACTION_HERO_INIT) {
            this._reset();
        }
        
        if (value === INTERACTION_HERO_END) {
            this._reset();
        }

        const visible = (value === INTERACTION_HERO_INIT || value === INTERACTION_HERO) ? true : false;
        if (this.state.visible !== visible) {
            this.setState({ visible });
        }
    }
}