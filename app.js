
const express = require('express');
const { createClient } = require('redis');
const { nanoid } = require('nanoid');

const app = express();
const PORT = 3000;

app.use(express.json());

const redisClient = createClient({
  url: 'redis://redis:6379'
});

redisClient.connect()
  .then(() => console.log('Connected to Redis!'))
  .catch(err => console.log('Redis error:', err));

app.get('/', (req, res) => {
  res.json({
    message: 'URL Shortener API',
    usage: {
      shorten: 'POST /shorten with { url: "your-long-url" }',
      redirect: 'GET /r/:code'
    }
  });
});

app.post('/shorten', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      error: 'URL is required!'
    });
  }

  const code = nanoid(6);

  await redisClient.set(code, url, { EX: 86400 });

  res.json({
    original_url: url,
    short_code: code,
    short_url: `http://localhost:3000/r/${code}`,
    expires_in: '24 hours'
  });
});

app.get('/r/:code', async (req, res) => {
  const { code } = req.params;

  const originalURL = await redisClient.get(code);

  if (!originalURL) {
    return res.status(404).json({
      error: 'Short URL not found or expired!'
    });
  }

  res.redirect(originalURL);
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on port ${PORT} `);
});
