import { 
  loginUrl, 
  captionsSaveToStorageUrl, 
  getCaptionsUrlPost, 
  getPlaylistContentUrlPost 
} from './../data/configurator';
import {
  storageDataAttributes,
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

export async function fetchRetrieveCaptions(videoId, language, user, refetchFromSource = false) {
  const prefix = storageDataAttributes.captions_data_prefix;
  if (refetchFromSource) {
    removeDataFromLocalStorage(prefix, videoId);
  }
  let result = fetchDataFromLocalStorage(prefix, videoId, null);

  if (!result) { // not found or no cache
    const url = getCaptionsUrlPost();
    //videoId=${videoId}&language=${language}&user=${user}
    const data = {
      videoId: videoId,
      language: language,
      user: user
    };
    result = await fetchDataFromSource(url, data);
    if (result) {
      saveDataToLocalStorage(prefix, videoId, result, null);
    }
  }
  return result;
}

export async function fetchRetrievePlayistContent(playlistId, refetchFromSource = false) {
  const prefix = storageDataAttributes.videoList_data_prefix;
  const expirationSec = 60*60;
  if (refetchFromSource) {
    removeDataFromLocalStorage(prefix, playlistId);
  }
  let result = fetchDataFromLocalStorage(prefix, playlistId, expirationSec);

  if (!result) { // not found or no cache
    const url = getPlaylistContentUrlPost();
    const data = {
      playlistId: playlistId
    };
    result = await fetchDataFromSource(url, data);
    if (result) {
      saveDataToLocalStorage(prefix, playlistId, result, expirationSec);
    }
  }
  return result;
}

async function fetchDataFromSource(url, data) {
  if (data) {
    return fetchDataFromSourcePost(url, data);
  } else {
    return fetchDataFromSourceGet(url);
  }
}
async function fetchDataFromSourceGet(url) {
  const response = await fetch(url);
  const result = response.ok ? await response.json() : null;
  return result;
}
async function fetchDataFromSourcePost(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  const result = response.ok ? await response.json() : null;
  return result;
}


export async function loginUser(username, password) {
  const url = loginUrl();
  const data = {
    username: username,
    password: password
  };
  const response = await fetchDataFromSource(url, data); 
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

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
