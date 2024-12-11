import { Translate } from '@google-cloud/translate/build/src/v2';

const translate = new Translate({
    keyFilename: '../translate-google.json', 
});

export const translateText = async (text, targetLanguage) => {
    try {
        const [translation] = await translate.translate(text, targetLanguage);
        return translation;
    } catch (error) {
        console.error('Error during translation:', error);
        throw new Error('Translation failed');
    }
};
