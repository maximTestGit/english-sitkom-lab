import {
  getWordAssistance,
  getTextAssistance,
  getExerciseAssistance,
  getReadAssistance,
}
  from './fetchData';

export async function assistanceTextAnalyzeRequest(user, content, contentLanguage, answerLanguage) {
  if (typeof contentLanguage !== 'string' || typeof answerLanguage !== 'string' || typeof content !== 'string') {
    throw new Error('assistanceTextAnalyzeRequest: The Languages and theContent must be strings');
  }
  let result = '';
  if (isOneWordContent(content)) {
    result = await getWordAssistance(user, content, contentLanguage, answerLanguage);
  }
  else {
    result = await getTextAssistance(user, content, contentLanguage, answerLanguage);
  }
  console.log('info', `assistanceTextAnalyzeRequest: result: ${result}`);
  return result;
}
export async function assistanceReadRequest(user, content, contentLanguage, answerLanguage) {
  if (typeof contentLanguage !== 'string' || typeof answerLanguage !== 'string' || typeof content !== 'string') {
    throw new Error('assistanceReadRequest: The Languages and theContent must be strings');
  }
  let result = '';
  result = await getReadAssistance(user, content, contentLanguage, answerLanguage);
  console.log('info', `assistanceReadRequest: result: ${result}`);
  return result;
}

export async function assistanceExerciseRequest(user, content, contentLanguage, answerLanguage) {
  if (typeof contentLanguage !== 'string' || typeof answerLanguage !== 'string' || typeof content !== 'string') {
    throw new Error('assistanceExerciseRequest: The Languages and theContent must be strings');
  }
  let result = '';
  result = await getExerciseAssistance(user, content, contentLanguage, answerLanguage);
  console.log('info', `assistanceExerciseRequest: result: ${result}`);
  return result;
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

