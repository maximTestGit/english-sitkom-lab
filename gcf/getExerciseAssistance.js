const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
//const db = admin.firestore();

exports.getTextExerciseAssistance = async (req, res) => {
    cors(req, res, async () => {
        console.log(`getExerciseAssistance: -----------------------------------------`);
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
            console.log(`getExerciseAssistance: Authenticated user: ${decodedToken.email}`);
            isUserAuthenticated = true;
        } else {
            console.log(`getExerciseAssistance: User is not Authenticated`);
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
                console.log('getExerciseAssistance: Request Body:', requestBody);
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

            console.log(`getExerciseAssistance: ${theText}(${textLanguage}) in ${answerLanguage}`);
            var answer = await getExerciseAssistanceAnswer(theText, textLanguage, answerLanguage);
            console.log(`getExerciseAssistance: ${theText}(${textLanguage}) in ${answerLanguage}: ${answer}`);
            res.status(200).send({ answer: answer });
        } catch (error) {
            console.error('getExerciseAssistance: Error:', error);
            res.status(500).send(error.message);
        }
    })
}
async function getExerciseAssistanceAnswer(theText, textLanguage, answerLanguage, promptLanguage = 'English') {
    let result = '';
    const exerciseTypes = [
        `Original Text Completion of a rundom word in starting part of text in ${textLanguage} ` +
        `giving four options of the word in ${textLanguage} as radioboxes`,

        `Original Text Completion of a rundom word in ending part of text in ${textLanguage} ` +
        `giving four options of the word in ${textLanguage} as radioboxes`,

        `Multiple Choice for translating the whole text ` +
        `giving four options in ${answerLanguage} as radioboxes`,

        `Multiple Choice for translating a random 2-3 words expression from the starting part of the text ` +
        `giving four options of translation in ${answerLanguage} as radioboxes`,

        `Multiple Choice for translating a random 2-3 words expression from the ending part of the text ` +
        `giving four options of translation in ${answerLanguage} as radioboxes`,

        `Multiple Choice for translating a random ${textLanguage} word from the starting part of the text ` +
        `giving four options in ${answerLanguage} as radioboxes`,

        `Multiple Choice for translating a random ${textLanguage} word from the ending part of the text ` +
        `giving four options in ${answerLanguage} as radioboxes`,

        `Multiple choice for ${answerLanguage} word equavalent of a random words from the starting part of the text,` +
        `giving four options in ${textLanguage} as radioboxes`,

        `Multiple choice for ${answerLanguage} word equavalent of a random words from the ending part of the text` +
        `giving four options in ${textLanguage} as radioboxes`,

        //`Multiple choice ${answerLanguage} translation of a random ${textLanguage} word from the starting part of the text ` +
        //`giving four options in ${answerLanguage} as radioboxes`,

        `Multiple Choice for translation of the slightly modified starting part of the original text ` +
        `giving four options in ${answerLanguage} of translation as radioboxes`,

        `Multiple Choice for translation of the slightly modified ending part of the original text ` +
        `giving four options in ${answerLanguage} of translation as radioboxes`,

    ];
    const ind = Math.round(Math.random() * exerciseTypes.length);
    const exerciseType = exerciseTypes[ind];
    console.log(`getExerciseAssistance: Exercise_type(${ind}): ${exerciseType}`);
    const prompt =
        `You are an experienced ${textLanguage} language teacher and methodologist ` +
        `with deep HTML and JavaScript knowledge. ` +
        `Given some ${textLanguage} text or word, you can create a single random interactive exercise ` +
        `using HTML and JavaScript for ${answerLanguage} speaking students learning ${textLanguage}. ` +
        `Requirements for an exercise: ` +
        `- Exercise type: ${exerciseType}. ` +
        `- It presents a student with a task. ` +
        `- It suggests a few options for a student to answer. ` +
        `- Only one of these options is correct. ` +
        `- It checks if the student's answer is correct. ` +
        `- The task must be formulated in ${answerLanguage}. ` +
        `Your answer must contain an HTML page only! without any presentations, comments or explanations.` +
        `input form must be located in the center of the screen and have a border. ` +
        `in case a line of text contans both left-to-right and right-to-left languages, the line must be splitted into two lines. ` +
        `your answer must start with <!DOCTYPE html> tag and finish with </html> tag.` +
        `you estimation if the answer is correct must appear right below the input form.` +
        `if a user answered correctly your message must be green, otherwise it must be red.`;
    console.log(`getExerciseAssistance: running Prompt: ${prompt}`);

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    const theContent = theText;
    console.log(`getExerciseAssistance: running theContent: ${theContent}`);

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
        temperature: 0.7
    };

    const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    };

    try {
        console.log(`getExerciseAssistance: START request for assistanceRequest url: ${url}`);
        const response = await fetch(url, options);
        console.log('getExerciseAssistance: Response of assistanceRequest:', response);
        if (!response.ok) {
            console.error(`getExerciseAssistance: Error in assistanceRequest: response status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultData = await response.json();
        console.log('getExerciseAssistance: Result:', resultData);

        result = resultData.choices[0].message.content;
        console.log('getExerciseAssistance: Response Text:', result);
    } catch (error) {
        console.error('getExerciseAssistance: Error:', error);
        throw error;
    }

    return result;
}
