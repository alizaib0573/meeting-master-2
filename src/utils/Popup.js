export class Popup {
    open(url, title, w, h, leftCorrection = 0, topCorrection = 0) {
        const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
        const dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

        const width = window.outerWidth ? window.outerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.outerHeight ? window.outerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const left = Math.max(0, ((width / 2) - (w / 2)) + dualScreenLeft + leftCorrection);
        const top = Math.max(0, ((height / 2) - (h / 2)) + dualScreenTop + topCorrection);

        this._popup = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

        if (window.focus) { this._popup.focus(); }
    }
}

export const popup = new Popup();