const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
//const db = admin.firestore();

exports.getWordAssstance = async (req, res) => {
    cors(req, res, async () => {
        console.log(`getWordAssstance: -----------------------------------------`);
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
            console.log(`getWordAssstance: Authenticated user: ${decodedToken.email}`);
            isUserAuthenticated = true;
        } else {
            console.log(`getWordAssstance: User is not Authenticated`);
            //res.status(401).send('Unauthorized');
        }

        try {
            var user;
            var theWord;
            var wordLanguage;
            var answerLanguage;
            var context;
            if (req.method === 'POST') {
                if (!isUserAuthenticated) {
                    res.status(401).send('Unauthorized');
                    return;
                }
                const requestBody = req.body;
                console.log('getWordAssstance: Request Body:', requestBody);
                theWord = requestBody.word;
                answerLanguage = requestBody.answerlanguage;
                wordLanguage = requestBody.wordlanguage;
                context = requestBody.context;
                user = requestBody.user;
            } else {
                theWord = 'ran';
                answerLanguage = 'Russian';
                wordLanguage = 'English';
                user = req.query.user;
            }

            console.log(`getWordAssstance: ${theWord}(${wordLanguage}) in ${answerLanguage}`);
            var answer = await getWordAssstanceAnswer(theWord, wordLanguage, answerLanguage);
            console.log(`getWordAssstance: ${theWord}(${wordLanguage}) in ${answerLanguage}: ${answer}`);
            res.status(200).send({ answer: answer });
        } catch (error) {
            console.error('getWordAssstance: Error:', error);
            res.status(500).send(error.message);
        }
    })
}
async function getWordAssstanceAnswer(theWord, wordLanguage, answerLanguage) {
    let result = '';
    const prompt =
        `You are a smart and experienced ${wordLanguage} teacher for ${answerLanguage} speaking students. ` +
        `You know everything about word formation in ${wordLanguage}. ` +
        `Given a ${wordLanguage} word, you will return the following information about it: ` +
        `- Translation of the word to ${answerLanguage}. ` +
        `- Root of the word, if relevant. ` +
        `- If it's a verb, then the infinitive form. ` +
        `- All forms of the word in ${wordLanguage}. ` +
        `- Several examples of the word usage in ${wordLanguage}. ` +
        `- link to Youglish.com to be opened in the other window in format "https://youglish.com/pronounce/${theWord}/${wordLanguage}". ` +
        `your answer must be in  ${answerLanguage}. ` +
        `It must be formatted as an HTML page! ` +
        `in case a line of text contans both left-to-right and right-to-left languages, ` +
        `the line must be splitted into two lines. ` +
        `your response must start with <!DOCTYPE html> tag and finish with </html> tag.`;

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    const theContent = theWord;
    console.log(`getWordAssstance::getWordAssstanceAnswer prompt: ${prompt}`);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const data = {
        model: 'gpt-4o',
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
        console.log(`getWordAssstance: START request for assistanceRequest url: ${url}`);
        const response = await fetch(url, options);
        console.log('getWordAssstance: Response of assistanceRequest:', response);
        if (!response.ok) {
            console.error(`getWordAssstance: Error in assistanceRequest: response status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultData = await response.json();
        console.log('getWordAssstance: Result:', resultData);

        result = resultData.choices[0].message.content;
        console.log('getWordAssstance: Response Text:', result);
    } catch (error) {
        console.error('getWordAssstance: Error:', error);
        throw error;
    }

    return result;
}