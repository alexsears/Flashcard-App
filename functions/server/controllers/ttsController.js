const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

const synthesizeSpeech = async (req, res) => {
    console.log('Received request to synthesize speech');
    const text = req.body.text;
    const languageCode = req.body.languageCode;

    const request = {
        input: { text: text },
        voice: { languageCode: languageCode, name: 'th-TH-Standard-A', ssmlGender: 'NEUTRAL' },
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
        res.status(500).send('Error synthesizing speech: ' + error);
    }
};

module.exports = {
    synthesizeSpeech,
};
