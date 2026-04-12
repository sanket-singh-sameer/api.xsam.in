const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Express app is running. Visit /runtime-error to trigger an error.');
});

app.get('/runtime-error', (req, res) => {
  // Intentionally trigger a runtime error for testing.
  const result = notDefinedFunction();
  res.json({ result });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
