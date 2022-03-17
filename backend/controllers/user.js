 // le package jsonwebtoken attribu un token à un utilisateur au moment ou il se connecte
const jwt = require('jsonwebtoken');

// utilisation de  l'algorithme bcrypt pour hasher le mot de passe des utilisateurs
const bcrypt = require('bcrypt');
const validator = require('email-validator');
const user = require('../models/user');

// sauvegarde d'un nouvel utilisateur

exports.signup = (req, res, next) => {
    if(!validator.validate(req.body.email))return res.status(403).json({message: 'Le format de l\'adresse mail est incorrect.'})
    if(req.body.password.length > 8) {
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const myUser = new user({
                    email: req.body.email,
                    password: hash
                });
            myUser.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé.' }))
                .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
    } else return res.status(403).json({message: 'Votre mot de passe doit contenir 8 caractères minimum.'})
};

// Le Middleware pour la connexion d'un utilisateur vérifie si l'utilisateur existe dans la base MongoDB lors du login
//si oui il vérifie son mot de passe, s'il est bon il renvoie un TOKEN contenant l'id de l'utilisateur, sinon il renvoie une erreur
exports.login = (req, res, next) => {
    user.findOne({ email: req.body.email })
        .then(myUser => {
            if(!myUser) { return res.status(401).json({ error: 'Utilisateur non trouvé.' }); }
            bcrypt.compare(req.body.password, myUser.password)
            .then(valid => {
                if(!valid) { return res.status(401).json({ error: 'Mot de passe incorrect.' }); }
                const newToken = jwt.sign({ userId: myUser._id }, 'RANDOM_TOKEN_SECRET', { expiresIn: '24h' });
                res.setHeader('Authorization', 'Bearer '+ newToken);
                res.status(200).json({
                    userId: myUser._id,
                    token: newToken
                });
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};