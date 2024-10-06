
// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs  = require('fs');
const app = express();
const path = require('path');

app.use(cors({
  origin: "http://localhost:3000", 
}));

// const PORT = process.env.PORT || 3000;

// Basic route to check server
app.get('/', (req, res) => {
  res.send('Hello from server!');
});

// Serve static files from the frontend/models directory
app.use('/models', express.static(path.join(__dirname, '../frontend/models')));

app.get('/load-page', (req, res) => {

  const filePath = path.join(__dirname, 'planets.json'); // Path to the JSON file
    // Sending a GET request using the fetch API
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading data');
    }
    
    try {
      const jsonData = JSON.parse(data); // Parse the JSON data
      res.json(jsonData); // Send the parsed data as JSON response
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      res.status(500).send('Error parsing data');
    }
  });


})

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
