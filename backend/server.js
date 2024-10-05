
// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// const PORT = process.env.PORT || 3000;

// Basic route to check server
app.get('/', (req, res) => {
  res.send('Hello from server!');
});

app.listen(8000, () => {
    console.log('Server started on http://localhost:8000');
});

/*
// Example route to fetch data from the NASA API
app.get('/nasa-data', async (req, res) => {
  try {
    const response = await axios.get('https://data.nasa.gov/resource/b67r-rgxc.json');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
*/
