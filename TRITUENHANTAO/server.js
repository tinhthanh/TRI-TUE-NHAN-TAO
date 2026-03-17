const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files từ thư mục 
app.use(express.static(path.join(__dirname, '')));

// Fallback về index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
