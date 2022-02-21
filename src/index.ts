import express from 'express';
import bodyParser from 'body-parser';
import SteamAPI from 'steamapi';
import getGameDetails from './steamHandler';
import fetch from 'node-fetch';

const path = require('path');

require('dotenv').config();
const app = express();
const port = 4000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static(path.join(__dirname, 'build')));

app.post('/api/apps', async (req, res) => {
  try {
    const steam = new SteamAPI(process.env.STEAM_API_KEY);
    const id = await steam.resolve(req.body.url);
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${id}&include_appinfo=1&include_played_free_games=1`
    );

    const games = (await response.json()).response.games;

    const playtimeMap: Map<number, number> = new Map();
    const appIds: number[] = games.map(game => {
      playtimeMap.set(game.appid, game.playtime_forever);
      return game.appid;
    });

    const result = await getGameDetails(appIds, playtimeMap);

    res.send(result);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});