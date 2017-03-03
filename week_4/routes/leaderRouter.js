var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Leaders = require('../models/leadership');
var Verify = require('./verify');

var leaderRouter  = express.Router();
leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.all(Verify.verifyOrdinaryUser)
.get(function(req,res,next){
    Leaders.find({}, function (err, lead) {
       if (err) throw err;
       res.json(lead);
    });
})

.post(Verify.verifyAdmin, function(req, res, next){
     Leaders.create(req.body, function (err, lead) {
        if (err) throw err;
        console.log('Leader created!');
        var id = lead._id;

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the leader with id: ' + id);
    });   
})

.delete(Verify.verifyAdmin, function(req, res, next){
       Leaders.remove({}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

leaderRouter.route('/:leaderId')
.all(Verify.verifyOrdinaryUser)
.get( function(req,res,next){
       Leaders.findById(req.params.leaderId, function (err, lead) {
        if (err) throw err;
        res.json(lead);
    });
})

.put(Verify.verifyAdmin, function(req, res, next){
   Leaders.findByIdAndUpdate(req.params.leaderId, {
        $set: req.body
    }, {
        new: true
    }, function (err, lead) {
        if (err) throw err;
        res.json(lead);
    });
})

.delete(Verify.verifyAdmin, function(req, res, next){
        Leaders.findByIdAndRemove(req.params.leaderId, function (err, resp) {        if (err) throw err;
        res.json(resp);
    });
});

leaderRouter.route('/:leaderId/comments')
.all(Verify.verifyOrdinaryUser)
.get( function (req, res, next) {
    Leaders.findById(req.params.leaderId, function (err, lead) {
        if (err) throw err;
        res.json(lead.comments);
    });
})

.post(function (req, res, next) {
    Leaders.findById(req.params.leaderId, function (err, lead) {
        if (err) throw err;
        lead.comments.push(req.body);
        lead.save(function (err, lead) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(lead);
        });
    });
})

.delete(Verify.verifyAdmin, function (req, res, next) {
    Leaders.findById(req.params.leaderId, function (err, lead) {
        if (err) throw err;
        for (var i = (lead.comments.length - 1); i >= 0; i--) {
            lead.comments.id(lead.comments[i]._id).remove();
        }
        lead.save(function (err, result) {
            if (err) throw err;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all comments!');
        });
    });
});

leaderRouter.route('/:leaderId/comments/:commentId')
.all(Verify.verifyOrdinaryUser)
.get(function (req, res, next) {
    Leaders.findById(req.params.leaderId, function (err, lead) {
        if (err) throw err;
        res.json(lead.comments.id(req.params.commentId));
    });
})

.put(function (req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Leaders.findById(req.params.leaderId, function (err, lead) {
        if (err) throw err;
        lead.comments.id(req.params.commentId).remove();
        lead.comments.push(req.body);
        lead.save(function (err, lead) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(lead);
        });
    });
})

.delete(function (req, res, next) {
    Leaders.findById(req.params.leaderId, function (err, lead) {
        lead.comments.id(req.params.commentId).remove();
        lead.save(function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });
});

module.exports = leaderRouter;