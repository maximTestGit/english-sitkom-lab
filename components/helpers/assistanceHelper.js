import { getAssistanceRequestUriPost } from './../data/configurator';

export async function assistanceRequestFromCloud(prompt, theContent) {
    if (typeof prompt !== 'string' || typeof theContent !== 'string') {
      throw new Error('Both prompt and theContent must be strings');
    }
    try {
      document.body.style.cursor = 'wait';
      const promptParam = encodeURIComponent(prompt);
      const contentParam = encodeURIComponent(theContent);
      const url = `${getAssistanceRequestUriPost()}?prompt=${promptParam}&content=${contentParam}`;
      console.log('info', `assistanceRequestFromCloud: url: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        console.log('error', `assistanceRequestFromCloud: error: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      console.log('info', `assistanceRequestFromCloud: data: ${data}`);
      return data;
    } finally {
      document.body.style.cursor = 'default';
    }
  }

  export async function getAssistanceRequest(user, prompt, textToAnalyze, textLanguage, explainInLanguage) {
    if (!user) {
      throw new Error('User must be signed in');
    }
    if (typeof textToAnalyze !== 'string' || typeof textLanguage !== 'string' || typeof explainInLanguage !== 'string') {
      throw new Error('All parameters must be strings');
    }
    //const prompt = `Analyze and explain the following text in ${explainInLanguage} for ${explainInLanguage} speaking students learning ${textLanguage} language.`;
    const theContent = textToAnalyze;
    const result = await assistanceRequestFromCloud(prompt, theContent);
    return result;
  }
  
  