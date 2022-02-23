import express from 'express';
import bodyParser from 'body-parser';
import SteamAPI from 'steamapi';
import getGameDetails from './steamHandler';
import fetch from 'node-fetch';
import redis from './redisClient';
import passport from 'passport';
import Steam from 'passport-steam';

const path = require('path');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static(path.join(__dirname, 'build')));

passport.use(
  new Steam.Strategy(
    {
      returnURL: process.env.STEAM_REALM + '/auth/steam/callback',
      realm: process.env.STEAM_REALM,
      apiKey: process.env.STEAM_API_KEY,
    },
    (identifier, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get(
  '/auth/steam',
  passport.authenticate('steam', {prompt: 'consent'}),
  (req, res) => {
    // The request will be redirected to Steam for authentication, so
    // this function will not be called.
  }
);

app.get(
  '/auth/steam/callback',
  passport.authenticate('steam', {prompt: 'consent'}),
  (req, res) => {
    res.redirect('/signin/' + (req.user as any).id);
  }
);

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
      const parsedResponse = await response.json();
      games = parsedResponse?.response?.games;
      // Games is undefined if profile or library is hidden
      if (games?.length) {
        redis.setEx(`library:${id}`, 172800, JSON.stringify(games));
      } else {
        console.log(id, parsedResponse);
        return res.sendStatus(401);
      }
    }

    const playtimeMap: Map<number, number> = new Map();
    const appIds: number[] = games.map(game => {
      playtimeMap.set(game.appid, game.playtime_forever);
      return game.appid;
    });

    const result = await getGameDetails(appIds, playtimeMap);

    return res.send(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'Invalid format') {
      return res.sendStatus(400);
    }

    return res.sendStatus(500);
  }
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
