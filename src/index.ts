import express from 'express';
import bodyParser from 'body-parser';
import getGameDetails from './steamHandler';
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(bodyParser.json({limit: '50mb'}));

app.post('/apps', async (req, res) => {
  const appIds: number[] = req.body.appIds;
  const result = await getGameDetails(appIds);
  res.send(result);
});
