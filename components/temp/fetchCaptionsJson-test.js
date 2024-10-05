const fetch = require('node-fetch');
const { parseString } = require('xml2js');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
const db = admin.firestore();

exports.fetchCaptionsJson = async (req, res) => {
    cors(req, res, async () => {

        console.log(`fetchCaptions: +++++++++++++++++++++++++++++++++++++`);
        res.set('Access-Control-Allow-Origin', '*'); // Allow all origins
        res.set('Access-Control-Allow-Methods', 'GET, POST'); // Allow these methods
        res.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow these headers

        if (req.method === 'OPTIONS') {
            // Handle preflight requests
            res.set('Access-Control-Max-Age', '3600'); // Cache preflight response for 1 hour
            res.end();
            return;
        }

        try {
            console.log(`fetchCaptions: -----------------------------------------`);
            let isUserAuthenticated = false;
            const authHeader = req.header('Authorization');
            const idToken = authHeader?.split('Bearer ')?.[1];

            if (idToken) {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                console.log(`Authenticated user: ${decodedToken.email}`);
                isUserAuthenticated = true;
            } else {
                console.log(`User is not Authenticated`);
            }

            const adminUser = 'admin';
            var videoId;
            var language;
            var user;
            if (req.method === 'POST') {
                const requestBody = req.body;
                console.log('getPlaylistInfo: Request Body:', requestBody);
                playlistId = requestBody.playlistId;
                videoId = requestBody.videoId;
                language = requestBody.language;
                user = requestBody.user;
            } else {
                videoId = req.query.videoId;
                language = req.query.language;
                user = req.query.user;
                playlistId = req.query.playlistId;
            }

            if (playlistId) {
                const exampleVideoId = await getExampleVideoId(playlistId);
                console.log(`fetchCaptions: input videoId: ${videoId} exampleVideoId:${exampleVideoId}`);
                if (!isUserAuthenticated && videoId !== exampleVideoId) {
                    videoId = process.env.REGISTER_VIDEO_ID;
                    language = 'English';
                }
            }
            // setting defaults for testing ----------
            console.log(`fetchCaptions: input videoId: ${videoId} language:${language} user:${user}`);
            if (!videoId) {
                videoId = "hgE9Nl8yTMs"
            }
            if (!language) {
                language = "English"
            }
            if (!user || user === 'undefined') {
                user = 'guest';
            }
            console.log(`fetchCaptions: request videoId: ${videoId} language:${language} user:${user}`);
            // ----------------------------

            // try to fetch captions from different sources according to priority
            // 1st, try to get captions uploaded by the user
            let captions = await getCaptionsFromStorage(videoId, language, user);
            if (!captions) {
                // if not found try to find caption uploaded by administrator
                captions = await getCaptionsFromStorage(videoId, language, adminUser);
            }
            if (!captions) {
                // if captions not found try to find captions uploaded by the video owner
                const videoInfo = await fetchPlayerInfo(videoId);
                if (videoInfo) {
                    captions = await getCaptionsFromYoutube(videoId, videoInfo, language, true);
                    console.log(`fetchCaptions: request videoId: ${videoId} language:${language} strict: true, user:${user}: captions: ${captions}`);
                    if (!captions) {
                        // if not found, try to find auto-generated captions
                        //const autoCaptions = `${language} (auto-generated)`;
                        captions = await getCaptionsFromYoutube(videoId, videoInfo, language, false);
                        console.log(`fetchCaptions: request videoId: ${videoId} language:${language} strict: false, user:${user}: captions: ${captions}`);
                    }
                } else {
                    console.log(`fetchCaptions: no videoInfor for request videoId: ${videoId} language:${language} user:${user}: captions: ${captions}`);
                }
            }

            if (captions) {
                console.log('captionsFetch: captions found');
                console.log(captions);
                res.send(captions);
            } else {
                console.log('captionsFetch: No captions found');
                res.status(404).json({ error: 'No captions found' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send(error.message);
        }
    }
    )
}

async function fetchPlayerInfo(videoId) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`;

    const requestData = {
        "context": {
            "client": {
                "hl": "en",
                "clientName": "WEB",
                "clientVersion": "2.20210721.00.00",
                "clientFormFactor": "UNKNOWN_FORM_FACTOR",
                "clientScreen": "WATCH",
                "mainAppWebInfo": {
                    "graftUrl": `/watch?v=${videoId}`,
                }
            },
            "user": {
                "lockedSafetyMode": false
            },
            "request": {
                "useSsl": true,
                "internalExperimentFlags": [],
                "consistencyTokenJars": []
            }
        },
        "videoId": videoId,
        "playbackContext": {
            "contentPlaybackContext": {
                "vis": 0,
                "splay": false,
                "autoCaptionsDefaultOn": false,
                "autonavState": "STATE_NONE",
                "html5Preference": "HTML5_PREF_WANTS",
                "lactMilliseconds": "-1"
            }
        },
        "racyCheckOk": false,
        "contentCheckOk": false
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Host': 'www.youtube.com',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        },
        body: JSON.stringify(requestData)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    let responseData = await response.text();
    let result = JSON.parse(responseData);
    console.log(`fetchPlayerInfo: response: ${JSON.stringify(result)}`);

    return result;
}

function getFetchCaptionsUrl(videoInfo, language, strict) {
    var captionsUrl = getCaptionsTrack(videoInfo, language, strict);
    console.log(`fetchCaptionsUrl: url="${captionsUrl}"`);
    return captionsUrl;
}

function getCaptionsTrack(videoInfo, trackName, strict) {
    console.log(`getCaptionsTrack: ${trackName} strict: ${strict}`);

    let captionTracks = videoInfo?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (captionTracks) {
        for (let track of captionTracks) {
            console.log(`getCaptionsTrack: current track: ${track}`);
            console.log(`getCaptionsTrack: ${track.name.simpleText} vs ${trackName}: ${track.baseUrl}`);
            if (strict) {
                if (track.name.simpleText === trackName) {
                    return track.baseUrl;
                }
            }
            else {
                if (track.name.simpleText.includes(trackName)) {
                    return track.baseUrl;
                }
            }
        }
    }
    return null;
}

async function fetchCaptionsFromUrl(fetchCaptionsUrl) {
    try {
        const response = await fetch(fetchCaptionsUrl);
        var captions = null;
        if (response.ok) {
            console.log('fetchCaptionsFromUrl: response is ok');
            const data = await response.text();

            parseString(data, (err, result) => {
                if (err) {
                    console.error('Error parsing XML:', err);
                }
                else {
                    //console.log('Parsed XML:', result);
                    captions = result;
                }
            });
            console.log('-------------------------');
            console.log(JSON.stringify(captions));
            console.log('-------------------------');
        }
        return captions;
    } catch (error) {
        console.error("Error:", error);
    }
}

async function getCaptionsFromYoutube(videoId, videoInfo, language, strict = false) {
    console.log(`fetchCaptions: getCaptionsFromYoutube videoId: ${videoId} language:${language}`);

    let result = null;
    let playabilityStatus = videoInfo?.playabilityStatus?.status;
    console.log(`fetchCaptions::playabilityStatus: ${playabilityStatus}`);

    if (playabilityStatus == 'OK') {
        var fetchCaptionsUrl = getFetchCaptionsUrl(videoInfo, language, strict);
        if (fetchCaptionsUrl) {
            var jsonObject = await fetchCaptionsFromUrl(fetchCaptionsUrl);
            if (jsonObject) {
                console.log(`fetchCaptions:: response of jsonObject: ${JSON.stringify(jsonObject)}`);
                result = jsonObject?.transcript?.text.map(entry => ({
                    start: entry.$.start,
                    duration: entry.$.dur,
                    text: entry._,
                    videoId: videoId
                }));
                console.log(`fetchCaptions:: result: ${JSON.stringify(result)}`);
            } else {
                console.log(`fetchCaptions:: empty response of fetchCaptionsFromUrl: ${jsonObject}`);
            }
        } else {
            console.log(`fetchCaptions:: empty fetchCaptionsUrl: ${fetchCaptionsUrl}`);
        }
    }
    return result;
}

async function getCaptionsFromStorage(videoId, language, user) {
    console.log(`fetchCaptions: getCaptionsFromStorage videoId: ${videoId} language:${language} user:${user}`);
    let result = null;
    let documentId = generateCaptionsDocumentId(videoId, language, user);

    const docRef = db.collection('videoCaptions').doc(documentId);
    let doc = await docRef.get();

    if (doc.exists) {
        console.log(`captionsFetchFromStorage: Found captions for specific user: document.caption: ${doc.data().captions}`);
        result = JSON.parse(doc.data().captions);
        console.log(`captionsFetchFromStorage: Found captions for specific user result: ${result}`);
    }
    return result;
}

async function getExampleVideoId(playlistId) {
    console.log(`fetchCaptions: getExampleVideo: playlistId: ${playlistId}`);
    let result = null;

    const docRef = db.collection('playlists').doc(playlistId);
    let doc = await docRef.get();

    if (doc.exists) {
        result = doc.data().Video;
    }
    return result;
}


function generateCaptionsDocumentId(videoId, language, user) {
    return `Captions-${videoId}-${language}-${user}`;
}
