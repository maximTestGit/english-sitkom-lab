import Swal from 'sweetalert2';

function decodeHtml(encodedStr) {
    if (!encodedStr) {
        return '';
    }
    const parser = new DOMParser();
    const dom = parser.parseFromString(`<!doctype html><body>${encodedStr}`, 'text/html');
    return dom.body.textContent
}

function pronounceText(readLanguage, textToReadAloud, rate = 1) {
    if ('speechSynthesis' in window) {
        console.log(`Reading aloud START: ${textToReadAloud} in ${readLanguage}`);
        const utterance = new SpeechSynthesisUtterance(textToReadAloud);
        utterance.lang = readLanguage;
        utterance.volume = 1; // Set volume (0.0 to 1.0)
        utterance.rate = rate; // Set rate (0.1 to 1.0)
        window.speechSynthesis.speak(utterance);
        console.log(`Reading aloud FINISH: ${textToReadAloud} in ${readLanguage}`);
    } else {
        Swal.fire({
            title: t`Error`,
            text: t`Speech synthesis is not supported in this browser.`,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

export { decodeHtml, pronounceText };