const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'Test-Task.html'));
});

app.get('/api/images', function(req, res) {
  const searchTerm = req.query.searchTerm;
  const currentTag = req.query.currentTag || '';
  const page = req.query.page || 1;

  let query = `&q=${encodeURIComponent(searchTerm)}`;

  if (currentTag !== '') {
    query += `&category=${encodeURIComponent(currentTag)}`;
  }

  const apiKey = '38268432-3aef07b3abb18c54d3ff5f1cd';

  axios
    .get(`https://pixabay.com/api/?key=${apiKey}${query}&page=${page}`)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      console.log('Error retrieving images:', error);
      res.status(500).json({ error: 'Error retrieving images' });
    });
});

app.listen(port, function(error) {
  if (error) {
    console.log('Something went wrong', error);
  } else {
    console.log('Server is listening on port ' + port);
  }
});
