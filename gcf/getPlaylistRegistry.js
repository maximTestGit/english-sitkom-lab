const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
const db = admin.firestore();

functions.http('getPlaylistRegistry', async (req, res) => {
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

        let isUserAuthenticated = false;
        const authHeader = req.header('Authorization');
        const idToken = authHeader?.split('Bearer ')?.[1];

        try {
            if (idToken) {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                console.log(`getPlaylistRegistry: Authenticated user: ${decodedToken.email}`);
                isUserAuthenticated = true;
            } else {
                console.log(`getPlaylistRegistry: User is not Authenticated`);
            }

            var language;
            if (req.method === 'POST') {
                const requestBody = req.body;
                language = requestBody.language;
            } else {
                language = req.query.language;
            }
            console.log(`getPlaylistRegistry: request language:${language}`);

            if (!language) {
                language = "English"
            }
            console.log(`getPlaylistRegistry: process language:${language}`);

            const playlistRegistry = await fetchPlaylistRegistry(language);
            return res.send(playlistRegistry);
        } catch (error) {
            if (error.code === 'auth/argument-error') {
                return res.status(401).send('Invalid token');
            }
            console.error('Error during request:', error);
            return res.status(500).send(error.message);
        }
    });
});

async function fetchPlaylistRegistry(language) {
    console.log(`getPlaylistRegistry: fetchPlaylistRegistry language: ${language}`);
    let result = [];

    const collectionRef = db.collection('playlists');
    const snapshot = await collectionRef.where('Language', '==', language).get();

    if (snapshot.empty) {
        console.log('No matching documents.');
        return result;
    }

    snapshot.forEach(doc => {
        result.push({
            listId: doc.id,
            listName: doc.data().Name,
            language: doc.data().Language,
            video: doc.data().Video,
        });
    });

    return result;
}

