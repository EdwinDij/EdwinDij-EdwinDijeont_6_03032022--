const fs = require('fs');
const sauce = require('../models/sauce');
const auth = require('../middleware/auth')


exports.getAllSauces = (req, res, next) => {
    sauce.find()
        .then(newSauce => res.status(200).json(newSauce))
        .catch(error => res.status(400).json({ error }));
};


exports.getOneSauce = (req, res, next) => {
    sauce.findOne({ _id: req.params.id })
        .then(newSauce => res.status(200).json(newSauce))
        .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const newSauce = new sauce({ 
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: '',
        usersDisliked: ''
    });
    // Sauvegarde de la sauce dans la base de données
    newSauce.save()
        .then(() => res.status(201).json({ message: 'Nouvelle sauce insérée avec succès !' }))
        .catch(error => res.status(400).json({ error }));
};


// Permet de modifier une sauce
exports.updateSauce = (req, res, next) => { 

    sauce.findOne({ _id: req.params.id }).then(res_sauce => {
        // test si c'est le user qui possède la sauce qui modifie
        if(res_sauce.userId !== req.auth.userId) {
            res.status(401).json({ error: new Error('Requête non autorisée!')});
        }


        // ternaire, objet sauce contient aussi fichier si changement image
        const sauceObject = req.file ?
            {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            } : { ...req.body };

        // factorisation 
        function updateProcess() {
            sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id:req.params.id})
                .then(() => {
                    console.log("Updated");
                    return res.status(200).json({ message: 'Sauce modifiée' })
                }
                    )

                .catch(error => res.status(400).json({ error }));
        }
        // il s'agit d'un changement d'image, auquel cas suppression de l'image d'origine
        if(req.file) {
            fs.unlink(res_sauce.imageUrl.substring(res_sauce.imageUrl.indexOf('images/')), () => {
                updateProcess();
            });
        }
        else { // ici pas de changement d'image
            updateProcess();
        }

    })
    .catch(error => res.status(400).json({ error }));
};

// Permet de supprimer la sauce
exports.deleteSauce = (req, res, next) => {
    
    sauce.findOne({
        _id: req.params.id
    })
    .then ((sauce) =>{

        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            if(!sauce) {
                return res.status(404).json ({
                    error: new Error('Objet non trouvé !')
                });
            }
            if(sauce.userId !== req.auth.userId) {
                return res.status(401).json({
                    error: new Error ('Requête non autorisé !')
                });
            }
            sauce.deleteOne ({
                _id: req.params.id
            })
            .then(() => res.status(200).json({
                Message: 'Objet Supprimé !'
            }))
            .catch(error => res.status(400).json({
                error
            }));
        });
    })
    .catch(error => res.status(500).json({
        error
    }))
};

exports.likeSauce = (req, res, next) => {
    if(req.body.like === 1) {
        sauce.updateOne(
            {_id: req.params.id},
            {$inc: {likes: +1}, $push: { usersLiked: req.body.userId}})
            .then((sauce) => res.status(200).json({message : 'Like ajouté !'}))
            .catch(error => res.status(400).json({ error }))
    }
    else if(req.body.like === -1) {
        sauce.updateOne(
            {_id: req.params.id},
            {$inc: {dislikes: +1}, $push: {usersDisliked: req.body.userId}})
            .then((sauce) => res.status(200).json({message : 'Dislike ajouté !'}))
            .catch(error => res.status(400).json({ error }))

    }
    else {
        sauce.findOne({_id: req.params.id})
        .then(sauce => {
            if(sauce.usersLiked.includes(req.body.userId)) {
                sauce.updateOne(
                    {$inc: {likes: -1}, $pull: {usersLiked: req.body.userId}})
                    .then(() => res.status(200).json({message: 'Like enlevé'}))
                    .catch(error => res.status(400).json({error})
                )
            }
            else if(sauce.usersDisliked.includes(req.body.userId)) {
                sauce.updateOne(
                    {$inc: {Dislikes: -1}, $pull: {usersDisliked: req.body.userId}})
                    .then(() => res.status(200).json({message: 'Dislike enlevé'}))
                    .catch(error => res.status(400).json({error})
                )
            }
        })
    }
 };
