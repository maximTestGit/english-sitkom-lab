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
                text = 'cat';//req.query.text ?? 'car';
                fromLanguage = req.query.fromlanguage ?? 'en';
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
async function getTranslation(text, fromLanguage, toLanguage) {
    try {
        const translator = new Translate();

        const [translation] = await translator.translate(text, {
            from: fromLanguage,
            to: toLanguage,
        });

        console.log(`getTranslation: Text: ${text}`);
        console.log(`getTranslation: Translation: ${translation}`);
        return translation;
    } catch (error) {
        console.error('Error translating:', error);
        throw error; // Re-throw the error for proper handling in the calling code
    }
}
