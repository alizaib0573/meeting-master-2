import React, { Component } from 'react';

import { gameMain } from 'modules/game/GameMain';

export default class GameCanvas extends Component {
    constructor(props) {
        super(props);
        
        this.ui = {
            canvasWrapper: React.createRef()
        }
    }

    componentDidMount() {
        gameMain.mount({
            container: this.ui.canvasWrapper.current
        });
    }

    render() {
        return (
            <div className="game-canvas" ref={this.ui.canvasWrapper}></div>
        )
    }

}