import Head from 'next/head';

import { gTag } from 'utils/GTag';

import React, { Component, Fragment } from 'react';

import { loadManifest, getAsset } from 'utils/AssetLoader';

import Intro from 'components/Intro';
import Game from 'components/Game';
import EndScreen from 'components/EndScreen';

import { appActions } from 'stores/AppActions';
import { gameMain } from 'modules/game/GameMain';

export default class Home extends Component {
    // static async getInitialProps(ctx) {
    //     if (ctx.res) {
    //         const auth = require('basic-auth');

    //         const origin = process.env.ORIGIN;
    //         const password = process.env.PASSWORD;
    //         const username = process.env.USERNAME;

    //         const isAuthed = function (credentials, username, password) {
    //             return credentials.name === username && credentials.pass === password;
    //         }

    //         const credentials = auth(ctx.req);
    //         if (!credentials || !isAuthed(credentials, username, password)) {
    //             ctx.res.statusCode = 401;
    //             ctx.res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    //             ctx.res.end('Access denied.');
    //         }
    //         else {
    //             return { access: 'granted' }
    //         }
    //     }
    // }

    constructor(props) {
        super(props);

        let ua = null;
        if (process.browser && window.location.host.indexOf('localhost') <= -1) {
            ua = 'UA-168745084-1';
        }

        this.state = {
            status: 'init',
            ua,
            progress: 0
        };

        gTag.setUA(ua);
    }

