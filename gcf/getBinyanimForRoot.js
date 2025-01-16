const functions = require('@google-cloud/functions-framework');
const { JSDOM } = require('jsdom'); //  "dependencies": { "jsdom": "^25.0.1" },
const fetch = require('node-fetch'); // Ensure you have this library for making HTTP requests
const cors = require('cors')({ origin: true });
const adminFB = require('firebase-admin');
const { Translate } = require('@google-cloud/translate').v2;// "@google-cloud/translate": "^8.5.0"
// Initialize Firestore
adminFB.initializeApp();
// Instantiate translate client
const translate = new Translate();

const binyan = {
    cal: 0,
    nifal: 10,
    piel: 20,
    puel: 30,
    hifil: 40,
    hufal: 50,
    hitpael: 60
};
const tense = {
    present: 'present',
    past: 'past',
    future: 'future',
    //imperative: 30
};

functions.http('getBinyanByRoot', async (req, res) => {
    cors(req, res, async () => {
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type',
        });

        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Max-Age', '3600');
            return res.end();
        }

        let isUserAuthenticated = false;
        const authHeader = req.header('Authorization');
        const idToken = authHeader?.split('Bearer ')?.[1];

        try {
            if (idToken) {
                const decodedToken = await adminFB.auth().verifyIdToken(idToken);
                console.log(`getBinyanim: Authenticated user: ${decodedToken.email}`);
                isUserAuthenticated = true;
            } else {
                console.log(`getBinyanim: User is not Authenticated`);
            }
            const theRoot = req.method === 'POST' ?
                req.body.root : req.query.root || "כתב";
            const theBinyan = req.method === 'POST' ?
                req.body.binyan : req.query.binyan || binyan.cal;
            const theTense = req.method === 'POST' ?
                req.body.tense : req.query.tense || tense.past;
            const toLanguage = req.method === 'POST' ?
                req.body.toLanguage : req.query.toLanguage || 'Russian';
            const fromLanguage = 'Hebrew';
            const theBinyanName = getBinyanNameByCode(theBinyan);
            console.log(`getBinyanim: Requested: ${theRoot}, binyan: ${theBinyan}:${theBinyanName}, tense: ${theTense}, toLanguage: ${toLanguage}`);

            const nonce = await fetchBinyanNonce(theRoot, theBinyan);
            const resultInfinitive = await getInfinitive(theRoot, theBinyanName, fromLanguage, toLanguage);
            const resultBinyan = await fetchBinyanForRoot(theRoot, theBinyan, theTense, fromLanguage, toLanguage, nonce);
            return res.send({ infinitive: resultInfinitive, conjugation: resultBinyan });
        } catch (error) {
            if (error.code === 'auth/argument-error') {
                return res.status(401).send('Invalid token');
            }
            console.error('getBinyanim: Error during request:', error);
            return res.status(500).send(error.message);
        }
    });
});

function getBinyanNameByCode(code) {
    // Iterate through the binyan object to find the matching code
    for (const [name, value] of Object.entries(binyan)) {
        console.log(`getBinyanim: Checking code: [${name}:${value}] against code: ${code}`);
        if (value == code) {
            return name;
        }
    }
    // If no match is found, return null or an appropriate message
    return null;
}

