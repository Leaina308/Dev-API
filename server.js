const express = require('express');
const api = require('./api');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'API Articles en ligne' }));

// Toutes les routes de l'API sont préfixées par /api
app.use('/api', api);

app.listen(3000, () => console.log('API sur http://localhost:3000/api/articles'));