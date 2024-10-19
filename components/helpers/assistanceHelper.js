import {
  getWordAssistance,
  getTextAssistance,
  getExerciseAssistance
}
  from './fetchData';

export async function assistanceRequestFromCloud(user, content, contentLanguage, answerLanguage) {
  if (typeof contentLanguage !== 'string' || typeof answerLanguage !== 'string' || typeof content !== 'string') {
    throw new Error('assistanceRequestFromCloud: The Languages and theContent must be strings');
  }
  let result = '';
  try {
    document.body.style.cursor = 'wait';
    if (isOneWordContent(content)) {
      result = await getWordAssistance(user, content, contentLanguage, answerLanguage);
    }
    else {
      result = await getTextAssistance(user, content, contentLanguage, answerLanguage);
    }
    console.log('info', `assistanceRequestFromCloud: result: ${result}`);
    return result;
  } finally {
    document.body.style.cursor = 'default';
  }
}

export async function assistanceExerciseRequestFromCloud(user, content, contentLanguage, answerLanguage) {
  if (typeof contentLanguage !== 'string' || typeof answerLanguage !== 'string' || typeof content !== 'string') {
    throw new Error('assistanceExerciseRequestFromCloud: The Languages and theContent must be strings');
  }
  let result = '';
  try {
    document.body.style.cursor = 'wait';
      result = await getExerciseAssistance(user, content, contentLanguage, answerLanguage);
    console.log('info', `assistanceExerciseRequestFromCloud: result: ${result}`);
    return result;
  } finally {
    document.body.style.cursor = 'default';
  }
}

function isOneWordContent(theContent) {
  const delimiters = [' ', ',', '.', ';', ':', '!', '?'];
  for (let delimiter of delimiters) {
    if (theContent.includes(delimiter)) {
      return false;
    }
  }
  return true;
}

