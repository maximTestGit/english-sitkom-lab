import { getTranslation } from "./fetchData";

export async function translateCaptions(user, captions, sourceLanguage, targetLanguage) {
    let answer = await Promise.all(captions.map(async (caption) => {
        let captionClone = { ...caption };
        captionClone.text = await getTranslation(user, caption.text, sourceLanguage, targetLanguage);
        return captionClone;
    }));
    return answer;
}
