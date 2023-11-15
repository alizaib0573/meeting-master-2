import { popup } from './Popup';

export class Facebook {
    share(url) {
        const baseUrl = url ? url : document.location.href + document.location.hash;
        const link = 'https://www.facebook.com/sharer/sharer.php?u=' + baseUrl;
        popup.open(link, 'facebook', 570, 440, 0, 0);
    }
}

export const facebook = new Facebook();