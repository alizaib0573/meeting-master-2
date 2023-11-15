import '../styles/main.scss';

import gsap from 'gsap';
import CustomEase from 'utils/CustomEase';
import App from 'next/app';

if (process.browser) {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("custom", "M0,0 C0.15,0.036 0.284,0.298 0.358,0.39 0.391,0.431 0.499,0.499 0.552,0.558 0.65,0.666 0.673,0.751 0.748,0.808 0.814,0.858 0.914,1 1,1 ");
    
    CustomEase.create("sleep1", "M0,0,C0.115,0,0.204,0.081,0.286,0.179,0.396,0.311,0.482,0.472,0.496,0.496,0.54,0.572,0.654,0.726,0.758,0.844,0.835,0.932,0.89,1,1,1 ");
    CustomEase.create("sleep2", "M0,0 C0.119,0 0.173,0.082 0.256,0.184 0.362,0.314 0.482,0.472 0.496,0.496 0.525,0.546 0.624,0.67 0.68,0.756 0.723,0.822 0.772,0.83 0.834,0.88 0.902,0.935 0.916,1 1,1 ");
    CustomEase.create("sleep3", "M0,0 C0.272,0 0.382,0.408 0.494,0.556 0.604,0.701 0.744,1 1,1 ");
}

export default class MyApp extends App {
    render() {
        const { Component, pageProps } = this.props;
        return (
            <Component {...pageProps} />
        )
    }
}