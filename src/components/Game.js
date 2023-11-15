import React, { Component, Fragment } from 'react';

import { appActions } from 'stores/AppActions';

import GameCanvas from 'components/GameCanvas';
import Response from 'components/Response';
import Sleepy from 'components/Sleepy';
import ResponseInstructions from 'components/ResponseInstructions';
import TapInstructions from 'components/TapInstructions';
import LogoCanvas from 'components/LogoCanvas';
import CopyPullUp from 'components/CopyPullUp';
import CopyStayWithUs from 'components/CopyStayWithUs';
import PointsWrapper from 'components/PointsWrapper';
import Clock from 'components/Clock';
import Hero from 'components/Hero';
import Awake from 'components/Awake';
import AwakeGameInstructions from 'components/AwakeGameInstructions';
import AwakeIntroInstructions from 'components/AwakeIntroInstructions';
import HeadNodding from 'components/HeadNodding';

export default class Game extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        appActions.setGlobalGameStatusCallback(this.props.setGlobalGameStatus);
        appActions.doInit();
        appActions.doPlay();
    }

    componentDidUpdate() {
        
    }

    componentWillUnmount() {
        appActions.doInit();
        appActions.hideDebug();
    }

    render() {
        return (
            <div className="game">
                <GameCanvas />
                <HeadNodding />
                <Clock />
                <Awake />
                <AwakeIntroInstructions />
                <AwakeGameInstructions />
                <Hero />
                <Response />
                <Sleepy />
                <CopyPullUp />
                <CopyStayWithUs />
                <ResponseInstructions />
                <TapInstructions />
                {/* <LogoCanvas /> */}
                {/* <PointsWrapper /> */}
            </div>
        )
    }
}