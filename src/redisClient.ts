import {createClient} from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

(async () => {
  redis.on('error', err => console.log('Redis Client Error', err));

  await redis.connect();
})();

// const redis = {
//   get: key => null,
//   mGet: keys => keys.map(key => redis.get(key)),
//   setEx: (key, time, value) => undefined,
// };
export default redis;
