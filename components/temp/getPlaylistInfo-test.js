const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const fetch = require('node-fetch');

// Initialize Firestore
admin.initializeApp();
const db = admin.firestore();

functions.http('getPlaylistInfo', async (req, res) => {
    cors(req, res, async () => {
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type',
        });

        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Max-Age', '3600');
            return res.end();
        }

        let isUserAuthenticated = false;
        const authHeader = req.header('Authorization');
        const idToken = authHeader?.split('Bearer ')?.[1];

        try {
            if (idToken) {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                console.log(`getPlaylistInfo: Authenticated user: ${decodedToken.email}`);
                isUserAuthenticated = true;
            } else {
                console.log(`getPlaylistInfo: User is not Authenticated`);
            }
            const playlistId = req.method === 'POST' ? req.body.playlistId : req.query.playlistId || "PLuMmOfYkVMQ4yiChOU3tS-srFvN6XbwR_";
            const maxResult = req.query.maxResult || 1000;

            console.log(`getPlaylistInfo: Requesting playlistId: ${playlistId}, maxResult: ${maxResult}`);

            const playlistInfo = await fetchPlaylistInfo(playlistId, maxResult, !isUserAuthenticated);
            return res.send(playlistInfo);
        } catch (error) {
            if (error.code === 'auth/argument-error') {
                return res.status(401).send('Invalid token');
            }
            console.error('Error during request:', error);
            return res.status(500).send(error.message);
        }
    });
});

async function fetchPlaylistInfo(playlistId, maxResult, exampleOnTop) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResult}&playlistId=${playlistId}&key=${apiKey}`;
    console.log(`getPlaylistInfo: Fetching playlist info from URL: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const exampleVideoId = await getExampleVideo(playlistId);
    let videos = data.items
        .filter(item => item.snippet.thumbnails.default)
        .map(item => ({
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.default.url,
            enabled: (!exampleOnTop || item.snippet.resourceId.videoId === exampleVideoId),
        }));
    console.log(`getPlaylistInfo: Fetched ${videos.length} videos. First: ${videos[0].title}`);
    if (exampleOnTop) {
        if (exampleVideoId) {
            console.log(`getPlaylistInfo: moving on top exampleVideoId: ${exampleVideoId}`);
            videos = moveExampleVideoToTop(videos, exampleVideoId);
            console.log(`getPlaylistInfo: example video moved on top. First: ${videos[0].title}`);
        } else {
            console.log(`getPlaylistInfo: no exampleVideoId found`);
        }
    }

    console.log(`getPlaylistInfo: Fetched ${videos.length} videos. First: ${videos[0].title}`);
    return videos;
}

function moveExampleVideoToTop(videos, exampleVideoId) {
    const index = videos.findIndex(video => video.videoId === exampleVideoId);
    if (index > -1) {
        const [exampleVideo] = videos.splice(index, 1);
        videos.unshift(exampleVideo);
        console.log(`getPlaylistInfo: moveExampleVideoToTop: example video moved on top. First: ${videos[0].title}`);
    }
    return videos;
}

async function getExampleVideo(playlistId) {
    console.log(`getPlaylistInfo: fetchCaptions: getExampleVideo: playlistId: ${playlistId}`);
    let result = null;

    const docRef = db.collection('playlists').doc(playlistId);
    let doc = await docRef.get();

    if (doc.exists) {
        const documentData = doc.data();
        console.log(`getPlaylistInfo: fetchCaptions: getExampleVideo: playlistId: ${playlistId} document: ${documentData}`);
        result = documentData.Video;
    }
    return result;
}
