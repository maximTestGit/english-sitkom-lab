const admin = require('firebase-admin');

// Initialize Firestore
admin.initializeApp();
const db = admin.firestore();

exports.captionsSaveToStorage = async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow these methods
    res.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow these headers

    if (req.method === 'OPTIONS') {
        // Handle preflight requests
        res.set('Access-Control-Max-Age', '3600'); // Cache preflight response for 1 hour
        res.end();
        return;
    }

    try {
        console.log(`captionsSaveToStorage: request -------------------`)
        console.log(`captionsSaveToStorage: request body: ${req.body}`)
        console.log(`captionsSaveToStorage: request videoId: ${req.body.videoId}`)

        let videoId = req.body.videoId;
        let language = req.body.language;
        let user = req.body.user;
        let captions = req.body.captions;
        console.log(`captionsSaveToStorage: request videoId: ${videoId}, language:${language}, user: ${user}`);

        if (!videoId) {
            videoId = 'hgE9Nl8yTMs';
        }

        if (!language) {
            language = 'English';
        }

        if (!user) {
            user = 'guest';
        }

        if (!captions) {
            captions = '[{"start":"4.451","duration":"1.828","text":"I cant find garbage bags!!!!","videoId":"hgE9Nl8yTMs"},{"start":"6.303","duration":"2.167","text":" O! I think I saw some in here.","videoId":"hgE9Nl8yTMs"},{"start":"13.8","duration":"1.459","text":"What is it?","videoId":"hgE9Nl8yTMs"},{"start":"16.058","duration":"4.462","text":" I don&#39;t know. But maybe if we keep that drawer shut, it&#39;ll die.","videoId":"hgE9Nl8yTMs"},{"start":"21.326","duration":"3.049","text":"I can&#39;t believe we&#39;re living here.","videoId":"hgE9Nl8yTMs"}]';
        }

        console.log(`captionsSaveToStorage: input videoId: ${videoId}, language:${language}, user: ${user}`);
        const documentId = generateCaptionsDocumentId(videoId, language, user);
        const docRef = db.collection('videoCaptions').doc(documentId);


        await docRef.set({
            videoId,
            language,
            user,
            captions,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).send('Captions saved successfully');
    } catch (error) {
        console.error('captionsSaveToStorage: Error:', error);
        res.status(401).json({ error: error.message });
    }
}

function generateCaptionsDocumentId(videoId, language, user) {
    const result = `Captions-${videoId}-${language}-${user}`;
    return result;
}
