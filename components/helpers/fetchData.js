import { t } from '@lingui/macro';
import {
  loginUrl,
  captionsSaveToStorageUrl,
  getCaptionsUrlPost,
  getPlaylistContentUrlPost,
  getPlaylistRegistryUrlPost,
  getPlayistToRegistryUrl,
  getTranslationUrlPost,
  getTextAssistanceUrlPost,
  getWordAssistanceUrlPost,
  getExerciseAssistanceUrlPost,
  getReadAssistanceUrlPost,
  getSaveFlashcardUrlPost,
  getFlashcardsCollectionUrlPost,
  getFlashcardUpdateResultUrlPost,
} from './../data/configurator';
import {
  storageDataAttributes,
  fetchDataFromLocalStorage,
  saveDataToLocalStorage,
  removeDataFromLocalStorage
} from './storageHelper';

export async function fetchData(user, prefix, key, url, expirationSec, refetchFromSource = false) {
  if (refetchFromSource) {
    removeDataFromLocalStorage(prefix, key);
  }
  let result = fetchDataFromLocalStorage(prefix, key, expirationSec);

  if (!result) { // not found or no cache
    result = await fetchDataFromSource(user, url);
    if (result) {
      saveDataToLocalStorage(prefix, key, result, expirationSec);
    }
  }
  return result;
}

export async function fetchRetrieveCaptions(user, videoId, language, playlistId, userName, refetchFromSource = false) {
  const prefix = storageDataAttributes.captions_data_prefix;

  if (refetchFromSource) {
    removeDataFromLocalStorage(prefix, videoId);
  }
  let result = fetchDataFromLocalStorage(prefix, videoId, null);

  if (!result || result.length === 0) { // not found or no cache
    const url = getCaptionsUrlPost();
    //videoId=${videoId}&language=${language}&user=${user}
    const data = {
      videoId: videoId,
      language: language,
      user: userName,
      playlistId: playlistId,
    };
    result = await fetchDataFromSource(user, url, data);
    if (result) {
      saveDataToLocalStorage(prefix, videoId, result, null);
    }
  }
  return result;
}

export async function fetchRetrievePlayistContent(user, playlistId, refetchFromSource = false) {
  const prefix = storageDataAttributes.videoList_data_prefix;
  const expirationSec = 60 * 60;
  if (refetchFromSource) {
    removeDataFromLocalStorage(prefix, playlistId);
  }
  let result = fetchDataFromLocalStorage(prefix, playlistId, expirationSec);

  if (!result) { // not found or no cache
    const url = getPlaylistContentUrlPost();
    const data = {
      playlistId: playlistId
    };
    result = await fetchDataFromSource(user, url, data);
    if (result) {
      saveDataToLocalStorage(prefix, playlistId, result, expirationSec);
    }
  }
  return result;
}

export async function fetchRetrievePlayistRegistry(user, language, refetchFromSource = false) {
  const prefix = storageDataAttributes.playlist_registry_data_prefix;
  const expirationSec = 60 * 60;
  if (refetchFromSource) {
    removeDataFromLocalStorage(prefix, language);
  }
  let result = fetchDataFromLocalStorage(prefix, language, expirationSec);

  if (!result) { // not found or no cache
    const url = getPlaylistRegistryUrlPost();
    const data = {
      language: language
    };
    result = await fetchDataFromSource(user, url, data);
    if (result) {
      saveDataToLocalStorage(prefix, language, result, expirationSec);
    }
  }
  return result;
}

export async function getTranslation(user, text, sourceLanguage, targetLanguage) {
  const textParam = encodeURIComponent(text);
  const url = getTranslationUrlPost(textParam, sourceLanguage, targetLanguage);
  const data = {
    text: text,
    fromlanguage: sourceLanguage,
    tolanguage: targetLanguage
  };
  const result = await fetchDataFromSourcePost(user, url, data);
  return result?.translation;
}

