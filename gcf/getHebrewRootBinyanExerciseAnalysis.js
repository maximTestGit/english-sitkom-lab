const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
//const db = admin.firestore();

exports.getHebrewRootBinyanExerciseAnalysis = async (req, res) => {
    cors(req, res, async () => {
        console.log(`getHebrewRootBinyanExerciseAnalysis: -----------------------------------------`);
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
            console.log(`getHebrewRootBinyanExerciseAnalysis: Authenticated user: ${decodedToken.email}`);
            isUserAuthenticated = true;
        } else {
            console.log(`getHebrewRootBinyanExerciseAnalysis: User is not Authenticated`);
            //res.status(401).send('Unauthorized');
        }

        try {
            var user, hebrewText, userLanguage, userInput;
            if (req.method === 'POST') {
                if (!isUserAuthenticated) {
                    res.status(401).send('Unauthorized');
                    return;
                }
                const requestBody = req.body;
                console.log('getHebrewRootBinyanExerciseAnalysis,js: Request Body:', requestBody);
                user = requestBody.user;
                hebrewText = requestBody.hebrewText;
                userLanguage = requestBody.userLanguage;
                userInput = requestBody.userInput;
            } else {
                hebrewText = `דני כותב סיפור על חתול. החתול משחק בגינה. דני שמח כשהוא כותב.`;
                userLanguage = 'Russian';
                userInput = 'Дани пишет рассказ о коте. Кот играет в саду. Дани счастлив, когда он пишет.';
            }

            console.log(`getHebrewRootBinyanExerciseAnalysis: user: root: ${user}, hebrewText: ${hebrewText}, userLanguage: ${userLanguage}, userInput: ${userInput}`);
            var exerciseData = await getHebrewRootBinyanExerciseAnalysisData(hebrewText, userLanguage, userInput);
            console.log(exerciseData); // Log exerciseData in a readable format

            res.send({ "analysis": exerciseData });
        } catch (error) {
            console.error('getHebrewRootBinyanExerciseAnalysis: Error:', error);
            res.status(500).send(error.message);
        }
    })
}

async function getHebrewRootBinyanExerciseAnalysisData(hebrewText, userLanguage, userInput) {

    const prompt =
        `    Analyze the translation of the following Hebrew text provided by the user. The Hebrew text is: "${hebrewText}". The user's translation input is: "${userInput}". 
    Provide a concise analysis of the translation in the user's specified language: "${userLanguage}". 
    Return only one string containing the analysis in ${userLanguage}, with no additional details or explanations.
    `;
    const systemRole = 'You are an expert Hebrew language teacher and curriculum developer specializing in creating engaging and effective Hebrew learning materials. Your expertise spans all levels of Hebrew proficiency, from beginners to advanced learners. You have a deep understanding of Hebrew grammar, vocabulary, idiomatic expressions, and cultural context'
    const result = await assistantRequest(systemRole, prompt);
    return result;
}

async function assistantRequest(prompt, content, model = 'gpt-4o', maxTokens = 1000, temperature = 0.5) {
    console.log(`getExerciseAssistance: running Prompt: ${prompt}`);
    let result = null;
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
