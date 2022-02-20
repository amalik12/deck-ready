import express from 'express';
import bodyParser from 'body-parser';
import SteamAPI from 'steamapi';
import getGameDetails from './steamHandler';
require('dotenv').config();
const app = express();
const port = 4000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(bodyParser.json({limit: '50mb'}));

app.post('/api/apps', async (req, res) => {
  try {
    const steam = new SteamAPI(process.env.STEAM_API_KEY);
    const id = await steam.resolve(req.body.url);
    const games = await steam.getUserOwnedGames(id);
    const appIds: number[] = games.map(game => game.appID);

    const result = await getGameDetails(appIds);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});
