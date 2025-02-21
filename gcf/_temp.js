// "@google-cloud/translate": "^3.0.0",

const fetch = require('node-fetch');
const { parseString } = require('xml2js');
const adminFB = require('firebase-admin');
const cors = require('cors')({ origin: true });
//const { Translate } = require('@google-cloud/translate');
// Initialize Firestore
adminFB.initializeApp();


exports.fetchCaptionsJson = async (req, res) => {
    cors(req, res, async () => {
        console.log(`fetchCaptionsJson: ++++++++++++++++ request +++++++++++++++++++++`);
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
            console.log(`fetchCaptionsJson: ---------------- start processing -------------------------`);
            let isUserAuthenticated = false;
            const authHeader = req.header('Authorization');
            const idToken = authHeader?.split('Bearer ')?.[1];

            if (idToken) {
                const decodedToken = await adminFB.auth().verifyIdToken(idToken);
                console.log(`fetchCaptionsJson: Authenticated user: ${decodedToken.email}`);
            isUserAuthenticated = true;
            } else {
                console.log(`fetchCaptionsJson: User is not Authenticated`);
            }

            var videoId;
            var language;
            var originalLanguage;
            var user;

                videoId = req.query.videoId;
                language = req.query.language;
                originalLanguage = req.query.originalLanguage;
                user = req.query.user;
                playlistId = req.query.playlistId;

            // setting defaults for testing 
            console.log(`fetchCaptionsJson: input videoId: ${videoId} language:${language} user:${user}`);
            if (!videoId) {
                videoId = "6DkntGXQsmw" //"hgE9Nl8yTMs"
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
            console.log(`fetchCaptionsJson: request videoId: ${videoId} language:${language} user:${user}`);
            // ----------------------------

          //let toSave = false;
            let videoInfo = null;
            // try to get captions on target language
            let captions = await tryToGetCaptions(videoId, language, user, videoInfo);
            console.log(`fetchCaptionsJson: --- initial tryToGetCaptions:${language}: captions found: ${captions}`);

            if (captions) {
                res.send(captions);
            } else {
                console.log('fetchCaptionsJson: No captions found');
                res.status(404).json({ error: 'No captions found' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send(error.message);
        }
    }
    )
}

async function tryToGetCaptions(videoId, language, user, videoInfo) {
        if (!videoInfo) {
            videoInfo = await fetchPlayerInfo(videoId);
        }
        if (videoInfo) {
            captions = await getCaptionsFromYoutube(videoId, videoInfo, language, true); // as string
            console.log(`fetchCaptionsJson: tryToGetCaptions: getCaptionsFromYoutube: --- of language:${language} captions: ${captions}`);
        } else {
            console.log(`fetchCaptionsJson: no videoInfo for request videoId: ${videoId} language:${language} user:${user}: captions: ${captions}`);
        }
        console.log(`fetchCaptionsJson: tryToGetCaptions: result: --- captions: ${captions}`);
    return captions;
}

async function resolveVisitorDataAsync() {
    const response = await fetch("https://www.youtube.com/sw.js_data", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "User-Agent": "com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X; US)"
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let jsonString = await response.text();
    if (jsonString.startsWith(")]}'")) {
        jsonString = jsonString.substring(4);
    }

    const json = JSON.parse(jsonString);
    
    const value = json?.[0]?.[2]?.[0]?.[0]?.[13] || null;
    if (!value || value.trim() === "") {
        throw new Error("Failed to resolve visitor data.");
    }
    
    return value;
}


async function fetchPlayerInfo(videoId) {
    const visitorData = await resolveVisitorDataAsync();
    
    const requestBody = JSON.stringify({
        videoId: videoId,
        contentCheckOk: true,
        context: {
            client: {
                clientName: "IOS",
                clientVersion: "19.45.4",
                deviceMake: "Apple",
                deviceModel: "iPhone16,2",
                platform: "MOBILE",
                osName: "IOS",
                osVersion: "18.1.0.22B83",
                visitorData: visitorData,
                hl: "en",
                gl: "US",
                utcOffsetMinutes: 0
            }
        }
    });
    
    const response = await fetch("https://www.youtube.com/youtubei/v1/player", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X; US)"
        },
        body: requestBody
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    console.log("getPlayerResponseAsync: Player response :", response);    
    const playerResponse = await response.json();
    
    if (!playerResponse.isAvailable) {
        throw new Error(`Video '${videoId}' is not available.`);
    }
    
    return playerResponse;
}


function getFetchCaptionsUrl(videoInfo, language, strict) {
    var captionsUrl = getCaptionsTrack(videoInfo, language, strict);
    console.log(`fetchCaptionsJson: fetchCaptionsUrl: url="${captionsUrl}"`);
    return captionsUrl;
}

function getCaptionsTrack(videoInfo, trackName, strict) {
    console.log(`fetchCaptionsJson: getCaptionsTrack: ${trackName} strict: ${strict}`);

    let captionTracks = videoInfo?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (captionTracks) {
        for (let track of captionTracks) {
            console.log(`fetchCaptionsJson: getCaptionsTrack: current track: ${track}`);
            console.log(`fetchCaptionsJson: getCaptionsTrack: ${track.name.simpleText} vs ${trackName}: ${track.baseUrl}`);
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
            console.log('fetchCaptionsJsonfetchCaptionsFromUrl: response is ok');
            const data = await response.text();

            parseString(data, (err, result) => {
                if (err) {
                    console.error('Error parsing XML:', err);
                }
                else {
                    //console.log('fetchCaptionsJson: Parsed XML:', result);
                    captions = result;
                }
            });
            console.log('fetchCaptionsJson: ------------ JSON -------------');
            console.log(JSON.stringify(captions));
            console.log('fetchCaptionsJson: -------------------------');
        }
        return captions;
    } catch (error) {
        console.error("fetchCaptionsJson: Error:", error);
    }
}

async function getCaptionsFromYoutube(videoId, videoInfo, language, strict = false) {
    console.log(`fetchCaptionsJson: getCaptionsFromYoutube videoId: ${videoId} language:${language}`);

    let result = null;
    let playabilityStatus = videoInfo?.playabilityStatus?.status;
    console.log(`fetchCaptionsJson::playabilityStatus: ${playabilityStatus}`);

    if (playabilityStatus == 'OK') {
        var fetchCaptionsUrl = getFetchCaptionsUrl(videoInfo, language, strict);
        if (fetchCaptionsUrl) {
            var jsonObject = await fetchCaptionsFromUrl(fetchCaptionsUrl);
            if (jsonObject) {
                console.log(`fetchCaptionsJson:: response of jsonObject: ${JSON.stringify(jsonObject)}`);
                const transcript = jsonObject?.transcript?.text.map(entry => ({
                    start: entry.$.start,
                    duration: entry.$.dur,
                    text: entry._,
                    videoId: videoId
                }));
                result = JSON.stringify(transcript);
                console.log(`fetchCaptionsJson:: result: ${result}`);
            } else {
                console.log(`fetchCaptionsJson:: empty response of fetchCaptionsFromUrl: ${jsonObject}`);
            }
        } else {
            console.log(`fetchCaptionsJson:: empty fetchCaptionsUrl: ${fetchCaptionsUrl}`);
        }
    }
    return result;
}

function getLanguageCode(languageName) {
    const languageMap = {
        "Afrikaans": "af",
        "Albanian": "sq",
        "Arabic": "ar",
        "Armenian": "hy",
        "Basque": "eu",
        "Bengali": "bn",
        "Bulgarian": "bg",
        "Catalan": "ca",
        "Chinese": "zh",
        "Croatian": "hr",
        "Czech": "cs",
        "Danish": "da",
        "Dutch": "nl",
        "English": "en",
        "Esperanto": "eo",
        "Estonian": "et",
        "Finnish": "fi",
        "French": "fr",
        "Galician": "gl",
        "Georgian": "ka",
        "German": "de",
        "Greek": "el",
        "Gujarati": "gu",
        "Hebrew": "he",
        "Hindi": "hi",
        "Hungarian": "hu",
        "Icelandic": "is",
        "Indonesian": "id",
        "Irish": "ga",
        "Italian": "it",
        "Japanese": "ja",
        "Kannada": "kn",
        "Korean": "ko",
        "Latvian": "lv",
        "Lithuanian": "lt",
        "Macedonian": "mk",
        "Malay": "ms",
        "Malayalam": "ml",
        "Maltese": "mt",
        "Marathi": "mr",
        "Norwegian": "no",
        "Persian": "fa",
        "Polish": "pl",
        "Portuguese": "pt",
        "Romanian": "ro",
        "Russian": "ru",
        "Serbian": "sr",
        "Slovak": "sk",
        "Slovenian": "sl",
        "Spanish": "es",
        "Swahili": "sw",
        "Swedish": "sv",
        "Tamil": "ta",
        "Telugu": "te",
        "Thai": "th",
        "Turkish": "tr",
        "Ukrainian": "uk",
        "Urdu": "ur",
        "Vietnamese": "vi",
        "Welsh": "cy"
    };

    return languageMap[languageName] || null;
}
