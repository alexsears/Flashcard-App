const admin = require('firebase-admin');
const db = admin.firestore();
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

const synthesizeSpeech = async (req, res) => {
    console.log('Received request to synthesize speech');
    const { text, languageCode } = req.body;

    if (!text || !languageCode) {
        console.error('Missing required parameters');
        return res.status(400).send('Missing required parameters: text and languageCode');
    }

    const request = {
        input: { text },
        voice: { languageCode, name: languageCode === 'th-TH' ? 'th-TH-Standard-A' : 'en-US-Standard-C', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    console.log(`Attempting to synthesize speech from text "${text}" with language code "${languageCode}"`);

    try {
        const [response] = await client.synthesizeSpeech(request);
        console.log('Speech synthesis successful');
        res.set('Content-Type', 'audio/mpeg');
        res.send(response.audioContent);
    } catch (error) {
        console.error('Error synthesizing speech: ', error);
        res.status(500).send('Error synthesizing speech: ' + error.message);
    }
};

module.exports = {
    synthesizeSpeech,
};