export async function saveTextToFlashcards(user, text, frontLanguage, backLanguage, videoId, seconds) {
  const decodedFront = decodeURIComponent(text);
  const back = await getTranslation(user, decodedFront, frontLanguage, backLanguage);
  console.log('info', `saveTextToFlashcards: back: ${back}`);
  const url = getSaveFlashcardUrlPost();
  const data = {
    frontLanguage,
    backLanguage,
    front: text,
    back,
    videoId,
    seconds
  };
  await fetchDataFromSourcePost(user, url, data);
}

async function fetchDataFromSource(user, url, data) {
  return await fetchDataFromSourcePost(user, url, data);
}

async function fetchDataFromSourcePost(user, url, data) {
  let result = null;
  const headers = {
    'Content-Type': 'application/json'
  };
  const token = await user?.getIdToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  });

  result = response.ok ? await response.json() : null;
  return result;
}

async function fetchDataFromSourceGet(user, url) {
  let result = null;
  const headers = {
    'Content-Type': 'application/json'
  };
  const token = await user?.getIdToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    method: 'GET',
    headers: headers
  });

  result = response.ok ? await response.json() : null;
  return result;
}

export async function loginUser(username, password) {
  const url = loginUrl();
  const data = {
    username: username,
    password: password
  };
  const response = await fetchDataFromSource(null, url, data);
  return response;
}

export async function captionsSaveToStorage(videoId, language, user, captions) {
  const captionJson = JSON.stringify(captions);
  const data = {
    videoId: videoId,
    language: language,
    user: user,
    captions: captionJson
  };

  const url = captionsSaveToStorageUrl();
  const response = await fetch(url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

  return response.ok;
}

export const savePlayistToRegistry = async (user, data) => {
  const url = getPlayistToRegistryUrl();
  const token = await user?.getIdToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  });

  return response.ok;
}

export async function getWordAssistance(user, word, wordLanguage, answerLanguage) {
  const url = getWordAssistanceUrlPost();
  const data = {
    word: word,
    wordlanguage: wordLanguage,
    answerlanguage: answerLanguage
  };
  const response = await fetchDataFromSourcePost(user, url, data);
  const answer = response.answer;
  console.log('info', `getWordAssistance: data: ${answer}`);
  return answer;
}

export async function getTextAssistance(user, text, textLanguage, answerLanguage) {
  const url = getTextAssistanceUrlPost();
  const data = {
    text: text,
    textlanguage: textLanguage,
    answerlanguage: answerLanguage
  };
  const response = await fetchDataFromSourcePost(user, url, data);
  const answer = response.answer;
  console.log('info', `getTextAssistance: data: ${answer}`);
  return answer;
}
export async function getReadAssistance(user, text, textLanguage, answerLanguage) {
  const url = getReadAssistanceUrlPost();
  const data = {
    text: text,
    textlanguage: textLanguage,
    answerlanguage: answerLanguage
  };
  const response = await fetchDataFromSourcePost(user, url, data);
  const answer = response.answer;
  console.log('info', `getReadAssistance: data: ${answer}`);
  return answer;
}

export async function getExerciseAssistance(user, text, textLanguage, answerLanguage) {
  const url = getExerciseAssistanceUrlPost();
  const data = {
    text: text,
    textlanguage: textLanguage,
    answerlanguage: answerLanguage
  };
  const response = await fetchDataFromSourcePost(user, url, data);
  const answer = response.answer;
  console.log('info', `getExerciseAssistance: data: ${answer}`);
  return answer;
}

export async function getFlashcardsCollection(user, language, top = undefined, collectionName = 'default') {
  const url = getFlashcardsCollectionUrlPost();
  const data = {
    language,
    collectionName,
    top,
  };
  const response = await fetchDataFromSourcePost(user, url, data);
  const result = response ? response.collection : [];
  console.log('info', `getFlashcardsCollection: result: ${result}`);
  return result;
}

export async function updateFlashcardResult(user, flashcardId, correct) {
  const url = getFlashcardUpdateResultUrlPost();
  const data = {
    flashcardId,
    correct,
  };
  const response = await fetchDataFromSourcePost(user, url, data);
  const result = response ? response.collection : [];
  console.log('info', `updateFlashcardResult: result: ${result}`);
  return result;
}

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
