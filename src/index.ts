import express from 'express';
import bodyParser from 'body-parser';
import SteamAPI from 'steamapi';
import getGameDetails from './steamHandler';
import fetch from 'node-fetch';
import redis from './redisClient';

const path = require('path');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static(path.join(__dirname, 'build')));

app.post('/api/apps', async (req, res) => {
  try {
    let id;
    const cachedId = await redis.get(`id:${req.body.url}`);
    if (cachedId) {
      id = Number(cachedId);
    } else {
      const steam = new SteamAPI(process.env.STEAM_API_KEY);
      id = await steam.resolve(req.body.url);
      redis.setEx(`id:${req.body.url}`, 345600, id);
    }

    let games;
    const cachedGames = await redis.get(`library:${id}`);
    if (cachedGames) {
      games = JSON.parse(cachedGames);
    } else {
      const response = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${id}&include_appinfo=1&include_played_free_games=1`
      );
      games = (await response.json()).response.games;
      // Games is undefined if profile or library is hidden
      redis.setEx(`library:${id}`, 172800, JSON.stringify(games));
    }

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

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
