const { Translate } = require('@google-cloud/translate');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
//const db = admin.firestore();

exports.getTranslation = async (req, res) => {
    cors(req, res, async () => {
        console.log(`getTranslation: -----------------------------------------`);
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
            console.log(`getTranslation: Authenticated user: ${decodedToken.email}`);
            isUserAuthenticated = true;
        } else {
            console.log(`getTranslation: User is not Authenticated`);
            //res.status(401).send('Unauthorized');
        }

        try {
            var user;
            var text;
            var fromLanguage;
            var toLanguage;
            if (req.method === 'POST') {
                if (!isUserAuthenticated) {
                    res.status(401).send('Unauthorized');
                    return;
                }
                const requestBody = req.body;
                console.log('getTranslation: Request Body:', requestBody);
                text = requestBody.text;
                fromLanguage = requestBody.fromlanguage;
                toLanguage = requestBody.tolanguage;
                user = requestBody.user;
            } else {
                text = 'קורה';//req.query.text ?? 'car';
                fromLanguage = req.query.fromlanguage ?? 'he';
                toLanguage = req.query.tolanguage ?? 'ru';
                user = req.query.user;
            }

            console.log(`getTranslation: ${text} from ${fromLanguage} to ${toLanguage}`);
            var translation = await getTranslation(text, fromLanguage, toLanguage);
            console.log(`getTranslation: ${text} from ${fromLanguage} to ${toLanguage}: ${translation}`);
            res.status(200).json({ translation });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send(error.message);
        }
    })
}
async function getTranslation(theText, fromLanguage, toLanguage) {
    let result = '';
    const prompt =
        `translate the text from ${fromLanguage} to ${toLanguage}, ` +
        `your answer must contain nothing but translated text.`;

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    const theContent = theText;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    console.log(`getTranslation prompt: ${prompt}`);
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
        console.log(`getTranslation: START request for assistanceRequest url: ${url}`);
        const response = await fetch(url, options);
        console.log('getTranslation: Response of assistanceRequest:', response);
        if (!response.ok) {
            console.error(`getTranslation: Error in assistanceRequest: response status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultData = await response.json();
        console.log('getTranslation: Result:', resultData);

        result = resultData.choices[0].message.content;
        console.log('getTranslation: Response Text:', result);
    } catch (error) {
        console.error('getTranslation: Error:', error);
        throw error;
    }

    return result;
}