import { popup } from './Popup';

export class Linkedin {
    share(url, title, description) {
        const articleUrl = encodeURIComponent(url || document.location.href + document.location.hash);
        const articleTitle = encodeURIComponent(title);
        const articleSummary = encodeURIComponent(description);
        const articleSource = encodeURIComponent(url);

        const link = 'http://www.linkedin.com/shareArticle?mini=true&' +
        'url=' + articleUrl +
        '&title=' + articleTitle +
        '&summary=' + articleSummary +
        '&source=' + articleSource;

        popup.open(link, 'linkedin', 520, 570, 0, 0);
    }
}

export const linkedin = new Linkedin();