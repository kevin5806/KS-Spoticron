const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// La variabile per memorizzare il token di accesso dell'utente
let userAccessToken = '';

// Route per la pagina iniziale
app.get('/', (req, res) => {
  res.render('index', { userAccessToken });
});

// Route per iniziare il processo di autorizzazione
app.get('/login', (req, res) => {
  const queryParams = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: 'user-read-recently-played',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// Callback dopo l'autorizzazione
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const authResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    userAccessToken = authResponse.data.access_token;

    res.redirect('/');
  } catch (error) {
    console.error('Errore nell\'autenticazione:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Si è verificato un errore nell\'autenticazione' });
  }
});

// Route per visualizzare la cronologia degli ascolti dell'utente
app.get('/recently-played', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: {
        'Authorization': `Bearer ${userAccessToken}`
      },
      params: {
        limit: 25
      }
    });

    const recentlyPlayed = data.items;
    
    res.render('played', { recentlyPlayed })

  } catch (error) {
    console.error('Errore nella richiesta:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Si è verificato un errore nella richiesta' });
  }
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
