const _isDebug = true;

export default class GTag {
    setUA(ua) {
        this._ua = ua;
    }
    
    trackPageView(path) {
        if (!this._ua) return;

        const gtag = window.gtag || false;
        if (gtag) {
            gtag('config', this._ua, { 'page_path': `/virtual/${path}` });
            this._log('Tracking - GoogleGtag - trackPageView -> path: ' + path);
        }
        else {
            this._log('Tracking - GoogleGtag - trackPageView -> GoogleGtag unavailable -> path: ' + path);
        }
    }

    trackEvent(data) {
        if (!this._ua) return;

        data.category = data.category || null;
        data.action = data.action || null;
        data.label = data.label || null;

        if (!data.category) {
            this._log('Tracking - GoogleAnalytics - trackEvent -> missing category');
            return;
        }

        const gtag = window.gtag || false;
        if (gtag) {
            gtag('event', data.action, {
                'event_category': data.category,
                'event_label': data.label,
                'value': 1
            });
            this._log(`Tracking - GoogleAnalytics - trackEvent -> ${JSON.stringify(data)}`);
        } else {
            this._log(`Tracking - GoogleAnalytics - trackEvent -> GoogleAnalytics unavailable -> ${JSON.stringify(data)}`);
        }
    }

    _log(data) {
        if (_isDebug) {
            console.log(data);
        }
    }
}

export const gTag = new GTag();