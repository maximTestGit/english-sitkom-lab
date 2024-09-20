import { isMobile } from 'react-device-detect';

export const inDebugEnv = process.env.NODE_ENV === 'development';

export function getYoutubeUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
}

export function saveExerciseUrl() {
    return 'https://us-central1-youtube-project-404109.cloudfunctions.net/function-save-exercise';
}

export function loginUrl() {
    return 'https://me-west1-youtube-project-404109.cloudfunctions.net/function-login';
}

export function getCaptionsUrl(videoId, language, user) {
    //let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json?videoId=${videoId}&language=${language}`;
    let url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json-1?videoId=${videoId}&language=${language}&user=${user}`;
    return url;
}

export function getCaptionsUrlPost() {
    let url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json-1`;
    return url;
}

export function captionsSaveToStorageUrl() {
    return 'https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-save-storage';
}

export function getPlaylistContentUrl(playlistId) {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-get-playlst-content?playlistId=${playlistId}`;
    return url;
}

export function getPlaylistContentUrlPost() {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-get-playlst-content`;
    return url;
}

export const isRunningOnBigScreen = !isMobile;

export const learningLanguage = process.env.NEXT_PUBLIC_LEARNING_LANGUAGE // vercel env.var.
    ||
    process.env.LEARNING_LANGUAGE
    ||
    process.env.REACT_APP_LEARNING_LANGUAGE
    ||
    (inDebugEnv && 'he-IL')
    ||
    'en-US'; // netlify env.var.

export function getLearningLanguageName(language) {
    switch (language) {
        case 'en-US':
            return 'English';
        case 'ru-RU':
            return 'Russian';
        case 'he-IL':
            return 'Hebrew';
        default:
            return 'English';
    }
}


//console.log(`LingFlix: configurator: learningLanguage: ${learningLanguage}`);




