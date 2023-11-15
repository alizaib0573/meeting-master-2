import React, { Component, Fragment } from 'react';

import { appActions } from 'stores/AppActions';

import { facebook } from 'utils/Facebook';
import { linkedin } from 'utils/Linkedin';

import Failure from './modals/Failure';
import Success from './modals/Success';

import {
    appStore,

    STATUS_END_WIN,
    STATUS_END_LOSE,
} from 'stores/AppStore';

export default class EndScreen extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {
        return (
            <div className="end-screen">
                <div className="end-screen__content">
                    {appStore.get('status') === STATUS_END_LOSE &&
                        <Failure
                            tryAgain={this._tryAgainHandler}
                            shareLinkedIn={this._shareLIHandler}
                            shareFacebook={this._shareFBHandler}
                        />
                    }
                    {appStore.get('status') === STATUS_END_WIN &&
                        <Success
                            tryAgain={this._tryAgainHandler}
                            shareLinkedIn={this._shareLIHandler}
                            shareFacebook={this._shareFBHandler}
                        />
                    }
                </div>
            </div>
        )
    }

    _tryAgainHandler = () => {
        appActions.doInit();
        appActions.doPlay();
    }

    _shareLIHandler = () => {
        const url = 'https://mundane-media.now.sh';
        const title = 'Meeting Master';
        const description = 'Meeting Master Description';
        linkedin.share(url, title, description);
    }

    _shareFBHandler = () => {
        const url = 'https://mundane-media.now.sh';
        facebook.share(url);
    }

}