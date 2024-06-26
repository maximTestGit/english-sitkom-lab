import { getYoutubeUrl, saveExerciseUrl } from "../data/configurator";
import { playlistRegistry } from './../data/playlistRegistry';

//import publishExercise from './publishExercise.js';
const exercise_storage_folder = 'Exercises';

export function jumpToStart(playerRef) {
    try {
        playerRef?.current?.seekTo(0, 'fraction');
        console.log(`LingFlix: jumpToStart(${playerRef.current})`);
    } catch (error) {
        console.log(`LingFlix: Error in jumpToStart(${playerRef.current}): ${error}`);
    }
};

export function handleSaveExercise(video, captions, recordedChunks, playbackRate, youLinePlaybackRate) {
    buildExerciseData(video, captions, recordedChunks, playbackRate, youLinePlaybackRate)
        .then(videoData => 
            {
                saveJsonToFile(videoData);
            }
        );
}
export function handleShareExercise(video, captions, recordedChunks, playbackRate, youLinePlaybackRate, studentName, emailAddress, isUnlistedVideo) {
    buildExerciseData(video, captions, recordedChunks, playbackRate, youLinePlaybackRate, studentName, emailAddress, isUnlistedVideo)
        .then(videoData => 
            {
                publishJsonToCloud(videoData);
            }
        );
}
export function buildExerciseData(video, captions, recordedChunks, playbackRate, youLinePlaybackRate, studentName=null, emailAddress=null, isUnlistedVideo=false) {
    const playlistData = playlistRegistry.find(playlist => playlist.listId === video.playlistId);
    const language = playlistData.language;
    const videoData = {
        videoId: video.videoId,
        title: video.title,
        url: getYoutubeUrl(video.videoId),
        intervals: getIntervals(captions),
        playbackRate: playbackRate,
        studentName: studentName,
        emailAddress: emailAddress,
        playlistId: video.playlistId,
        playlistName: playlistRegistry.find(playlist => playlist.listId === video.playlistId)?.listName,
        isUnlistedVideo: isUnlistedVideo,
        uncheckedCaptions: [],
        captions: undefined,
        lengthSeconds: undefined,
        recordedChunks: [],
        videoRecordedChunks: [],
        notes: [],
        yourLanguage: undefined,
        studyLanguage: language,
        yourLineEffect: undefined,
        shadowingVolume: undefined,
        yourLineRate: youLinePlaybackRate,
        startSectionTime: undefined,
        endSectionTime: undefined,
    };

    let promises = [];
    recordedChunks.forEach((chunk, index) => {
        // @ts-ignore
        promises.push(new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = function () {
                videoData.videoRecordedChunks.push(reader.result);
                // Resolve the promise when the chunk has been processed
                resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(chunk);
        }));
    });
    return Promise.all(promises).then(() => videoData);
}

export function getIntervals(captions) {
    const result = [];
    var index = 0;
    if (captions.length > 0) {
        result.push(
            {
            // @ts-ignore
            start: parseFloat(captions[0].start).toFixed(3),
            // @ts-ignore
            end: (parseFloat(captions[0].start) + parseFloat(captions[0].duration)).toFixed(3),
            // @ts-ignore
            checked: captions[0].checked,
            count: 1,
            index: index++
            }
        );
        for (let i = 1; i < captions.length; i++) {
            // @ts-ignore
            if (!captions[i].checked && captions[i].checked === captions[i - 1].checked) {
                // @ts-ignore
                result[result.length - 1].end = parseFloat(captions[i].start) + parseFloat(captions[i].duration);
                result[result.length - 1].count = result[result.length - 1].count + 1;
            } else {
                result.push({
                    // @ts-ignore
                    start: parseFloat(captions[i].start),
                    // @ts-ignore
                    end: parseFloat(captions[i].start) + parseFloat(captions[i].duration),
                    // @ts-ignore
                    checked: captions[i].checked,
                    count: 1,
                    index: index++
                });
            }
        }
    }

    return result;
}

export function saveJsonToFile(videoData) {
    const jsonData = JSON.stringify(videoData, null, 2); // The second parameter (null) is for replacer function or array, and the third parameter (2) is for indentation level (spaces).
    const jsonBlob = new Blob([jsonData], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);

    let safeTitle = videoData.title.replace(/[<>:"/\\|?*]+/g, '') + (videoData.videoRecordedChunks.length>0? ' homework' : ' exercise');
    const downloadLink = document.createElement('a');
    downloadLink.href = jsonUrl;
    downloadLink.download = `${safeTitle}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

export async function publishJsonToCloud(videoData) {
    const jsonData = JSON.stringify(videoData, null, 2); // The second parameter (null) is for replacer function or array, and the third parameter (2) is for indentation level (spaces).

    let safeTitle = videoData.title.replace(/['<>:"/\\|?*]+/g, '') + (videoData.videoRecordedChunks.length > 0 ? '-homework' : '-exercise');
    safeTitle = safeTitle.replace(/ /g, '-');
    const randomSuffixLen5 = Math.floor(Math.random() * 100000);
    try {
        await publishExercise(
            exercise_storage_folder, 
            `${safeTitle}-${videoData.studentName}-${randomSuffixLen5}.json`, 
            jsonData);
    } catch (error) {
        console.error(`Error publishing to cloud: ${error}`);
    }
}

export async function publishExercise(folderName, fileName, data) {
    try {
        const requestBody = {
            folder: `${folderName}`,
            file: `${fileName}`,
            data: `${data}`
        };
        const bodyJson = JSON.stringify(requestBody, null, 2);
        const response = 
            await fetch(
                saveExerciseUrl(), 
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain', 'Accept': '*/*' },
                    body: bodyJson,
                });
  
      if (!response.ok) {
        throw new Error(`Error saving file: ${response.statusText}`);
      }
  
      console.log('LingFlix: File saved successfully!');
      //alert('Exercise published successfully!');
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error publishing exercise. Please try again later.');
    }
  }

export function buildExerciseRecordedChunks(chunks) {
    const result = chunks.map(dataUrl => {
        var parsedDataUrl = parseDataUrl(dataUrl);
        const byteString = atob(parsedDataUrl.data);
        const mimeString = `${parsedDataUrl.mimeType}; ${parsedDataUrl.codecs}`;//byteArray[0].split(':')[1].split(';')[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        const blobChunk = new Blob([uint8Array], { type: mimeString });
        return blobChunk;
    });
    return result;
};

export function parseDataUrl(dataUrl) {
    const dataContent = dataUrl.split(':')[1];
    const dataArray = dataContent.split(';');

    const mimeType = dataArray[0];
    const data = (dataArray[dataArray.length - 1]).split(',')[1]; // To remove "base64," from the data
    let codecString;
    if (dataArray.length > 2) {
        codecString = dataArray[1];
    }
    return {
        mimeType: mimeType,
        codecs: codecString,
        data: data
    };
}


