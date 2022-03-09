const express = require('express');

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://Edwind:<191623Er>@cluster-piquante.6sa2s.mongodb.net/Cluster-Piquante?retryWrites=true&w=majority',
{ useNewUrlParser: true,
  useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();

app.use(express.json());

app.use((req, res, next)=> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.post('/api/stuff', (req, res, next)=> {
  console.log(req.body);
  res.status(201).json({
    message: 'objet crée!'
  });
});

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