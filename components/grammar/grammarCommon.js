const grammarNumbersHeb = [...grammarCommon.grammarNumbers];
const grammarGendersHeb = [grammarCommon.grammarGenders.undefined, grammarCommon.grammarGenders.masculine, grammarCommon.grammarGenders.feminine];
const grammarVerbTensesHeb = [...grammarCommon.grammarVerbTenses];
const grammarPersonsHeb = [...grammarCommon.grammarPersons];

const grammarSettingsHeb = {
    grammarNumbers: grammarNumbersHeb,
    grammarGenders: grammarGendersHeb,
    grammarVerbTenses: grammarVerbTensesHeb,
    grammarPersons: grammarPersonsHeb,
};

const defaultGrammarSettings = {
    grammarNumbers: grammarNumbers,
    grammarGenders: grammarGenders,
    grammarVerbTenses: grammarVerbTenses,
    grammarPersons: grammarPersons,
};

const languages = [
    { code: 'af-ZA', name: 'Afrikaans', nativeName: 'Afrikaans', settings: defaultGrammarSettings },
    { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', settings: defaultGrammarSettings },
    { code: 'hr-HR', name: 'Croatian', nativeName: 'Hrvatski', settings: defaultGrammarSettings },
    { code: 'zh-CN', name: 'Chinese', nativeName: '中文', settings: defaultGrammarSettings },
    { code: 'en-US', name: 'English', nativeName: 'English', settings: grammarSettingsHeb },
    { code: 'fr-FR', name: 'French', nativeName: 'Français', settings: defaultGrammarSettings },
    { code: 'de-DE', name: 'German', nativeName: 'Deutsch', settings: defaultGrammarSettings },
    { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית', settings: grammarHebrew.grammarSettings },
    { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', settings: defaultGrammarSettings },
    { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', helpSubpath: 'ru/help.html', settings: defaultGrammarSettings },
    { code: 'es-ES', name: 'Spanish', nativeName: 'Español', settings: defaultGrammarSettings },
    { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', settings: defaultGrammarSettings },
    { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', settings: defaultGrammarSettings },
];

const grammarNumbers =
{
    notDefined: "0",
    singular: "1",
    dual: "2",
    plural: "3"
}

const grammarGenders =
{
    notDefined: "0",
    masculine: "m",
    feminine: "f",
    neuter: "n"
}

const grammarVerbTenses =
{
    notDefined: "0",
    present: "n",
    past: "p",
    future: "f"
}

const grammarPersons =
{
    notDefined: "0",
    first: "1",
    second: "2",
    third: "3"
}

function getGrammarKeyFromForm(grammaForm) {
    // grammaForm = { person, number, gender, tense }
    let result =
        grammarPersons.notDefined +
        grammarNumbers.notDefined +
        grammarGenders.notDefined +
        grammarVerbTenses.notDefined;
    if (grammaForm) {
        result =
            grammaForm.person +
            grammaForm.number +
            grammaForm.gender +
            grammaForm.tense;
    }
    return result;
}

const getKeyByValue = (obj, value) => {
    return Object.keys(obj).find(key => obj[key] === value) || null;
};

function getGrammarFormFromKey(key) {
    const personValue = key[0];
    const numberValue = key[1];
    const genderValue = key[2];
    const tenseValue = key[3];

    return {
        person: personValue,
        number: numberValue,
        gender: genderValue,
        tense: tenseValue
    };
}

function grammaFormToString(grammaForm) {
    // grammaForm = { person, number, gender, tense }
    let result = "";
    if (!grammaForm
        || grammaForm.person == grammarPersons.notDefined
        || grammaForm.number == grammarNumbers.notDefined
        || grammaForm.gender == grammarGenders.notDefined
        || grammaForm.tense == grammarVerbTenses.notDefined) {
        result = "infinitive";
    } else {
        result =
            getKeyByValue(grammarPersons, grammaForm.person) + 'person ' +
            getKeyByValue(grammarNumbers, grammaForm.number) + 'number ' +
            getKeyByValue(grammarGenders, grammaForm.gender) + 'gender ' +
            getKeyByValue(grammarVerbTenses, grammaForm.tense) + 'tense';
    }
    return result;
}

function generateConjugationPrompt(languageName, word) {
    const language = languages.find(l => l.name === languageName);
    if (language) {
        const grammarSettings = language.settings;
        const prompt = `Conjugate the verb "${word}" in ${language.nativeName} in the following forms: `;
        const formText = grammaFormToString(null);
        prompt += formText + ', ';
        Object.values(grammarSettings.grammarPersons).forEach(person => {
            if (person !== grammarSettings.grammarPersons.notDefined) {
                Object.values(grammarSettings.grammarNumbers).forEach(number => {
                    if (number !== grammarSettings.grammarNumbers.notDefined) {
                        Object.values(grammarSettings.grammarGenders).forEach(gender => {
                            if (gender !== grammarSettings.grammarGenders.notDefined) {
                                Object.values(grammarSettings.grammarVerbTenses).forEach(tense => {
                                    if (tense !== grammarSettings.grammarVerbTenses.notDefined) {
                                        // grammaForm = { person, number, gender, tense }
                                        const grammaForm =
                                        {
                                            person: person,
                                            number: number,
                                            gender: gender,
                                            tense: tense
                                        };
                                        const formText = grammaFormToString(grammaForm);
                                        prompt += formText + ', ';
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        prompt = prompt.slice(0, -2);
        return prompt;
    }
}
/*
testGrammaForm(null);

Object.values(grammarPersons).forEach(person => {
    //console.log(`-----------> ${person}?${grammarPersons.notDefined} : ${person == grammarPersons.notDefined}`);
    if (person !== grammarPersons.notDefined) {
        Object.values(grammarNumbers).forEach(number => {
            if (number !== grammarNumbers.notDefined) {
                Object.values(grammarGenders).forEach(gender => {
                    if (gender !== grammarGenders.notDefined) {
                        Object.values(grammarVerbTenses).forEach(tense => {
                            if (tense !== grammarVerbTenses.notDefined) {
                                // grammaForm = { person, number, gender, tense }
                                console.log('----------------------------------------');
                                console.log(`params: ${person} person, ${number} number, ${gender} gender, ${tense} tense`);
                                const grammaForm =
                                {
                                    person: person,
                                    number: number,
                                    gender: gender,
                                    tense: tense
                                };
                                testGrammaForm(grammaForm);
                            }
                        });
                    }
                });
            }
        });
    }
});
function testGrammaForm(grammaForm) {
    const key = getGrammarKeyFromForm(grammaForm);
    const form = getGrammarFormFromKey(key);
    console.log(`key: ${key}`);
    console.log(`form: ${grammaForm?.person} person, ${grammaForm?.number} number, ${grammaForm?.gender} gender, ${grammaForm?.tense} tense`);
    console.log(`input:  ${grammaFormToString(grammaForm)}`);
    console.log(`output: ${grammaFormToString(form)}`);
}
*/


