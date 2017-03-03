var express = require('express')
var bodyParser = require('body-parser')

var Favorites = require('../models/favorites')
var Verify = require('./verify')

var favoritesRouter = express.Router()

favoritesRouter.use(bodyParser.json())

/* Route '/' */

favoritesRouter
  .route('/')

  .all(Verify.verifyOrdinaryUser)

  .get(function (req, res, next) {
    var userId = req.decoded._doc._id

    Favorites.find({ postedBy: userId })
      .populate('postedBy dishes')
      .exec(function (err, dish) {
        if (err) return next(err)
        res.json(dish)
      })
  })

  .post(function (req, res, next) {
    var userId = req.decoded._doc._id
    var dishId = req.body._id

    Favorites.update({ postedBy: userId },
      { $push: { dishes: dishId } },
      { upsert: true },
      function (err, data) {
        if (err) return next(err)
        res.json(data)
      })
  })

  .delete(function (req, res, next) {
    var userId = req.decoded._doc._id

    Favorites.remove({ postedBy: userId }, function (err, resp) {
      if (err) next(err)
      res.json(resp)
    })
  })


favoritesRouter.route('/:dishId')
    .all(Verify.verifyOrdinaryUser)
    .delete(function (req, res, next) {

        Favorites.find({'postedBy': req.decoded._doc._id}, function (err, favorites) {
            if (err) return err
            var favorite = favorites ? favorites[0] : null

            if (favorite) {
                for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
                    if (favorite.dishes[i] == req.params.dishId) {
                        favorite.dishes.remove(req.params.dishId)
                    }
                }
                favorite.save(function (err, favorite) {
                    if (err) throw err
                    console.log('Here you go!')
                    res.json(favorite)
                })
            } else {
                console.log('No favourites!')
                res.json(favorite)
            }

        })
    })

module.exports = favoritesRouter