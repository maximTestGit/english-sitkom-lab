async function fetchCaptionInternal(videoId, language, originalLanguage, userName, playlistId, result, user) {
  let videoInfo = await fetchPlayerInfo(videoId);

  if (videoInfo) {
    captions = await getCaptionsFromYoutube(videoId, videoInfo, language, true); // as string
    console.log(`fetchCaptionsJson: tryToGetCaptions: getCaptionsFromYoutube: --- of language:${language} captions: ${captions}`);
  } else {
    console.log(`fetchCaptionsJson: no videoInfo for request videoId: ${videoId} language:${language} user:${user}: captions: ${captions}`);
  }
  console.log(`fetchCaptionsJson: tryToGetCaptions: result: --- captions: ${captions}`);
  return captions;
}

async function resolveVisitorDataAsync() {
  //return 'CgtaTzFkT0M1T0pKayjEpp69BjIKCgJJTBIEGgAgOw%3D%3D';
  const response = await fetch("https://www.youtube.com/sw.js_data", {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "User-Agent": "com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X; US)"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  let jsonString = await response.text();
  if (jsonString.startsWith(")]}'")) {
    jsonString = jsonString.substring(4);
  }

  const json = JSON.parse(jsonString);

  const value = json?.[0]?.[2]?.[0]?.[0]?.[13] || null;
  if (!value || value.trim() === "") {
    throw new Error("Failed to resolve visitor data.");
  }

  return value;
}

async function fetchPlayerInfo(videoId) {
  const visitorData = await resolveVisitorDataAsync();

  const requestBody = JSON.stringify({
    videoId: videoId,
    contentCheckOk: true,
    context: {
      client: {
        clientName: "IOS",
        clientVersion: "19.45.4",
        deviceMake: "Apple",
        deviceModel: "iPhone16,2",
        platform: "MOBILE",
        osName: "IOS",
        osVersion: "18.1.0.22B83",
        visitorData: visitorData,
        hl: "en",
        gl: "US",
        utcOffsetMinutes: 0
      }
    }
  });

  const response = await fetch("https://www.youtube.com/youtubei/v1/player", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X; US)"
    },
    body: requestBody
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  console.log("getPlayerResponseAsync: Player response:", response);
  const playerResponse = await response.json();

  return playerResponse;
}

