import { isMobile } from 'react-device-detect';
import { fetchLearningLanguageFromLocalStorage } from '../helpers/storageHelper';

export const inDebugEnv = isInDevEnvironment();
console.log(`running in DebugEnv=${inDebugEnv}`);
export const isRunningOnBigScreen = !isMobile;
export const currentVersion = 'version 2.0.204';

function isInDevEnvironment() {
    try {
        require.resolve('../../.env/.dev');
        return true
    } catch (error) {
        return false
    }
}


export function getYoutubeUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
}

export function saveExerciseUrl() {
    let url = 'https://us-central1-youtube-project-404109.cloudfunctions.net/function-save-exercise-2-0';
    if (inDebugEnv) {
        url = 'https://us-central1-youtube-project-404109.cloudfunctions.net/function-save-exercise-test';
    }
    return url;
}

export function loginUrl() {
    return 'https://me-west1-youtube-project-404109.cloudfunctions.net/function-login';
}

export function getCaptionsUrlPost() {
    let url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json-2-0`;
    if (inDebugEnv) {
        url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json-test`;
    }
    return url;
}

export function captionsSaveToStorageUrl() {
    let url = 'https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-save-storage-2-0';
    if (inDebugEnv) {
        url = 'https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-save-storage-test';
    }
    return url;
}
export function getPlayistToRegistryUrl() {
    let url = 'https://me-west1-youtube-project-404109.cloudfunctions.net/function-save-playlist-registry-2-0';
    if (inDebugEnv) {
        url = 'https://me-west1-youtube-project-404109.cloudfunctions.net/function-save-playlist-registry-test';
    }
    return url;
}

export function getPlaylistContentUrlPost() {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-get-playlst-content-2-0`;
    if (inDebugEnv) {
        url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-get-playlst-content-test`;
    }
    return url;
}

export function getPlaylistRegistryUrlPost() {
    let url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-get-playlist-registry-2-0`;
    if (inDebugEnv) {
        url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-get-playlist-registry-test`;
    }
    return url;
}

export function getTranslationUrlPost() {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-translate-2-0`;
    if (inDebugEnv) {
        url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-translate-test`;
    }
    return url;
}
export function getTranslationUrlGet(text, fromLanguage, toLanguage) {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-translate-2-0?text=${text}&from=${fromLanguage}&to=${toLanguage}`;
    if (inDebugEnv) {
        url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-translate-test?text=${text}&from=${fromLanguage}&to=${toLanguage}`;
    }
    return url;
}

export function getAssistanceRequestUriPost() {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-assistance-request-2-0`;
    if (inDebugEnv) {
        url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-assistance-request-test`;
    }
    return url;
}

export function getWordAssistanceUrlPost() {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-word-assistance-2-0`;
    if (inDebugEnv) {
        url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-word-assistance-test`;
    }
    return url;
}

export function getTextAssistanceUrlPost() {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-text-assistance-2-0`;
    if (inDebugEnv) {
        url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-text-assistance-test`;
    }
    return url;
}

export function getExerciseAssistanceUrlPost() {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-exercise-assistance-2-0`;
    if (inDebugEnv) {
        url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-exercise-assistance-test`;
        //url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-exercise-assistance-claude-test`;
    }
    return url;
}
export function getReadAssistanceUrlPost() {
    let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-read-assistance-2-0`;
    if (inDebugEnv) {
        url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-read-assistance-test`;
    }
    return url;
}

export function getSaveFlashcardUrlPost() {
    let url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-create-flashcard-2-0`;
    if (inDebugEnv) {
        url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-create-flashcard-test`;
    }
    return url;
}

export function getFlashcardsCollectionUrlPost() {
    let url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-get-flashcards-2-0`;
    if (inDebugEnv) {
        url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-get-flashcards-test`;
    }
    return url;
}

export function getFlashcardUpdateResultUrlPost() {
    let url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-update-flashcard-result-2-0`;
    if (inDebugEnv) {
        url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-update-flashcard-result-test`;
    }
    return url;
}

export const loginoutEvents = {
    REGISTER_SUCCESS: 'register-success',
    REGISTER_ERROR: 'register-error',
    LOGIN_SUCCESS: 'login-success',
    LOGIN_ERROR: 'login-error',
    LOGOUT_SUCCESS: 'logout-success',
    LOGOUT_ERROR: 'logout-error',
};

export const languages = [
    { code: 'af-ZA', name: 'Afrikaans', nativeName: 'Afrikaans' },
    { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية' },
    //{ code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'hr-HR', name: 'Croatian', nativeName: 'Hrvatski' },
    { code: 'zh-CN', name: 'Chinese', nativeName: '中文' },
    { code: 'en-US', name: 'English', nativeName: 'English' },
    { code: 'fr-FR', name: 'French', nativeName: 'Français' },
    { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
    { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית' },
    //{ code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
    //{ code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    //{ code: 'pt-BR', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', helpSubpath: 'ru/help.html' },
    { code: 'es-ES', name: 'Spanish', nativeName: 'Español' },
    { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська' }
];

export function getLanguageName(language) {
    const lang = languages.find(l => l.code === language);
    return lang ? lang.name : 'English';
}

export function getLearningLanguageName(language) {
    return getLanguageName(language);
}

export function extractCulture(language) {
    const result = language?.split('-')[0] ?? 'en';
    return result;
}

export function getCultureLanguageName(culture) {
    const lang = languages.find(l => l.code.startsWith(culture));
    return lang ? lang.name : 'English';
}

export function getUpdateFlashcardDataUrlPost() {
    let url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-update-flashcard-data-2-0`;
    if (inDebugEnv) {
        url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-update-flashcard-data-test`;
    }
    return url;
}

export function getDeleteFlashcardUrlPost() {
    let url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-delete-flashcard-2-0`;
    if (inDebugEnv) {
        url = `https://me-west1-youtube-project-404109.cloudfunctions.net/function-delete-flashcard-test`;
    }
    return url;
}

export function initLearningLanguage() {
    let result = fetchLearningLanguageFromLocalStorage();
    result = result || process.env.NEXT_PUBLIC_LEARNING_LANGUAGE // vercel env.var.
        ||
        process.env.LEARNING_LANGUAGE
        ||
        process.env.REACT_APP_LEARNING_LANGUAGE // netlify env.var.
        ||
        // (inDebugEnv && 'he-IL')
        // ||
        'en-US';
    return result;
}

export function getHelpUrl(culture) {
    const lang = languages.find(l => l.code.startsWith(culture));
    const helpSubpath = lang?.helpSubpath;
    const result = `https://about.tube2fluency.com/${helpSubpath ?? ''}`;
    return result;
}
