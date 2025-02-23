import { getCultureLanguageName } from '../data/configurator';

export function getCardYoutubeClipLink(card) {
    const videoId = card.videoId;
    const seconds = card.seconds || 0;
    const duration = card.duration || 5;
    const startInt = Math.round(seconds);
    const endInt = Math.round(seconds + duration);
    return `https://www.youtube.com/embed/${videoId}?start=${startInt}&end=${endInt}&autoplay=1`;//`https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
}

export function getCardYouglishLink(card) {
    const text = card.front;
    const result = `https://youglish.com/pronounce/${encodeURIComponent(text)}/${getCultureLanguageName(card.frontLanguage)}`;
    return result;
};
