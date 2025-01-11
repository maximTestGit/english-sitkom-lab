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
  getUpdateFlashcardDataUrlPost,
  getDeleteFlashcardUrlPost,
  getBinyanimForRootUrlPost
} from './../data/configurator';
import {
  storageDataAttributes,
  fetchDataFromLocalStorage,
  saveDataToLocalStorage,
  removeDataFromLocalStorage
} from './storageHelper';
import Swal from 'sweetalert2';

export async function fetchRetrieveCaptions(user, videoId, language, originalLanguage, playlistId, userName, refetchFromSource = false) {
  const prefixCaptionsLanguage = storageDataAttributes.captions_language_prefix;
  const captionsStoredLanguage = fetchDataFromLocalStorage(prefixCaptionsLanguage, key, null);

  const prefixCaptionsData = storageDataAttributes.captions_data_prefix;
  const key = `${videoId}#${language}`;
  let result = null;

  if (refetchFromSource) { // || captionsStoredLanguage !== language) {
    removeDataFromLocalStorage(prefixCaptionsData, key);
  } else {
    result = fetchDataFromLocalStorage(prefixCaptionsData, key, null);
  }

  if (!result || result.length === 0) { // not found or no cache
    console.log(`fetchRetrieveCaptions: videoId: ${videoId}, language: ${language}, playlistId: ${playlistId}, userName: ${userName}, refetchFromSource: ${refetchFromSource}`);
    const url = getCaptionsUrlPost();

    const data = {
      videoId: videoId,
      language: language,
      originalLanguage: originalLanguage,
      user: userName,
      playlistId: playlistId,
    };
    result = await fetchDataFromSourcePost(user, url, data);
    if (result && result.length > 0) {
      saveDataToLocalStorage(prefixCaptionsData, key, result, null);
      saveDataToLocalStorage(prefixCaptionsLanguage, key, language, null);
    }
  }
  return result;
}

export async function fetchRetrievePlayistContent(user, playlistId, refetchFromSource = false) {
  let result = [];
  if (playlistId) {
    const prefix = storageDataAttributes.videoList_data_prefix;
    const expirationSec = 60 * 60;
    if (refetchFromSource) {
      removeDataFromLocalStorage(prefix, playlistId);
    }
    result = fetchDataFromLocalStorage(prefix, playlistId, expirationSec);

    if (!result) { // not found or no cache
      const url = getPlaylistContentUrlPost();
      const data = {
        playlistId: playlistId
      };
      result = await fetchDataFromSourcePost(user, url, data);
      if (result) {
        saveDataToLocalStorage(prefix, playlistId, result, expirationSec);
      }
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
    result = await fetchDataFromSourcePost(user, url, data);
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

export async function saveTextToFlashcards(user, text, frontLanguage, backLanguage, videoId, seconds, frontTranslation) {
  const decodedFront = decodeURIComponent(text);
  let back = frontTranslation;
  if (back === undefined || back === null || back === "") {
    back = await getTranslation(user, decodedFront, frontLanguage, backLanguage);
  }
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

export async function loginUser(username, password) {
  const url = loginUrl();
  const data = {
    username: username,
    password: password
  };
  const response = await fetchDataFromSourcePost(null, url, data);
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

export async function updateFlashcardData(user, flashcard) {
  const url = getUpdateFlashcardDataUrlPost();
  const data = {
    cardId: flashcard.cardId,
    back: flashcard.back,
  };
  const response = await fetchDataFromSourcePost(user, url, data);
  const result = response ? response.collection : [];
  console.log('info', `updateFlashcardData: result: ${result}`);
  return result;
}

export async function deleteFlashcard(user, flashcard) {
  const url = getDeleteFlashcardUrlPost();
  const data = {
    cardId: flashcard.cardId
  };
  const response = await fetchDataFromSourcePost(user, url, data);
  const result = response ? response.collection : [];
  console.log('info', `deleteFlashcard: result: ${result}`);
  return result;
}

export async function getBinyanimForRoot(user, root, binyan, tense, toLanguage) {
  const url = getBinyanimForRootUrlPost();
  const data = {
    root,
    binyan,
    tense,
    toLanguage,
  };
  const result = await fetchDataFromSourcePost(user, url, data);
  //const result = response ?? {};
  console.log('info', `getBinyanimForRoot: result: ${JSON.stringify(result)}`);
  return result;
}

const handleWaitForAction = (isStarted, onHandleWaitForAction = null) => {
  if (isStarted) {
    if (onHandleWaitForAction) {
      onHandleWaitForAction(true);
    }
    document.body.style.cursor = 'wait';
    Swal.fire({
      title: t`Please wait`,
      text: t`Your request is being processed...`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
  } else {
    document.body.style.cursor = 'default';
    Swal.close();
    if (onHandleWaitForAction) {
      onHandleWaitForAction(false);
    }
  }
}

async function fetchDataFromSourcePost(user, url, data, customHandleWaitForAction = null) {
  let result = null;
  try {
    handleWaitForAction(true, customHandleWaitForAction);
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
  } finally {
    handleWaitForAction(false, customHandleWaitForAction);
  }
  return result;
}

