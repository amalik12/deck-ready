import SteamUser from 'steam-user';
const client = new SteamUser({
  enablePicsCache: true,
});

client.logOn();

export const loggedIn = new Promise<void>(resolve => {
  client.on('loggedOn', () => {
    resolve();
  });
});

export default client;