async function getInfinitive(root, binyan, fromLanguage, toLanguage) {
    let result = '';
    const systemRole =
        "Your role is to act as a linguistic assistant specializing in hebrew verb conjugation, translation, " +
        "and formatting tasks. Follow these principles:\n\n" +
        "1. Conjugation Rules:\n" +
        "- Utilize the provided linguistic information (`root`, `binyan`, `Hebrew`) to accurately construct " +
        "the infinitive of verbs as requested.\n" +
        "- Ensure the constructed infinitive adheres to grammatical and linguistic norms of the `Hebrew`.\n\n" +
        "Following are examples of infinitives of hebrew binyans for the root `כתב`: " +
        " - Pa'al (פעל): לִכְתֹּב (likhtov)\n" +
        " - Nif'al (נפעל): לְהִכָּתֵב (lehikatev)\n" +
        " - Pi'el (פיעל): לְכַתֵּב (lekatev)\n" +
        " - Pu'al (פועל): לְכֻתַּב (lekutav)\n" +
        " - Hif'il (הפעיל): לְהַכְתִּיב (lehakhtiv)\n" +
        " - Huf'al (הופעל): לְהֻכְתַּב (lehukhtav)\n" +
        " - Hitpa'el (התפעל): לְהִתְכַּתֵּב (lehitkatev)\n" +
        "2. Formatting Instructions:\n" +
        "- Save outputs to explicitly named variables as described (`theInfinitive`, `theTranslation`, `theResult`).\n" +
        "- Construct `theResult` in the specified format: \"theInfinitive (theTranslation)\".\n\n" +
        "3. Output Constraints:\n" +
        "- Your response must only include the string stored in the variable `theResult`. Do not include explanations, " +
        "code fragments, or metadata unless explicitly instructed.\n\n";

    const prompt =
        `1. Build the infinitive of the ${fromLanguage} verb from the ${fromLanguage} root "${root}" of binyan: ${binyan}, ` +
        `and save the result in a variable named "theInfinitive".\n` +
        `2. Translate the infinitive stored in the variable "theInfinitive" into ${toLanguage}, ` +
        `and save the result in a variable named "theTranslation".\n` +
        `3. Store a formatted string in the variable "theResult" in the following format: "theInfinitive (theTranslation)".\n` +
        `4. Return only the string stored in the variable "theResult".\n` +
        `IMPORTANT: Your answer must be the string stored in the variable "theResult".`;

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    console.log(`getInfinitive prompt: ${prompt}`);
    const data = {
        model: 'gpt-4o',//'gpt-3.5-turbo', //
        messages: [
            { role: 'system', content: systemRole },
            { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.5
    };

    const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    };

    try {
        console.log(`getInfinitive: START request for assistanceRequest url: ${url}`);
        const response = await fetch(url, options);
        console.log('getInfinitive: Response of assistanceRequest:', response);
        if (!response.ok) {
            console.error(`getInfinitive: Error in assistanceRequest: response status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultData = await response.json();
        console.log('getInfinitive: Result:', resultData);

        result = resultData.choices[0].message.content.toLowerCase();
        console.log('getInfinitive: Response Text:', result);
    } catch (error) {
        console.error('getInfinitive: Error:', error);
        throw error;
    }

    return result;
}

async function fetchBinyanForRoot(theRoot, theBinyan, theTense, fromLanguage, toLanguage, nonce) {
    const requestUrl =
        `https://hebrew-academy.org.il/wp-admin/admin-ajax.php?action=update_hatayot&shoresh=${theRoot}&binyan=${theBinyan}&_ajax_nonce=${nonce}`;
    console.log(`getBinyanim::fetchBinyanForRoot: url: ${requestUrl}`);

    let result = null;
    try {
        const response = await fetch(requestUrl);
        const html = await response.text();
        const tenses = await parseConjugations(theBinyan, html, fromLanguage, toLanguage, theTense);
        result = tenses[theTense];
    } catch (error) {
        console.error('getBinyanim: Error fetching conjugations:', error);
    }
    return result;
}
async function fetchBinyanNonce(theRoot, theBinyan) {
    const pageName = 'לוחות נטיית הפועל';
    const requestUrl = `https://hebrew-academy.org.il/${pageName}/?action=netiot&shoresh=${theRoot}&binyan=${theBinyan}`;
    console.log(`getBinyanim::fetchBinyanNonce: url: ${requestUrl}`);

    let result = null;
    try {
        const response = await fetch(requestUrl);
        const htmlText = await response.text();
        result = extractNetiotHapoalNonce(htmlText);
        console.log(`getBinyanim::fetchBinyanNonce: result: ${result}`);

    } catch (error) {
        console.error('getBinyanim::fetchBinyanNonce: Error fetching nonce:', error);
    }
    return result;
}

function extractNetiotHapoalNonce(htmlText) {
    // Create a DOM parser to parse the HTML
    const dom = new JSDOM(htmlText);
    const document = dom.window.document;

    // Query for all script elements in the head
    const scripts = document.head.getElementsByTagName('script');

    for (let i = 0; i < scripts.length; i++) {
        const scriptContent = scripts[i].textContent;

        // Use a regular expression to find the nonce value
        const match = scriptContent.match(/var\s+netiot_hapoal_nonce\s*=\s*"([^"]+)"/);

        if (match) {
            // Return the captured group which is the nonce value
            return match[1];
        }
    }

    // Return null or undefined if the nonce is not found
    return null;
}
async function fetchBinyanForRootPage(theRoot, theBinyan) {
    const pageName = 'לוחות נטיית הפועל';
    const requestBinyanim = `https://hebrew-academy.org.il/wp-admin/admin-ajax.php?action=update_hatayot&shoresh=${theRoot}&binyan=10&_ajax_nonce=9ca4e9b358`;
    //`https://hebrew-academy.org.il/${pageName}/?action=netiot&shoresh=${theRoot}&binyan=${theBinyan}`;
    console.log(`getBinyanim::fetchBinyanForRoot: url: ${requestBinyanim}`);

    let result = null;
    try {
        const response = await fetch(requestBinyanim);
        result = await response.text();
    } catch (error) {
        console.error('getBinyanim: Error fetching conjugations:', error);
    }
    return result;
}

async function parseConjugations(binyan, html, fromLanguage, toLanguage, tense) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const conjugations = {
        past: await parseTense(binyan, document, 'past', fromLanguage, toLanguage),
        present: await parseTense(binyan, document, 'present', fromLanguage, toLanguage),
        future: await parseTense(binyan, document, 'future', fromLanguage, toLanguage)//,
        //command: parseTense(document, 'command')
    };

    return conjugations;
}

async function parseTense(binyan, document, tense, fromLanguage, toLanguage) {
    const theId = `${tense}-form-results`;
    console.log(`getBinyanim::parseTense: id: ${theId}`);

    const tenseDiv = document.getElementById(theId);
    if (!tenseDiv) {
        throw new Error('Could not find div for the specified tense ' + tense);
    }

    const conjugationLists = tenseDiv.querySelectorAll('ul.hatayot');
    let conjugations = [];

    try {
        const listNikuds = conjugationLists[0];
        const listNikudsItems = listNikuds.querySelectorAll('li');
        const listVerbs = conjugationLists[1];
        const listVerbsItems = listVerbs.querySelectorAll('li');
        for (let i = 0; i < listVerbsItems.length; i++) {
            const itemVerb = listVerbsItems[i];
            const itemNikud = listNikudsItems[i];
            const partsVerb = itemVerb.textContent.split(' ');
            const partsNikud = itemNikud.textContent.split(' ');
            const { subject, person, number } = normalizeSubject(partsVerb[0]);
            const verb = partsVerb.slice(1).join(' ');
            const nikud = partsNikud.slice(1).join(' ');
            const expression = `${subject} ${verb}`;
            const conjugation = {
                subject: subject,
                verb: verb,
                nikud: nikud,
                //translation: await getTranslationAssistance(binyan, expression, fromLanguage, toLanguage, person, number, tense),
            };
            conjugations.push(conjugation);
            //console.log(`getBinyanim::parseTense: conjugation: subject: ${conjugation.subject} verb: ${conjugation.verb}, nikud: ${conjugation.nikud}`);
        }
    } catch (error) {
        console.log(`getBinyanim::parseTense: ERROR: ${error}`);
        conjugations = [];
    }

    return conjugations;
}

function normalizeSubject(subject) {
    let normalizedSubject = subject;
    let person = '';
    let number = '';
    switch (normalizedSubject) {
        case 'יחיד':
            normalizedSubject = 'הוא';
            break;
        case 'יחידה':
            normalizedSubject = 'היא';
            break;
        case 'רבים':
            normalizedSubject = 'הם';
            break;
        case 'רבות':
            normalizedSubject = 'הן';
            break;
    }
    switch (normalizedSubject) {
        case 'אני':
            person = 'first person';
            number = 'singular';
            break;
        case 'אתה':
            person = 'second person';
            number = 'singular';
            break;
        case 'את':
            person = 'second person female';
            number = 'singular';
            break;
        case 'הוא':
            person = 'third person male';
            number = 'singular';
            break;
        case 'היא':
            person = 'third person female';
            number = 'singular';
            break;
        case 'אנחנו':
            person = 'first person';
            number = 'plural';
            break;
        case 'אתם':
            person = 'second person male';
            number = 'plural';
            break;
        case 'אתן':
            person = 'second person female';
            number = 'plural';
            break;
        case 'הם':
            person = 'third person male';
            number = 'plural';
            break;
        case 'הן':
            person = 'third person female';
            number = 'plural';
            break;
    }
    //normalizedSubject = '';
    return { subject: normalizedSubject, person: person, number: number };
}

function getLanguageCode(languageName) {
    const languageMap = {
        "Afrikaans": "af",
        "Albanian": "sq",
        "Arabic": "ar",
        "Armenian": "hy",
        "Basque": "eu",
        "Bengali": "bn",
        "Bulgarian": "bg",
        "Catalan": "ca",
        "Chinese": "zh",
        "Croatian": "hr",
        "Czech": "cs",
        "Danish": "da",
        "Dutch": "nl",
        "English": "en",
        "Esperanto": "eo",
        "Estonian": "et",
        "Finnish": "fi",
        "French": "fr",
        "Galician": "gl",
        "Georgian": "ka",
        "German": "de",
        "Greek": "el",
        "Gujarati": "gu",
        "Hebrew": "he",
        "Hindi": "hi",
        "Hungarian": "hu",
        "Icelandic": "is",
        "Indonesian": "id",
        "Irish": "ga",
        "Italian": "it",
        "Japanese": "ja",
        "Kannada": "kn",
        "Korean": "ko",
        "Latvian": "lv",
        "Lithuanian": "lt",
        "Macedonian": "mk",
        "Malay": "ms",
        "Malayalam": "ml",
        "Maltese": "mt",
        "Marathi": "mr",
        "Norwegian": "no",
        "Persian": "fa",
        "Polish": "pl",
        "Portuguese": "pt",
        "Romanian": "ro",
        "Russian": "ru",
        "Serbian": "sr",
        "Slovak": "sk",
        "Slovenian": "sl",
        "Spanish": "es",
        "Swahili": "sw",
        "Swedish": "sv",
        "Tamil": "ta",
        "Telugu": "te",
        "Thai": "th",
        "Turkish": "tr",
        "Ukrainian": "uk",
        "Urdu": "ur",
        "Vietnamese": "vi",
        "Welsh": "cy"
    };

    return languageMap[languageName] || null;
}

async function getTranslation(binyan, text, fromLanguage, toLanguage) {
    console.log(`getBinyanim::getTranslation: Text: ${text} from ${fromLanguage} to ${toLanguage}`);
    const toLanguageCode = getLanguageCode(toLanguage);
    const [translation] = await translate.translate(text, toLanguageCode);
    console.log(`getBinyanim::getTranslation: Text: ${text} to ${translation}`);
    return translation;
}

async function getTranslationAssistance(binyan, text, fromLanguage, toLanguage, person, number, tense) {
    let result = '';
    const prompt =
        `translate the text from ${fromLanguage} to ${toLanguage}, ` +
        `the verb in the sentence is in the following form: ` +
        `binyan: ${binyan}, ` +
        `person: ${person}, ` +
        `number: ${number}, ` +
        `tense: ${tense}. ` +
        `strictly follow this form in translation. ` +
        `your answer must contain nothing but translated text.`;

    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    const theContent = text;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    console.log(`getTranslation prompt: ${prompt}`);
    const data = {
        model: 'gpt-4o',//'gpt-3.5-turbo', //
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: theContent }
        ],
        max_tokens: 1000,
        temperature: 0.5
    };

    const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    };

    try {
        console.log(`getTranslation: START request for assistanceRequest url: ${url}`);
        const response = await fetch(url, options);
        console.log('getTranslation: Response of assistanceRequest:', response);
        if (!response.ok) {
            console.error(`getTranslation: Error in assistanceRequest: response status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resultData = await response.json();
        console.log('getTranslation: Result:', resultData);

        result = resultData.choices[0].message.content.toLowerCase();
        console.log('getTranslation: Response Text:', result);
    } catch (error) {
        console.error('getTranslation: Error:', error);
        throw error;
    }

    return result;
}

