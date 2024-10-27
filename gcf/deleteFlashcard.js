const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
const db = admin.firestore();

exports.deleteFlashcard = async (req, res) => {
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
                console.log(`deleteFlashcard: Authenticated user: idToken: ${idToken}, ${decodedToken.email} id: ${decodedToken.uid}`);
                isUserAuthenticated = true;
            } else {
                console.log(`deleteFlashcard: User is not Authenticated`);
                return res.status(401).send('Unauthorized');
            }

            // Verify that the request is a POST
            if (req.method !== 'POST') {
                return res.status(405).send('Method Not Allowed');
            }

            const { cardId } = req.body;

            if (!cardId) {
                return res.status(400).json({ error: 'Flashcard ID is required' });
            }
            await deleteFlashcardEntry(cardId);
            res.status(200).send({ id: cardId });
            console.log(`deleteFlashcard: Flashcard deleted successfully ${cardId}`);
        } catch (error) {
            console.error('deleteFlashcard: Error:', error);
            res.status(401).json({ error: error.message });
        }
    });
};

async function deleteFlashcardEntry(flashcardId) {
    console.log(`deleteFlashcardEntry: deleting flashcardId: ${flashcardId}`);
    const docRef = db.collection('flashcards').doc(flashcardId);
    const flashcard = await docRef.get();

    if (!flashcard.exists) {
        throw error('Flashcard not found');
    }

    await docRef.delete();

    return;
}
