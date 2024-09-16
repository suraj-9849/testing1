require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const vision = require('@google-cloud/vision');

const app = express();
const port = process.env.PORT|3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS|'key.json',
});

const beachData = [
    'beach', 'water', 'trees', 'sand', 'ocean', 'sea', 'waves', 'sunset',
    'swimsuit', 'palm tree', 'shore', 'surfing', 'coast', 'tropical', 'seaside', 'island', 'beach volleyball', 'swimming'
];

app.post('/analyze-image', async (req, res) => {
    const base64Image = req.body.base64Image;

    try {
        const [result] = await client.labelDetection({
            image: { content: base64Image }
        });

        const labels = result.labelAnnotations;
        const isBeachRelated = labels.some(lb =>
            beachData.some(e =>
                lb.description.toLowerCase().includes(e)
            )
        );

        res.json({ isBeachRelated, labels });
    } catch (err) {
        console.error('ERROR:', err);
        res.status(500).send('Error analyzing image');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
