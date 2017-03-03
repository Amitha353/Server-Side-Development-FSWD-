var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Promotions = require('../models/promotions');

var Verify = require('./verify');

var promoRouter  = express.Router();
promoRouter.use(bodyParser.json());

promoRouter.route('/')
.all(Verify.verifyOrdinaryUser)
.get(function(req,res,next){
        Promotions.find({}, function(err, promo) {
            if(err) throw err;
            res.json(promo);
        });
})

.post(Verify.verifyAdmin, function(req, res, next){
    Promotions.create(req.body, function(err, promo) {
        if(err) throw err;
        console.log("Promotion finally!");
        var id = promo._id;
        
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the promotion with id: ' + id);
    });  
})

.delete(Verify.verifyAdmin, function(req, res, next){
       Promotions.remove({}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

promoRouter.route('/:promoId')
.all(Verify.verifyOrdinaryUser)
.get(function(req,res,next){
       Promotions.findById(req.params.promoId, function (err, promo) {
        if (err) throw err;
        res.json(promo);
    });
})

.put(Verify.verifyAdmin, function(req, res, next){
        Promotions.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
        }, {
        new: true
        }, function (err, promo) {
        if (err) throw err;
        res.json(promo);
    });
})

.delete(Verify.verifyAdmin, function(req, res, next){
        Promotions.findByIdAndRemove(req.params.promoId, function (err, resp) {        if (err) throw err;
        res.json(resp);
    });
});

promoRouter.route('/:promoId/comments')
.all(Verify.verifyOrdinaryUser)
.get(function (req, res, next) {
    Promotions.findById(req.params.promoId, function (err, promo) {
        if (err) throw err;
        res.json(promo.comments);
    });
})

.post(function (req, res, next) {
    Promotions.findById(req.params.promoId, function (err, promo) {
        if (err) throw err;
        promo.comments.push(req.body);
        promo.save(function (err, promo) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(promo);
        });
    });
})

.delete(Verify.verifyAdmin, function (req, res, next) {
    Promotions.findById(req.params.promoId, function (err, promo) {
        if (err) throw err;
        for (var i = (promo.comments.length - 1); i >= 0; i--) {
            promo.comments.id(promo.comments[i]._id).remove();
        }
        promo.save(function (err, result) {
            if (err) throw err;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all comments!');
        });
    });
});

promoRouter.route('/:promoId/comments/:commentId')
.all(Verify.verifyOrdinaryUser)
.get(function (req, res, next) {
    Promotions.findById(req.params.promoId, function (err, promo) {
        if (err) throw err;
        res.json(promo.comments.id(req.params.commentId));
    });
})

.put(function (req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Promotions.findById(req.params.promoId, function (err, promo) {
        if (err) throw err;
        promo.comments.id(req.params.commentId).remove();
        promo.comments.push(req.body);
        promo.save(function (err, promo) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(promo);
        });
    });
})

.delete(function (req, res, next) {
    Promotions.findById(req.params.promoId, function (err, promo) {
        promo.comments.id(req.params.commentId).remove();
        promo.save(function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });
});

module.exports = promoRouter;