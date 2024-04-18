export function jumpToStart(playerRef) {
    playerRef.current.seekTo(0, 'fraction');
};

export function handleSaveExercise(video, captions, recordedChunks, playbackRate, youLinePlaybackRate) {
    buildExerciseData(video, captions, recordedChunks, playbackRate, youLinePlaybackRate)
        .then(videoData => 
            {
                saveJsonToFile(videoData);
            }
        );
}
export function buildExerciseData(video, captions, recordedChunks, playbackRate, youLinePlaybackRate) {
    const videoData = {
        videoId: video.videoId,
        title: video.title,
        url: `https://www.youtube.com/embed/${video.videoId}`,
        intervals: getIntervals(captions),
        playbackRate: playbackRate,
        studentName: 'Anonymous',
        uncheckedCaptions: [],
        captions: undefined,
        lengthSeconds: undefined,
        recordedChunks: [],
        videoRecordedChunks: [],
        notes: [],
        yourLanguage: undefined,
        studyLanguage: undefined,
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
                start: parseFloat(captions[0].start),
                // @ts-ignore
                end: parseFloat(captions[0].start) + parseFloat(captions[0].duration),
                // @ts-ignore
                checked: captions[0].checked,
                count: 1,
                index: index++
            }
        );
        for (let i = 1; i < captions.length; i++) {
            // @ts-ignore
            if (captions[i].checked === captions[i - 1].checked) {
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
