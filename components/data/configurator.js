export function getYoutubeUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
}

export function getFetchCaptionsUrl(videoId) {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json?videoId=${videoId}`;
    return url
}

export function getFetchVideoListUrl(playlistId) {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-get-playlst-content?playlistId=${playlistId}`;
    return url;
}