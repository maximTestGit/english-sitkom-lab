const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
const db = admin.firestore();

exports.createFlashcard = async (req, res) => {
    cors(req, res, async () => {
        // #region standard CORS headers
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type',
        });

        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Max-Age', '3600');
            return res.end();
        }
        // #endregion standard CORS headers

        const authHeader = req.header('Authorization');
        const idToken = authHeader?.split('Bearer ')?.[1];
        let decodedToken;
        try {
            if (idToken) {
                decodedToken = await admin.auth().verifyIdToken(idToken);
                console.log(`createFlashcard: Authenticated user: idToken: ${idToken}, ${decodedToken.email} id: ${decodedToken.uid}`);
                isUserAuthenticated = true;
            } else {
                console.log(`createFlashcard: User is not Authenticated`);
                return res.status(401).send('Unauthorized');
            }

            // Verify that the request is a POST
            if (req.method !== 'POST') {
                return res.status(405).send('Method Not Allowed');
            }

            const { frontLanguage, backLanguage, front, back, videoId, seconds, duration, collection } = req.body;
            const { docRef, flashcard } = await createFlashcardEntry(decodedToken.uid, frontLanguage, backLanguage, front, back, videoId, seconds, duration, collection);

            res.status(200).send({id: docRef.id, card: flashcard});
            console.log(`createFlashcard: Flashcard created successfully ${docRef.id} frontLanguage:${frontLanguage} front: ${front} back: ${back}`);
        } catch (error) {
            console.error('createFlashcard: Error:', error);
            res.status(401).json({ error: error.message });
        }
    });
};

async function createFlashcardEntry(userId, frontLanguage, backLanguage, front, back, videoId, seconds, duration, collection = 'default') {
    const flashcard = {
        userId,
        frontLanguage,
        backLanguage,
        front,
        back,
        box: 1,
        nextReview: calculateNextReview(1),
        created: new Date(),
        lastReviewed: null,
        videoId,
        seconds,
        duration,
        collection,
    };

    console.log('createFlashcardEntry: adding flashcard:', flashcard);
    const docRef = await db.collection('flashcards').add(flashcard);
    return { docRef, flashcard };
}

function calculateNextReview(boxNumber) {
    const today = new Date();
    switch (boxNumber) {
        case 1: return new Date(today.setDate(today.getDate() + 1));  // 1 day
        case 2: return new Date(today.setDate(today.getDate() + 3));  // 3 days
        case 3: return new Date(today.setDate(today.getDate() + 7));  // 1 week
        case 4: return new Date(today.setDate(today.getDate() + 14)); // 2 weeks
        case 5: return new Date(today.setDate(today.getDate() + 30)); // 1 month
        default: return new Date(today.setDate(today.getDate() + 1));
    }
}


