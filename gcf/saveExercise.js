const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors')({ origin: true });

exports.saveExercise = async (req, res) => {
    cors(req, res, async () => {

        res.set('Access-Control-Allow-Origin', '*'); // Allow all origins
        res.set('Access-Control-Allow-Methods', 'POST'); // Allow only POST method
        res.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header

        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed'); // Respond with error for non-POST requests
            return;
        }

        try {
            console.log(`saveExercise: request body: ${req.body}`)
            const parsedBody = JSON.parse(req.body);
            let folder = parsedBody.folder;
            let file = parsedBody.file;
            let data = parsedBody.data;

            console.log(`saveExercise: request folder: ${folder}`);
            console.log(`saveExercise: request file: ${file}`);

            if (!data) {
                console.log('ERROR: Missing required field: data');
                res.status(400).send('Missing required field: data'); // Respond with error for missing data
                return;
            }

            const storage = new Storage();
            const bucketName = 'exercise-lingflix-bucket';

            const filePath = `${folder}/${file}`;
            console.log(`saveExercise data: ${data}`)

            // Upload the data to the file
            await storage.bucket(bucketName).file(filePath).save(data);
            console.log(`File saved successfully: ${filePath}`);

            res.status(200).send('File saved successfully'); // Send success response
        } catch (error) {
            console.error('Error saving file:', error);
            res.status(500).send('Internal Server Error'); // Send generic error response
        }
    })
}
