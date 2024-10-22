const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
//const db = admin.firestore();

exports.getTextAssistance = async (req, res) => {
    cors(req, res, async () => {
        console.log(`getTextAssistance: -----------------------------------------`);
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
            console.log(`getTextAssistance: Authenticated user: ${decodedToken.email}`);
            isUserAuthenticated = true;
        } else {
            console.log(`getTextAssistance: User is not Authenticated`);
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
                console.log('getTextAssistance: Request Body:', requestBody);
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

            console.log(`getTextAssistance: ${theText}(${textLanguage}) in ${answerLanguage}`);
            var answer = await getTextAssistanceAnswer(theText, textLanguage, answerLanguage);
            console.log(`getTextAssistance: ${theText}(${textLanguage}) in ${answerLanguage}: ${answer}`);
            res.status(200).json({ answer: answer });
        } catch (error) {
            console.error('getTextAssistance: Error:', error);
            res.status(500).send(error.message);
        }
    })
}
async function getTextAssistanceAnswer(theText, textLanguage, answerLanguage) {
    let result = '';
    const prompt =
        `Analyze the following text for a student learning ${textLanguage}, ` +
        `whose native language is ${answerLanguage}. ` +
        `Provide translation to ${answerLanguage}, a breakdown of vocabulary, grammar structures, and usage. ` +
        `Additionally, highlight key phrases or idioms.` +
        `Your response should be in ${answerLanguage}.` +
        `Your answer must contain an HTML page only! ` +
        //`without any presentations, comments or explanations.` +
        //`it must be located in the center of the screen and 
        `it must have a border. ` +
        `in case a line of text contans both left-to-right and right-to-left languages, ` +
        `the line must be splitted into two lines. ` +
        `your answer must start with <!DOCTYPE html> tag and finish with </html> tag.`;

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    const theContent = theText;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    console.log(`getTextAssistance::getTextAssistanceAnswer prompt: ${prompt}`);
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
        console.log(`getTextAssistance: START request for assistanceRequest url: ${url}`);
        const response = await fetch(url, options);
        console.log('getTextAssistance: Response of assistanceRequest:', response);
        if (!response.ok) {
            console.error(`getTextAssistance: Error in assistanceRequest: response status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultData = await response.json();
        console.log('getTextAssistance: Result:', resultData);

        result = resultData.choices[0].message.content;
        console.log('getTextAssistance: Response Text:', result);
    } catch (error) {
        console.error('getTextAssistance: Error:', error);
        throw error;
    }

    return result;
}