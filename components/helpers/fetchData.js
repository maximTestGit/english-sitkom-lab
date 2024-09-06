import { loginUrl, captionsSaveToStorageUrl } from "../data/configurator";
import {
  fetchDataFromLocalStorage,
  saveDataToLocalStorage,
  removeDataFromLocalStorage
} from './storageHelper';

export async function fetchData(prefix, key, url, expirationSec, refetchFromSource = false) {
  if (refetchFromSource) {
    removeDataFromLocalStorage(prefix, key);
  }
  let result = fetchDataFromLocalStorage(prefix, key, expirationSec);

  if (!result) { // not found or no cache
    result = await fetchDataFromSource(url);
    if (result) {
      saveDataToLocalStorage(prefix, key, result, expirationSec);
    }
  }
  return result;
}

async function fetchDataFromSource(url) {
  const response = await fetch(url);
  const result = response.ok ? await response.json() : null;
  return result;
}


export async function loginUser(username, password) {
  const response = await fetch(loginUrl(),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

  const data = await response.json();
  return { 'ok': response.ok, 'data': data };
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

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
