const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firestore
admin.initializeApp();
const db = admin.firestore();

functions.http('savePlaylistToRegistry', async (req, res) => {
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
                console.log(`savePlaylistToRegistry: Authenticated user: idToken: ${idToken}, ${decodedToken.email} id: ${decodedToken.uid}`);
                isUserAuthenticated = true;
            } else {
                console.log(`savePlaylistToRegistry: User is not Authenticated`);
                return res.status(401).send('Unauthorized');
            }

            // Verify that the request is a POST
            if (req.method !== 'POST') {
                return res.status(405).send('Method Not Allowed');
            }

            // Retrieve the data from the request body
            const { id, name, language, video } = req.body;

            if (!name || !language || !id) {
                return res.status(400).send('Missing playlist data');
            }

            // Save the playlist to Firestore
            let newEntry = {
                Name: name,
                Language: language,
                CreatedAt: admin.firestore.FieldValue.serverTimestamp(),
                CreatedBy: decodedToken.uid,
            };
            if (video) {
                newEntry.Video = video;
            }
            let playlistRef;

            playlistRef = db.collection('playlists').doc(id);

            await playlistRef.set(newEntry);

            console.log(`savePlaylistToRegistry: Playlist saved with ID: ${playlistRef.id}`);
            return res.status(201).send({ message: 'Playlist saved successfully', id: playlistRef.id });
        } catch (error) {
            if (error.code === 'auth/argument-error') {
                return res.status(401).send('Invalid token');
            }
            console.error('Error saving playlist:', error);
            return res.status(500).send(error.message);
        }
    });
});
