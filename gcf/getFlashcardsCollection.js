const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
const db = admin.firestore();

exports.getFlashcardsCollection = async (req, res) => {
    cors(req, res, async () => {

        console.log(`fetchCaptions: +++++++++++++++++++++++++++++++++++++`);
        res.set('Access-Control-Allow-Origin', '*'); // Allow all origins
        res.set('Access-Control-Allow-Methods', 'GET, POST'); // Allow these methods
        res.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow these headers

        if (req.method === 'OPTIONS') {
            // Handle preflight requests
            res.set('Access-Control-Max-Age', '3600'); // Cache preflight response for 1 hour
            res.end();
            return;
        }

        try {
            console.log(`fetchCaptions: -----------------------------------------`);
            let isUserAuthenticated = false;
            const authHeader = req.header('Authorization');
            const idToken = authHeader?.split('Bearer ')?.[1];
            let decodedToken;

            if (idToken) {
                decodedToken = await admin.auth().verifyIdToken(idToken);
                console.log(`Authenticated user: ${decodedToken.email}`);
                isUserAuthenticated = true;
            } else {
                console.log(`User is not Authenticated`);
            }

            let collectionName;
            let language;
            let collection;
            let top;
            if (req.method === 'POST') {
                const requestBody = req.body;
                console.log('getFlashcardsCollection: Request Body:', requestBody);
                collectionName = requestBody.collectionName;
                language = requestBody.language;
                top = requestBody.top;
            }
            collection = await fetchFlashcardsCollection(collectionName, language, decodedToken.uid, top);
            if (collection) {
                console.log('getFlashcardsCollection: collection found');
                console.log('', JSON.stringify(collection));
                res.send({ collection });
            } else {
                console.log('getFlashcardsCollection: No collection found');
                res.status(404).json({ error: 'No collection found' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send(error.message);
        }
    }
    )
}

function fetchFlashcardsCollection(collectionName, language, userId, top = undefined) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(`fetchFlashcardsCollection: collectionName: ${collectionName} language: ${language} userId: ${userId} top: ${top ?? 'undefined'}`);
            let collectionRef =
                db.collection('flashcards')
                    .where('userId', '==', userId)
                    .where('collection', '==', collectionName)
                    .where('frontLanguage', '==', language)
                    .orderBy('nextReview');
            if (top) {
                collectionRef = collectionRef
                    .limit(top);
            }
            const snapshot = await collectionRef.get();
            if (snapshot.empty) {
                console.log('No matching documents.');
                resolve(null);
            } else {
                let collection = [];
                snapshot.forEach(doc => {
                    let flashcard = doc.data();
                    flashcard.cardId = doc.id; // Add document ID to flashcard
                    console.log('fetchFlashcardsCollection: adding flashcard:', flashcard);
                    collection.push(flashcard);
                });
                resolve(collection);
            }
        } catch (error) {
            console.error('Error:', error);
            reject(error);
        }
    });
}