
// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors({
  origin: "http://localhost:3000", 
}));

// const PORT = process.env.PORT || 3000;

// Basic route to check server
app.get('/', (req, res) => {
  res.send('Hello from server!');
});

app.get('/load-page', (req, res) => {
    // Sending a GET request using the fetch API
  fetch('/planets.json') // API endpoint
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Parse JSON data from the response
  })
  .then(data => {
    // console.log(data); // Log the data to the console
    for(let i = 0; i < data.length; i++) {
      let obj = data[i];
      res.send(data);

   }
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });

  console.log("loaded")

  

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
