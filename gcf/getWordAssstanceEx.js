const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
//const db = admin.firestore();

exports.getWordAssstanceEx = async (req, res) => {
    cors(req, res, async () => {
        console.log(`getWordAssstanceEx: -----------------------------------------`);
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
            console.log(`getWordAssstanceEx: Authenticated user: ${decodedToken.email}`);
            isUserAuthenticated = true;
        } else {
            console.log(`getWordAssstanceEx: User is not Authenticated`);
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
                console.log('getWordAssstanceEx: Request Body:', requestBody);
                theWord = requestBody.word;
                answerLanguage = requestBody.answerlanguage;
                wordLanguage = requestBody.wordlanguage;
                context = requestBody.context;
                user = requestBody.user;
            } else {
                theWord = 'לומדה';
                context = 'היא לומדה ספרדית.';
                answerLanguage = 'Russian';
                wordLanguage = 'Hebrew';
                user = req.query.user;
            }

            console.log(`getWordAssstanceEx: ${theWord}(${wordLanguage}) in ${answerLanguage} in context: ${context}`);
            var answer = await getWordAssstanceEx(theWord, wordLanguage, answerLanguage, context);
            console.log(`getWordAssstanceEx: ${theWord}(${wordLanguage}) in ${answerLanguage}: ${answer}`);
            res.status(200).send({ answer: answer });
        } catch (error) {
            console.error('getWordAssstanceEx: Error:', error);
            res.status(500).send(error.message);
        }
    })
}
async function getWordAssstanceEx(theWord, wordLanguage, answerLanguage, context) {
    if (wordLanguage === 'Hebrew') {
        return await getWordAssstanceHebrew(theWord, wordLanguage, answerLanguage, context);
    } else {
        return await getWordAssstanceAnswer(theWord, wordLanguage, answerLanguage, context);
    }
}


async function getWordAssstanceAnswer(theWord, wordLanguage, answerLanguage, context) {
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
    console.log(`getWordAssstanceEx::getWordAssstanceAnswer prompt: ${prompt}`);

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
        console.log(`getWordAssstanceEx: START request for assistanceRequest url: ${url}`);
        const response = await fetch(url, options);
        console.log('getWordAssstanceEx: Response of assistanceRequest:', response);
        if (!response.ok) {
            console.error(`getWordAssstanceEx: Error in assistanceRequest: response status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultData = await response.json();
        console.log('getWordAssstanceEx: Result:', resultData);

        result = resultData.choices[0].message.content;
        console.log('getWordAssstanceEx: Response Text:', result);
    } catch (error) {
        console.error('getWordAssstanceEx: Error:', error);
        throw error;
    }

    return result;
}

async function getWordAssstanceHebrew(theWord, wordLanguage, answerLanguage, context) {
    let result = '';
    //const { root, partOfSpeech, binyan } = await getHebrewWordInfo(theWord);
    result = await getHebrewWordInfo(theWord, wordLanguage, answerLanguage, context);

    /*if (partOfSpeech === 'verb') {
        result = await getVerbAssstanceHebrew(theWord, root, binyan);
    } else if (partOfSpeech === 'noun') {
        result = await getNounAssstanceHebrew(theWord, root, binyan);
    } else {
        result = await getOtherAssstanceHebrew(theWord, root, binyan);
    }
    */

    return result;
}

async function getHebrewWordInfo(theWord, wordLanguage, answerLanguage, context) {
    let result = '';
    const prompt =
        `You are a smart and experienced ${wordLanguage} teachers. ` +
        `You know everything about word formation in ${wordLanguage}. ` +
        `For the word ${theWord} in the sentence ${context}, give me the following information: ` +
        `- Root of the word ` +
        `- Part of speech of the word.` +//, give priority  vetorb. ` +
        `- If it's a verb, then the binyan, empty string if not. ` +
        `your answer must be formated as json string {root, partOfSpeech, binyan}. ` +
        `your response must contain only the json string. `;

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    const theContent = theWord;
    console.log(`getWordAssstanceEx::getWordAssstanceAnswer prompt: ${prompt}`);

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
        console.log(`getWordAssstanceEx: START request for assistanceRequest url: ${url}`);
        const response = await fetch(url, options);
        console.log('getWordAssstanceEx: Response of assistanceRequest:', response);
        if (!response.ok) {
            console.error(`getWordAssstanceEx: Error in assistanceRequest: response status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultData = await response.json();
        console.log('getWordAssstanceEx: Result:', resultData);

        result = resultData.choices[0].message.content;
        console.log('getWordAssstanceEx: Response Text:', result);
    } catch (error) {
        console.error('getWordAssstanceEx: Error:', error);
        throw error;
    }

    return result;
}
