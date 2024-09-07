export function loadCaptionObjectsFromFile(file) {
  // @ts-ignore
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      var captionObjects = [];
      const srtContent = e.target.result;
      captionObjects = srtToObjects(srtContent);
      resolve(captionObjects)
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
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
