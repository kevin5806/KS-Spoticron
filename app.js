const express = require('express');
const axios = require('axios');

require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', async (req, res) => {
    
    try {
        const spotifyToken = process.env.SPOTIFY_TOKEN;

        const spotifyRes = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
        headers: {
            'Authorization': `Bearer ${spotifyToken}`
        },
        params: {
            limit: 5
        }
        });

        console.log(spotifyRes);

        const cron = 'ciao';

        res.render('index', {});

    } catch (e) {

        res.status(e.response?.status || 500).json({ error: 'Si è verificato un errore nella richiesta' });

    }
})


app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
})