const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize Firestore
admin.initializeApp();
//const db = admin.firestore();

const anthropic = new Anthropic({
    apiKey: process.env.OPENAI_API_KEY,
});

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
        `Original Text Completion of a rundom word in ${textLanguage}, ` +
        //`for example: if the text is "The quick brown fox jumps over the lazy dog" the exercise is asking ` +
        //`to complete the word "Быстрая коричневая лиса перепрыгивает через ленивую __" `+
        `giving four options in Russian as radioboxes`,
        `Multiple Choice for translating the whole text giving four options as radioboxes`,
        `Multiple Choice for translating a random 2-3 words expression from the text, ` +
        //`for example: The exercise is asking which Hebrew expression means "good morning" `+
        `giving four options in Hebrew as radioboxes`,
        //`Multiple Choice for translating a random word from the text`,
        `Multiple choice for tense, person, and number of a random word from the text, ` +
        //`for example: if the text is "The quick brown fox jumps over the lazy dog" the exercise is asking what form of the verb "jumps" is used `+
        `giving four options in English as radioboxes`,
        `Multiple choice for ${answerLanguage} word equavalent of a random words from the text,` +
        //`for example: The exercise is asking which Hebrew word means "cups" `+
        `giving four options in Hebrew as radioboxes`,
        `Multiple choice for ${textLanguage} word equavalent of a random ${answerLanguage} words from the text translation, ` +
        //`for example: The exercise is asking which English word means "чашки" `+
        `giving four options in English as radioboxes`,
        `Multiple Choice for translating the slightly modified text, ` +
        //`for example: if the text is "The quick brown fox jumps over the lazy dog" the exercise is asking to translate "The quick brown fox jumps over the fat cat" `+
        `giving four options in English as radioboxes`,
    ];
    let ind = Math.random();
    const exerciseType = exerciseTypes[Math.floor(ind * exerciseTypes.length)];
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
        `Your answer must contain an HTML page only.`;
    console.log(`getExerciseAssistance: running Prompt: ${prompt}`);


    const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [
            {
                role: "system",
                content: prompt
            },
            {
                role: "user",
                content: theText
            }
        ],
        temperature: 0.5,
    });

    return message.content[0].text;
}
