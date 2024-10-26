const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
const db = admin.firestore();

exports.updateFlashcardResult = async (req, res) => {
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
                console.log(`updateFlashcardResult: Authenticated user: idToken: ${idToken}, ${decodedToken.email} id: ${decodedToken.uid}`);
                isUserAuthenticated = true;
            } else {
                console.log(`updateFlashcardResult: User is not Authenticated`);
                return res.status(401).send('Unauthorized');
            }

            // Verify that the request is a POST
            if (req.method !== 'POST') {
                return res.status(405).send('Method Not Allowed');
            }

            const { flashcardId, correct } = req.body;

            if (!flashcardId) {
                return res.status(400).json({ error: 'Flashcard ID is required' });
            }
            const { docRef, flashcard } = await updateFlashcardResultEntry(flashcardId, correct);
            res.status(200).send({ id: docRef.id, card: flashcard });
            console.log(`updateFlashcardResult: Flashcard created successfully ${docRef.id} frontLanguage:${frontLanguage} front: ${front} back: ${back}`);
        } catch (error) {
            console.error('updateFlashcardResult: Error:', error);
            res.status(401).json({ error: error.message });
        }
    });
};

async function updateFlashcardResultEntry(flashcardId, correct) {
    console.log('updateFlashcardResultEntry: updating result for flashcardId:', flashcardId);
    const docRef = db.collection('flashcards').doc(flashcardId);
    const flashcard = await docRef.get();

    if (!flashcard.exists) {
        throw error('Flashcard not found');
    }

    const currentBox = flashcard.data().box;
    let newBox;

    if (correct) {
        // Move to next box if correct (max box is 5)
        newBox = Math.min(currentBox + 1, 5);
    } else {
        // Move back to box 1 if incorrect
        newBox = 1;
    }

    await docRef.update({
        box: newBox,
        nextReview: calculateNextReview(newBox),
        lastReviewed: new Date()
    });
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


