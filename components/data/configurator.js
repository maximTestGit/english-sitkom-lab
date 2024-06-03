import {isMobile} from 'react-device-detect';

export function getYoutubeUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
}

export function saveExerciseUrl() {
    return 'https://us-central1-youtube-project-404109.cloudfunctions.net/function-save-exercise';
}

export function getCaptionsUrl(videoId, language) {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json?videoId=${videoId}&language=${language}`;
    return url;
}

export function getPlaylistContentUrl(playlistId) {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-get-playlst-content?playlistId=${playlistId}`;
    return url;
}

export const isRunningOnBigScreen = !isMobile;
