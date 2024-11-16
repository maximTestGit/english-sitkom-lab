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

            var videoId;
            var language;
            var originalLanguage;
            var user;
            if (req.method === 'POST') {
                const requestBody = req.body;
                console.log('getPlaylistInfo: Request Body:', requestBody);
                playlistId = requestBody.playlistId;
                videoId = requestBody.videoId;
                language = requestBody.language;
                originalLanguage = requestBody.originalLanguage;
                user = requestBody.user;
            } else {
                videoId = req.query.videoId;
                language = req.query.language;
                originalLanguage = req.query.originalLanguage;
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
            if (!originalLanguage) {
                originalLanguage = "English"
            }
            if (!user || user === 'undefined') {
                user = 'guest';
            }
            console.log(`fetchCaptions: request videoId: ${videoId} language:${language} user:${user}`);
            // ----------------------------
            let toSave = false;
            let videoInfo = null;
            let captions = await tryToGetCaptions(videoId, language, user, videoInfo);
            console.log(`captionsFetch: tryToGetCaptions:${language}: captions found: ${captions}`);

            if (!captions && originalLanguage !== language) {
                const originalCaptions = await tryToGetCaptions(videoId, originalLanguage, user, videoInfo);
                captions = await translateSrtContent(originalCaptions, originalLanguage, language);
                console.log(`captionsFetch: tryToGetCaptions:${originalLanguage}: captions found: ${captions}`);
                toSave = true;
            }

            if (!captions && videoInfo) {
                // if not found, try to find auto-generated captions on YouTube
                //const autoCaptions = `${language} (auto-generated)`;
                captions = await getCaptionsFromYoutube(videoId, videoInfo, language, false);
                console.log(`fetchCaptions: request videoId: ${videoId} language:${language} strict: false, user:${user}: captions: ${captions}`);
                console.log(`captionsFetch: getCaptionsFromYoutube:${language}: captions found: ${captions}`);
            }
            if (!captions && videoInfo && originalLanguage !== language) {
                // if not found, try to find auto-generated captions on YouTube
                //const autoCaptions = `${language} (auto-generated)`;
                const originalCaptions = await getCaptionsFromYoutube(videoId, videoInfo, originalLanguage, false);
                console.log(`fetchCaptions: request videoId: ${videoId} language:${language} strict: false, user:${user}: captions: ${captions}`);
                if (originalCaptions) {
                    captions = await translateSrtContent(originalCaptions, originalLanguage, language);
                    console.log(`captionsFetch: getCaptionsFromYoutube:${originalLanguage}: captions found: ${captions}`);
                }
                toSave = true;
            }
            if (toSave) {
                console.log(`captionsFetch: captions found: ${captions}`);
                if (captions) {
                    await saveCaptionToStorage(videoId, language, user, captions);
                }
            }
            if (captions) {
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

async function saveCaptionToStorage(videoId, language, user, captions) {
    const documentId = generateCaptionsDocumentId(videoId, language, 'admin');
    const docRef = db.collection('videoCaptions').doc(documentId);

    await docRef.set({
        videoId,
        language,
        user,
        captions,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
}

// try to fetch captions from different sources according to priority
// 1st, try to get captions uploaded by the user
async function tryToGetCaptions(videoId, language, user, videoInfo) {
    const adminUser = 'admin';
    let captions = await getCaptionsFromStorage(videoId, language, user);
    console.log(`tryToGetCaptions: getCaptionsFromStorage: language:${language} user:${user}: captions: ${captions}`);
    if (!captions) {
        // if not found try to find caption uploaded by administrator
        captions = await getCaptionsFromStorage(videoId, language, adminUser);
        console.log(`tryToGetCaptions: getCaptionsFromStorage: language:${language} user:${adminUser}: captions: ${captions}`);
    }
    if (!captions) {
        // if captions not found try to find captions uploaded by the video owner
        if (!videoInfo) {
            videoInfo = await fetchPlayerInfo(videoId);
        }
        if (videoInfo) {
            captions = await getCaptionsFromYoutube(videoId, videoInfo, language, true);
            console.log(`fetchCaptions: request videoId: ${videoId} language:${language} strict: true, user:${user}: captions: ${captions}`);
        } else {
            console.log(`fetchCaptions: no videoInfor for request videoId: ${videoId} language:${language} user:${user}: captions: ${captions}`);
        }
        console.log(`tryToGetCaptions: getCaptionsFromStorage: getCaptionsFromYoutube: language:${language} user:${user}: captions: ${captions}`);
    }
    return captions;
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
                const transcript = jsonObject?.transcript?.text.map(entry => ({
                    start: entry.$.start,
                    duration: entry.$.dur,
                    text: entry._,
                    videoId: videoId
                }));
                result = JSON.stringify(transcript);
                console.log(`fetchCaptions:: result: ${result}`);
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
        result = doc.data().captions;
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

async function translateSrtContent(captions, fromLanguage, toLanguage) {
    let result = '';
    const prompt =
        `You are a movie translation assistant. ` +
        `translate the given subtitles data from ${fromLanguage} to ${toLanguage}, ` +
        `keeping given subtitles data format ` +
        `and taking into account the context of the dialog of the subtitles data.` +
        `your answer must contain nothing but translated subtitles data.`;

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    console.log(`translateSrtContent prompt: ${prompt}`);
    console.log(`translateSrtContent content: ${captions}`);
    const data = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: captions }
        ],
        max_tokens: 1000,
        temperature: 0.5
    };

    const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    };

    try {
        console.log(`translateSrtContent: START request for assistanceRequest url: ${url}`);
        const response = await fetch(url, options);
        console.log('translateSrtContent: Response of assistanceRequest:', response);
        if (!response.ok) {
            console.error(`translateSrtContent: Error in assistanceRequest: response status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultData = await response.json();
        console.log('translateSrtContent: Result:', resultData);

        result = resultData.choices[0].message.content;
        console.log('translateSrtContent: Response Text:', result);
    } catch (error) {
        console.error('translateSrtContent: Error:', error);
        throw error;
    }

    return result;
}