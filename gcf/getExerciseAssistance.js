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
            var exerciseData = await getExerciseData(theText, textLanguage, answerLanguage);
            console.log(`getExerciseAssistance: ${theText}(${textLanguage}) in ${answerLanguage}:`);
            console.log(JSON.stringify(exerciseData, null, 2)); // Log exerciseData in a readable format

            res.json({ answer: exerciseData });
        } catch (error) {
            console.error('getExerciseAssistance: Error:', error);
            res.status(500).send(error.message);
        }
    })
}

function getExerciseData(text, textLanguage, answerLanguage) {
    /*
  title: "string", // The title of the task or question
  correctMsg: "string", // A message displayed when the correct answer is chosen
  incorrectMsg: "string", // A message displayed when an incorrect answer is chosen
  checkBtn: "string" // Label or text for the check button
  */
    const promptFormatRequest =
        `Please generate a response in the following json format:
{
  "text": "string", // given text for the task
  "task": "string", // A description or prompt for the task, must be in a ${answerLanguage}, but contains original text in ${textLanguage}
  "options": ["string", "string", ...], // An array of possible answer options
  "correctInd": integer, // The index of the correct answer in the options array
}
The response should be structured exactly as shown above, with all fields populated.`;

    const exerciseTypes = [
        // 1. fill the blank
        `
1. Create a list of unique ${textLanguage} words from the given ${textLanguage} text.
2. Remove articles and names from the list and save it in shortList variable.
3. Find the number L, which is the length of the shortList.
4. Generate a random number N between 0 and (L-1).
5. Find the word at index N in shortList.
6. Generate an exercise where the student must choose the correct word from a list of words to fill in the blank in the original text.
7. Generate a random number K between 0 and 3.
8. The exercise should offer the student 4 options in ${textLanguage} as radioboxes to choose the correct answer.
The correct answer should be placed at position K.
`,
        // 2. translation of a word
        `
1. Create a list of unique ${textLanguage} words from the given ${textLanguage} text.
2. Remove articles and names from the list and save it in shortList variable.
3. Find the number L, which is the length of the shortList.
4. Generate a random number N between 0 and (L-1).
5. Find the word at index N in the shortList.
6. Generate an exercise where the student must choose the correct translation of the word in the context of the given text
   from a list of options. The word must be mentioned in the prompt.
7. Generate a random number K between 0 and 3.
8. The exercise should offer the student 4 options in ${answerLanguage} as radioboxes to choose the correct answer.
The correct answer should be placed at position K.`,
        // 3. text translation
        //         `
        // 1. Create a variable A containing the correct translation of the original text from ${textLanguage} to ${answerLanguage}.
        // 2. Generate 3 incorrect translations.
        // Introduce errors or variations into the correct translation to create plausible but incorrect options.
        // Consider using techniques like grammatical errors, or mistranslations of specific phrases.
        // 3. Generate an exercise where the student is provided with the original ${textLanguage} text and
        // must select the correct ${answerLanguage} translation of the original ${textLanguage} text.
        // This involves creating a multiple-choice question format.
        // 4. Generate a random number K between 0 and 3.
        // This will determine the position of the correct answer among the options.
        // 5. The exercise should offer the student 4 options as radioboxes to choose from.
        // 6. Include the correct translation (A) at position K and the 3 incorrect translations in the remaining positions.
        // The correct answer should be placed at position K.
        // Ensure that the correct answer is consistently placed at the randomly generated position.
        // `,
        // 4. modified text translation
        //         `
        // 1. Slightly change the given text
        // 2. Create a variable A containing the correct translation of the changed text from ${textLanguage} to ${answerLanguage}.
        // 3. Generate 3 incorrect translations.
        // Introduce errors or variations into the correct translation to create plausible but incorrect options.
        // Consider using techniques like grammatical errors, or mistranslations of specific phrases.
        // 4. Generate an exercise where the student is provided with the modified ${textLanguage} text from p.1 and
        // must select the correct ${answerLanguage} translation of the modified in p.1 ${textLanguage} text.
        // This involves creating a multiple-choice question format.
        // 5. Generate a random number K between 0 and 3.
        // This will determine the position of the correct answer among the options.
        // 6. The exercise should offer the student 4 options as radioboxes to choose from.
        // 7. Include the correct translation (A) at position K and the 3 incorrect translations in the remaining positions.
        // The correct answer should be placed at position K.
        // Ensure that the correct answer is consistently placed at the randomly generated position.`,
    ];
    const ind = Math.round(Math.random() * exerciseTypes.length);
    console.log(`getExerciseAssistance: exerciseTypes[${ind}]`);
    const correctPos = Math.round(Math.random() * 3);

    const prompt =
        `Please create a data for a multiple choice exercise for a ${answerLanguage} speaking student ` +
        `based on a given ${textLanguage} text. ` +
        `the exercise should be created according for the following algorithm: ${exerciseTypes[ind]}. ` +
        //`The correct answer should be an options at position ${correctPos}. ` +
        `The exercise should be in the following structured format: ${promptFormatRequest}. ` +
        `Also add correctMsg parameter as "Correct" in ${answerLanguage}. ` +
        `incorrectMsg parameter as "Incorrect" in ${answerLanguage}, ` +
        ` and checkBtn parameter as "Check Answer" in ${answerLanguage}.`;
    const content = text;
    // const model = 'gpt-4o';
    // const maxTokens = 1000;
    // const temperature = 0.5;
    const exerciseData = assistantRequest(prompt, content);
    return exerciseData;
}

async function assistantRequest(prompt, content, model = 'gpt-4o', maxTokens = 1000, temperature = 0.5) {
    console.log(`getExerciseAssistance: running Prompt: ${prompt}`);

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    console.log(`getExerciseAssistance: running theContent: ${content}`);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const data = {
        model: model,
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Process the following text: "${content}"` }
        ],
        max_tokens: maxTokens,
        temperature: temperature
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
