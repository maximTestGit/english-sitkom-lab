export function loadCaptionObjectsFromFile(file) {
  // @ts-ignore
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const srtContent = e.target.result;
      const captionObjects = srtToObjects(srtContent);
      const result = captionObjects.filter(caption => caption?.start && caption?.duration);
      resolve(result)
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
export const eventsToSubtitleObjectsFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const subtitleObjects = eventsToSubtitleObjects(data);
        const normSubtitleObjects = normalizeSubtitleObjects(subtitleObjects);
        resolve(normSubtitleObjects);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsText(file);
  });
}

const normalizeSubtitleObjects = (subtitleObjects) => {
  for (let i = 0; i < subtitleObjects.length - 1; i++) {
    const current = subtitleObjects[i];
    const next = subtitleObjects[i + 1];

    const currentEnd = parseFloat(current.start) + parseFloat(current.duration);
    const nextStart = parseFloat(next.start);

    if (currentEnd > nextStart) {
      current.duration = (nextStart - parseFloat(current.start)).toFixed(3);
    }
  }
  return subtitleObjects;
}

export const eventsToSubtitleObjects = (data) => {
  const subtitleObjects = [];

  data.events.forEach(event => {
    const startTime = event.tStartMs;
    const endTime = startTime + event.dDurationMs;

    // Convert milliseconds to SRT time format (HH:MM:SS,mmm)
    const startSrtTime = convertMillisecToSecMillises(startTime);
    const endSrtTime = convertMillisecToSecMillises(endTime);

    // Combine text segments with proper handling of newlines
    if (event.segs?.length > 1) {
      const text = event.segs.map(seg => seg.utf8).join('');

      const subtitleObject = {
        start: startSrtTime,
        duration: convertMsToSrtDuration(endTime - startTime),
        text: text
      };

      subtitleObjects.push(subtitleObject);
    }
  });

  return subtitleObjects;
}

function convertMillisecToSecMillises(milliseconds) {
  return milliseconds / 1000;
}

function convertMsToSrtTime(milliseconds) {
  const hours = Math.floor(milliseconds / 3600000).toString().padStart(2, '0');
  const minutes = Math.floor((milliseconds % 3600000) / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((milliseconds % 60000) / 1000).toString().padStart(2, '0');
  const millisecondsStr = (milliseconds % 1000).toString().padStart(3, '0');

  return `${hours}:${minutes}:${seconds},${millisecondsStr}`;
}

function convertMsToSrtDuration(durationMs) {
  const seconds = Math.floor(durationMs / 1000).toString().padStart(2, '0');
  const millisecondsStr = (durationMs % 1000).toString().padStart(3, '0');

  return `${seconds},${millisecondsStr}`;
}
function srtToObjects(srtContent) {
  const captions = srtContent.split(/\n\s*\n/);

  const captionObjects = captions.map(caption => {
    //printLogOption('info', `srtToObjects: ${caption}`);
    const lines = caption.trim().split('\n');
    if (lines.length >= 3 && lines[1].includes('-->')) {
      const timecode = lines[1].split(' --> ');

      const start = parseTimecode(timecode[0]);
      const end = parseTimecode(timecode[1]);
      const captionObject = {

        start: start,
        duration: end - start,
        text: lines.slice(2).join(' ')
      }
      return captionObject;
    }
  });

  return captionObjects;
}

function calculateDuration(start, end) {
  const durationInSeconds = (end - start) / 1000; // Convert to seconds
  return durationInSeconds.toFixed(3); // Format to three decimal places
}

function parseTimecode(timecode) {
  const [hh, mm, ss] = timecode.replace(',', '.').split(':').map(parseFloat);
  const result = (hh * 3600 + mm * 60 + ss).toString(); // Convert to seconds
  return result;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  const milliseconds = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
  return `${hours}:${minutes}:${secs},${milliseconds}`;
}

function convertToSRT(captions) {
  return captions.map((caption, index) => {
    const start = formatTime(parseFloat(caption.start));
    const end = formatTime(parseFloat(caption.start) + parseFloat(caption.duration));
    return `${index + 1}\n${start} --> ${end}\n${caption.text}\n`;
  }).join('\n');
}

export function saveCaptionObjectsToFile(captions, title) {
  const srtContent = convertToSRT(captions);
  const blob = new Blob([srtContent], { type: 'application/json' });
  const objUrl = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = objUrl;
  let safeTitle = title.replace(/[<>:"/\\|?*]+/g, '');
  const fileName = safeTitle + '.srt';
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  return fileName;
}
