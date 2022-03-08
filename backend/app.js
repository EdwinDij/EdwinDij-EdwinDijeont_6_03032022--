const express = require('express');

const app = express();

app.use(express.json());

app.use((req, res, next)=> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.post

app.use('/api/stuff', (req, res, next) => {

  const stuff =[
    {
      _id: 'oeihfzeoi',
      title: 'Mon premier objet',
      description: 'Les infos de mon premier objet',
      imageUrl: '',
      price: 4900,
      userId: 'gsomihvgios',
    },
    {
      _id: 'oeihfzeomoihi',
      title: 'Mon deuxième objet',
      description: 'Les infos de mon premier objet',
      imageUrl: '',
      price: 2900,
      userId: 'gsomihvgios',
    },
  ];
res.status(200).json(stuff)
})
module.exports = app;