import { getAssistanceRequestUriPost } from './../data/configurator';
import { getTranslation } from './fetchData';
import {
  storageDataAttributes,
  fetchDataFromLocalStorage,
  saveDataToLocalStorage,
  getHashCode
} from './storageHelper';

export async function assistanceRequestFromCloud(prompt, theContent) {
  if (typeof prompt !== 'string' || typeof theContent !== 'string') {
    throw new Error('Both prompt and theContent must be strings');
  }
  try {
    document.body.style.cursor = 'wait';
    const promptParam = encodeURIComponent(prompt);
    const contentParam = encodeURIComponent(theContent);
    const url = `${getAssistanceRequestUriPost()}?prompt=${promptParam}&content=${contentParam}`;
    console.log('info', `assistanceRequestFromCloud: url: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      console.log('error', `assistanceRequestFromCloud: error: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    console.log('info', `assistanceRequestFromCloud: data: ${data}`);
    return data;
  } finally {
    document.body.style.cursor = 'default';
  }
}

export async function getAssistanceRequest(user, prompt, textToAnalyze, textLanguage, explainInLanguage) {
  if (!user) {
    throw new Error('User must be signed in');
  }
  if (typeof textToAnalyze !== 'string' || typeof textLanguage !== 'string' || typeof explainInLanguage !== 'string') {
    throw new Error('All parameters must be strings');
  }
  //const prompt = `Analyze and explain the following text in ${explainInLanguage} for ${explainInLanguage} speaking students learning ${textLanguage} language.`;
  const theContent = textToAnalyze;
  const result = await assistanceRequestFromCloud(prompt, theContent);
  return result;
}

export async function getAssistantPrompt(user, textLanguage, explainInLanguage) {
  const origPrompt = `Analyze the following text for a student learning ${textLanguage}, ` +
    `whose native language is ${explainInLanguage}. ` +
    `Provide translation, a breakdown of vocabulary, grammar structures, and usage. ` +
    `Additionally, highlight key phrases or idioms.` +
    `If the text contains a single word and it is a noun, provide all its forms in ${textLanguage}.` +
    `If the text contains a single word and it is a verb, provide its conjugation table in ${textLanguage}.` +
    `Your response should be in ${explainInLanguage}.`;
  let resultPrompt = origPrompt;
  if (explainInLanguage !== 'en') {
    const origPromptHash = getHashCode(origPrompt);
    const { promptHash : restoredOrigPromptHash, promptText: restoredResultPromptText } = await getAssistantPromptFromLocalStorage();
    if (restoredOrigPromptHash && restoredResultPromptText && restoredOrigPromptHash === origPromptHash) {
      resultPrompt = restoredResultPromptText;
    } else {
      resultPrompt = await getTranslation(user, origPrompt, textLanguage, explainInLanguage);
      if (origPrompt) {
        saveAssistantPromptToLocalStorage(origPromptHash, resultPrompt);
      }
    }
  }
  return resultPrompt;
}

function saveAssistantPromptToLocalStorage(promptHash, promptText) {
  const promptData = {
    promptHash: promptHash,
    promptText: promptText
  };
  saveDataToLocalStorage(
    storageDataAttributes.session_data_prefix,
    storageDataAttributes.session_data_keys.assitant_prompt,
    promptData
  );
}

async function getAssistantPromptFromLocalStorage() {
  const promptData = await fetchDataFromLocalStorage(
    storageDataAttributes.session_data_prefix,
    storageDataAttributes.session_data_keys.assitant_prompt);
  const result = promptData ??
  {
    promptHash: null,
    promptText: null
  };
  return result;
}


