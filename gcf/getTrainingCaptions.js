const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
const db = admin.firestore();


exports.getTrainingCaptions = async (req, res) => {
    cors(req, res, async () => {
        try {
            // Enable CORS
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
            res.set('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                // Handle preflight requests
                res.set('Access-Control-Max-Age', '3600'); // Cache preflight response for 1 hour
                res.end();
                return;
            }

            let isUserAuthenticated = false;
            const authHeader = req.header('Authorization');
            const idToken = authHeader?.split('Bearer ')?.[1];

            if (idToken) {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                console.log(`translateSrtContent: Authenticated user: ${decodedToken.email}`);
                isUserAuthenticated = true;
            } else {
                console.log(`translateSrtContent: User is not Authenticated`);
                //res.status(401).send('Unauthorized');
            }

            let videoId;
            let sourceLanguage;
            let captionsLanguage;
            let srtData;
            let user;
            if (req.method === 'POST') {
                if (!isUserAuthenticated) {
                    res.status(401).send('Unauthorized');
                    return;
                }
                const requestBody = req.body;
                videoId = requestBody.videoId;
                sourceLanguage = requestBody.sourceLanguage;
                captionsLanguage = requestBody.captionsLanguage;
                srtData = requestBody.srtData;
                user = requestBody.user;
            } else {
                videoId = 'MVNcKXLc5a0';
                sourceLanguage = 'Hebrew';
                captionsLanguage = 'Russian';
                srtData = `
1
00:00:01,372 --> 00:00:03,134
 אולי ראית את המקדחה?

2
00:00:04,052 --> 00:00:07,533
תגיד, אספסיאנוס היה
לפני טיטוס או אחרי?

3
00:00:07,960 --> 00:00:11,561
 האמת, אספסיאנוס
היה לפני טיטוס,

4
00:00:11,586 --> 00:00:14,019
 אבל טיטוס נכנס בלי תור.

5
00:00:15,006 --> 00:00:17,422
 אמר שזה רק שאלה, אז...

6
00:00:17,614 --> 00:00:18,650
 איפה המקדחה?

7
00:00:18,675 --> 00:00:20,655
מה אכפת לי המקדחה שלך?

8
00:00:20,861 --> 00:00:23,861
לי יש עוד יומיים בחינה בהיסטוריה,
אז תענה כששואלים אותך.

9
00:00:23,966 --> 00:00:25,125
 סליחה, סליחה.
`;
                user = 'guest';
            }
            // Extract parameters from the request body
            console.log("getTrainingCaption: Received request with parameters:");
            console.log("getTrainingCaption: videoId =", videoId);
            console.log("getTrainingCaption: sourceLanguage =", sourceLanguage);
            console.log("getTrainingCaption: captionsLanguage =", captionsLanguage);

            const srt = await translateSrtContent(srtData, sourceLanguage, captionsLanguage);
            const captions = convertSrtToJsonString(srt);
            console.log(`getTrainingCaptions: from ${sourceLanguage} to ${captionsLanguage}: ${srt}`);

            const documentId = generateCaptionsDocumentId(videoId, captionsLanguage, 'admin');
            const docRef = db.collection('videoCaptions').doc(documentId);

            await docRef.set({
                videoId,
                captionsLanguage,
                user,
                captions,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            res.status(200).json({ captions: captions });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send(error.message);
        }
    })
}

function generateCaptionsDocumentId(videoId, language, user) {
    const result = `Captions-${videoId}-${language}-${user}`;
    return result;
}


function convertSrtToJsonString(srtContent) {
    const srtArray = srtContent.trim().split('\n\n');
    const jsonArray = srtArray.map(srtBlock => {
        const [index, time, ...textLines] = srtBlock.split('\n');
        const [start, end] = time.split(' --> ');
        const duration = (new Date(`1970-01-01T${end.replace(',', '.')}Z`) - new Date(`1970-01-01T${start.replace(',', '.')}Z`)) / 1000;
        const text = textLines.join(' ');
        return {
            start: start.replace(',', '.'),
            duration: duration,
            text: text,
            checked: false
        };
    });
    return JSON.stringify(jsonArray);
}

async function translateSrtContent(theText, fromLanguage, toLanguage) {
    let result = '';
    const prompt =
        `You are a movie translation assistant. ` +
        `translate the original srt file content from ${fromLanguage} to ${toLanguage}, ` +
        `keeping srt file format and taking into account the context of the dialog of the srt data.` +
        `your answer must contain nothing but translated srt file content.`;

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    const theContent = theText;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    console.log(`translateSrtContent prompt: ${prompt}`);
    const data = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: theContent }
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