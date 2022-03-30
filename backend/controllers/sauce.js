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
        
        // ternaire, objet sauce contient aussi fichier si changement image
        const sauceObject = req.file ?
            {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}` `${req.get('host')}/images/${req.file.filename}`
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
    sauce.findOne({ _id: req.params.id })
        .then(newSauce => {
            let i = 0;
            let tabLikes = []; let tabDislikes = [];
            let already_liked = 0; let already_disliked = 0;
            let type_like = req.body.like;
            let user_id = req.body.userId;

           
            if(newSauce.usersLiked) {
                tabLikes = JSON.parse(newSauce.usersLiked);
                while(i < tabLikes.length) {
                    if(tabLikes[i] == user_id) { 
                        if(type_like == 0 || type_like == -1) {
                            tabLikes.splice(i, 1); 
                            newSauce.likes --;
                        }
                        already_liked = 1;
                    }
                    i ++;
                }
            }
            if(newSauce.usersDisliked) {
                tabDislikes = JSON.parse(newSauce.usersDisliked); i = 0;
                while(i < tabDislikes.length) {
                    if(tabDislikes[i] == user_id) { 
                        if(type_like == 0 || type_like == 1) { 
                            tabDislikes.splice(i, 1); 
                            newSauce.dislikes --;
                        }
                        already_disliked = 1;
                    }
                    i ++;
                }
            }

      
            if(type_like == 1 && already_liked == 0) {
                tabLikes.push(user_id);
                newSauce.likes ++; 
            }
            if(type_like == -1 && already_disliked == 0) {
                tabDislikes.push(user_id);
                newSauce.dislikes ++; 
            }

            sauce.updateOne({ _id: req.params.id }, { 
                    likes: newSauce.likes, 
                    dislikes: newSauce.dislikes, 
                    usersLiked: JSON.stringify(tabLikes), 
                    usersDisliked: JSON.stringify(tabDislikes)
                })
                .then(() => res.status(200).json({ message: 'Updated ! '}))
                .catch(error => res.status(400).json({ error }));

        })
        .catch(error => res.status(500).json({ error }));
}; 
