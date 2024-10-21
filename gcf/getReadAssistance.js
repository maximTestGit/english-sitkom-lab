const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
//const db = admin.firestore();

exports.getReadAssistance = async (req, res) => {
    cors(req, res, async () => {
        console.log(`getReadAssistance: -----------------------------------------`);
        res.set('Access-Control-Allow-Origin', '*'); // Allow all origins
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow these methods
        res.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow these headers

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
            console.log(`getReadAssistance: Authenticated user: ${decodedToken.email}`);
            isUserAuthenticated = true;
        } else {
            console.log(`getReadAssistance: User is not Authenticated`);
            //res.status(401).send('Unauthorized');
        }

        try {
            var user;
            var theText;
            var textLanguage;
            var answerLanguage;
            if (req.method === 'POST') {
                if (!isUserAuthenticated) {
                    res.status(401).send('Unauthorized');
                    return;
                }
                const requestBody = req.body;
                console.log('getReadAssistance: Request Body:', requestBody);
                theText = requestBody.text;
                answerLanguage = requestBody.answerlanguage;
                textLanguage = requestBody.textlanguage;
                user = requestBody.user;
            } else {
                theText = 'The quick brown fox jumps over the lazy dog';
                answerLanguage = 'Russian';
                textLanguage = 'English';
                user = req.query.user;
            }

            console.log(`getReadAssistance: ${theText}(${textLanguage}) in ${answerLanguage}`);
            var answer = await getReadAssistanceAnswer(theText, textLanguage, answerLanguage);
            console.log(`getReadAssistance: ${theText}(${textLanguage}) in ${answerLanguage}: ${answer}`);
            res.status(200).json({ answer: answer });
        } catch (error) {
            console.error('getReadAssistance: Error:', error);
            res.status(500).send(error.message);
        }
    })
}
async function getReadAssistanceAnswer(theText, textLanguage, answerLanguage, promptLanguage = 'English') {
    let result = '';
    const prompt =
        `explain to a ${answerLanguage}-speaking student ` +
        `how to pronounce the given text in ${textLanguage}. ` +
        `    - provide transcription of the text in ${answerLanguage} ` +
        `    - provide transcription of the text in the simplified International Phonetic Alphabet ` +
        `At the end provide pronunciation guidance using familiar ${answerLanguage} sounds where possible. ` +
        `Please keep explanations clear and accessible, using ${answerLanguage} examples ` +
        `that will resonate with native speakers of that language. ` +
        `Your response should be in ${answerLanguage} formatted as html page. ` +
        `it must start with <!DOCTYPE html> tag and finish with </html> tag. ` +
        `add border to thepage and padding to the body. ` +
        `it must contain "Listen again" button that will play the pronunciation of the text ` +
        `using the SpeechSynthesisUtterance. ` +
        `check if SpeechSynthesisUtterance is available in the browser and provide a message if it is not available. `;

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    const theContent = theText;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const data = {
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: theContent }
        ],
        max_tokens: 1000,
        temperature: 0.3
    };

    const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    };

    try {
        console.log(`getReadAssistance: START request for assistanceRequest url: ${url}`);
        const response = await fetch(url, options);
        console.log('getReadAssistance: Response of assistanceRequest:', response);
        if (!response.ok) {
            console.error(`getReadAssistance: Error in assistanceRequest: response status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultData = await response.json();
        console.log('getReadAssistance: Result:', resultData);

        result = resultData.choices[0].message.content;
        console.log('getReadAssistance: Response Text:', result);
    } catch (error) {
        console.error('getReadAssistance: Error:', error);
        throw error;
    }

    return result;
}