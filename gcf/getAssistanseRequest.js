const fetch = require('node-fetch');

exports.assistanceRequest = async (req, res) => {
    //res.status(405).send('Not allowed');
    //return;

    console.log(`START assistanceRequest`);

    res.set('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow these methods
    res.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow these headers

    if (req.method === 'OPTIONS') {
        console.log(`OPTIONS method error assistanceRequest`);
        // Handle preflight requests
        res.set('Access-Control-Max-Age', '3600'); // Cache preflight response for 1 hour
        res.end();
        return;
    }

    var prompt = req.query.prompt;
    var theContent = req.query.content;
    console.log(`assistanceRequest original prompt:${prompt}, original content: ${theContent}`);

    if (!prompt) {
        prompt = 'Translate to english';
    }
    if (!theContent) {
        theContent = 'самолет';
    }
    console.log(`assistanceRequest processing prompt:${prompt}, processing content: ${theContent}`);

    // Input validation
    if (typeof prompt !== 'string' || typeof theContent !== 'string') {
        res.status(400).send(`Both prompt and theContent must be strings: ${typeof prompt}, ${typeof theContent}`);
        return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const data = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: theContent }
        ],
        max_tokens: 100,
        temperature: 0.7
    };

    const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    };

    try {
        console.log(`START request for assistanceRequest url: ${url}`);
        const response = await fetch(url, options);
        console.log('Response of assistanceRequest:', response);
        if (!response.ok) {
            console.error(`Error in assistanceRequest: response status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Result:', result);

        console.log('All Choices:', result.choices);
        result.choices.forEach((choice, index) => {
            console.log(`Choice ${index + 1}:`, choice.message.content);
        });

        // Access the translated text in the result variable
        const responseText = result.choices[0].message.content;
        console.log('Response Text:', responseText);
        res.status(200).send(responseText);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error.message);
    }
};
