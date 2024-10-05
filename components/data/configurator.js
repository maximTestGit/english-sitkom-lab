import { isMobile } from 'react-device-detect';

export const inDebugEnv = process.env.NODE_ENV === 'development';
export const isRunningOnBigScreen = !isMobile;

export function getYoutubeUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
}

export function saveExerciseUrl() {
    let url = 'https://us-central1-youtube-project-404109.cloudfunctions.net/function-save-exercise-2-0';
    if (inDebugEnv) {
        url = 'https://us-central1-youtube-project-404109.cloudfunctions.net/function-save-exercise-test';
    }
    return url;
}

export function loginUrl() {
    return 'https://me-west1-youtube-project-404109.cloudfunctions.net/function-login';
}

export function getCaptionsUrlPost() {
    let url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json-2-0`;
    if (inDebugEnv) {
        url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json-test`;
    }
    return url;
}

export function captionsSaveToStorageUrl() {
    let url = 'https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-save-storage-2-0';
    if (inDebugEnv) {
        url = 'https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-save-storage-test';
    }
    return url;
}

export function getPlaylistContentUrlPost() {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-get-playlst-content-2-0`;
    if (inDebugEnv) {
        url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-get-playlst-content-test`;
    }
    return url;
}

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




