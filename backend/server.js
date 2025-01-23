const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

// NewsAPIの設定
const API_KEY = 'd9440fbfd28f4d4daa669e95a2728fb0'; // ここにAPIキーを入力
const ENDPOINT = `https://newsapi.org/v2/top-headlines?country=jp&apiKey=${API_KEY}`;

// APIエンドポイント
app.get('/api/news', async (req, res) => {
  try {
    const response = await fetch(ENDPOINT);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'ニュースを取得できませんでした' });
  }
});

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