    render() {
        const { status, ua } = this.state;

        return (
            <Fragment>
                <Head>
                    <title>Meeting Master</title>

                    <meta property="og:locale" content="en_US" />
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="I survived another work meeting!" />
                    <meta property="og:url" content="https://mundane-media.now.sh/" />
                    <meta property="og:site_name" content="Meeting Master" />
                    <meta property="og:description" content="Meeting Master" />

                    <meta property="og:image" content="https://mundane-media.now.sh/assets/share/share-image.jpg" />
                    <meta property="og:image:secure_url" content="https://mundane-media.now.sh/assets/share/share-image.jpg" />
                    <meta property="og:image:type" content="image/jpg" />
                    <meta property="og:image:width" content="1280" />
                    <meta property="og:image:height" content="720" />

                    <meta property="og:video" content="https://mundane-media.now.sh/assets/share/share-video.mp4" />
                    <meta property="og:video:secure_url" content="https://mundane-media.now.sh/assets/share/share-video.mp4" />
                    <meta property="og:video:type" content="video/mp4" />
                    <meta property="og:video:width" content="1280" />
                    <meta property="og:video:height" content="720" />

                    
                    <script async src={`https://www.googletagmanager.com/gtag/js?id=${ua}`}></script>
                    <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || []; function gtag(){ dataLayer.push(arguments); } gtag('js', new Date()); gtag('config', '${ua}', { 'anonymize_ip': true, 'send_page_view': false });` }}></script>
                </Head>

                { (status === 'init' || status === 'loaded' || status === 'error') && <Intro status={ status } progress={ this.state.progress } reloadGame={ this._reloadGame } startGame={ this._startGame } loadGame={this._loadGame}  /> }
                { (status === 'game' || status === 'game-end') && <Game setGlobalGameStatus={(value) => { this.setState({ status: value }) }} /> }
                { (status === 'game-end') && <EndScreen setGlobalGameStatus={(value) => { this.setState({ status: value }) }} /> }
            </Fragment>
        )
    }

    _startGame = () => {
        this.setState({ status: 'game' })
    }

    _reloadGame = () => {
        this._loadGame();
    }
    
    _supportsVideoType(type) {
        let video;
      
        // Allow user to create shortcuts, i.e. just "webm"
        let formats = {
            ogg: 'video/ogg; codecs="theora"',
            h264: 'video/mp4; codecs="avc1.42E01E"',
            webm: 'video/webm; codecs="vp8, vorbis"',
            vp9: 'video/webm; codecs="vp9"',
            hls: 'application/x-mpegURL; codecs="avc1.42E01E"'
        };
      
        if(!video) {
            video = document.createElement('video')
        }
      
        return video.canPlayType(formats[type] || type);
    }

    _loadGame = () => {
        const manifest = [
            { id: 'gltf-floor-ceiling', src: 'assets/gltf/floor-ceiling.glb', type: 'gltf' },
            { id: 'gltf-frames', src: 'assets/gltf/frames.glb', type: 'gltf' },
            { id: 'gltf-glass', src: 'assets/gltf/glass.glb', type: 'gltf' },
            { id: 'gltf-walls', src: 'assets/gltf/walls.glb', type: 'gltf' },
            { id: 'gltf-clock', src: 'assets/gltf/clock.glb', type: 'gltf' },
            { id: 'gltf-tv', src: 'assets/gltf/tv.glb', type: 'gltf' },
            { id: 'gltf-chair_02', src: 'assets/gltf/chair_02.glb', type: 'gltf' },
            { id: 'gltf-chair_03', src: 'assets/gltf/chair_03.glb', type: 'gltf' },
            { id: 'gltf-chair_04', src: 'assets/gltf/chair_04.glb', type: 'gltf' },
            { id: 'gltf-chair_05', src: 'assets/gltf/chair_05.glb', type: 'gltf' },
            { id: 'gltf-table', src: 'assets/gltf/table.glb', type: 'gltf' },
            { id: 'gltf-right-arm', src: 'assets/gltf/right-arm.glb', type: 'gltf' },

            { id: 'appease-0', src: 'assets/audio/player/response/correct/100-percent-were-on-the-same-page.mp3', type: 'howl' },
            { id: 'appease-1', src: 'assets/audio/player/response/correct/Oh-couldnt-have-said-it-better-myself.mp3', type: 'howl' },
            { id: 'appease-2', src: 'assets/audio/player/response/correct/Oh-thats-bang-on-the-money.mp3', type: 'howl' },
            { id: 'appease-3', src: 'assets/audio/player/response/correct/Yeah-great-point-great-point.mp3', type: 'howl' },
            { id: 'disengage-0', src: 'assets/audio/player/response/incorrect/This-is-getting-pretty-boring.mp3', type: 'howl' },
            { id: 'disengage-1', src: 'assets/audio/player/response/incorrect/Why-are-we-here-again.mp3', type: 'howl' },
            { id: 'disengage-2', src: 'assets/audio/player/response/incorrect/Yeah-yeah-yeah-whatever-mate.mp3', type: 'howl' },
            { id: 'yawn-0', src: 'assets/audio/player/response/incorrect/Yawn.mp3', type: 'howl' },
            
            { id: 'head-nodding', src: 'assets/img/head-nodding.png', type: 'image' },
            { id: 'logo', src: 'assets/img/logo-0.png', type: 'image' },
            
            { id: 'brownie-points', src: 'assets/audio/brownie-points.mp3', type: 'howl' },
            { id: 'brownie-points-negative', src: 'assets/audio/brownie-points-negative.mp3', type: 'howl' },
            // { id: 'monologue', src: 'assets/audio/monologue.mp3', type: 'howl' },
            { id: 'background', src: 'assets/audio/background.mp3', type: 'howl' },
            { id: 'join-meeting', src: 'assets/audio/join-meeting.mp3', type: 'howl' },
            { id: 'out-like-a-light', src: 'assets/audio/out-like-a-light.mp3', type: 'howl' },
            { id: 'body-language-strong', src: 'assets/audio/body-language-strong.mp3', type: 'howl' },

            // { id: 'video-rebecca', src: 'assets/videos/rebecca.mp4', type: 'video' },

            { id: 'smaa', type: 'smaa' }
        ];
        
        // if (this._supportsVideoType('webm') === 'probably') {
        //     manifest.push({ id: 'video-ava', src: 'assets/videos/ava.webm', type: 'video' });
        //     manifest.push({ id: 'video-paul', src: 'assets/videos/paul.webm', type: 'video' });
        //     manifest.push({ id: 'video-andrew', src: 'assets/videos/andrew.webm', type: 'video' });
        // }
        // else {
            manifest.push({ id: 'video-ava', src: 'assets/videos/ava.mp4', type: 'video' });
            manifest.push({ id: 'video-paul', src: 'assets/videos/paul.mp4', type: 'video' });
            manifest.push({ id: 'video-andrew', src: 'assets/videos/andrew.mp4', type: 'video' });
        // }

        manifest.push({ id: 'video-yawn', src: 'assets/videos/arms/yawn.mp4', type: 'video' });
        manifest.push({ id: 'video-soda', src: 'assets/videos/arms/soda.mp4', type: 'video' });

        // ADD AUDIO SPRITE SHEETS FOR REDEEM OPTIONS.
        // RedeemOptions.forEach(el => manifest.push(el.asset));

        loadManifest(manifest, {
            onProgress: (value) => {
                this.setState({
                    progress: value
                })
            }
        })
        .then(() => {
            appActions.create();
            gameMain.create();

            gTag.trackEvent({
                category: 'loader',
                action: 'success'
            });

            this.setState({
                status: 'loaded'
            });
        })
        .catch((e) => {
            console.log('fail', e);
            
            gTag.trackEvent({
                category: 'loader',
                action: 'error',
                label: JSON.stringify(e)
            });
            this.setState({
                status: 'error'
            })
        });
    }
}