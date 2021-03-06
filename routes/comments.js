var express = require("express");
var router = express.Router({mergeParams: true});
var Thing = require("../models/thing");
var Comment = require("../models/comments");
var middleware = require("../middleware");

router.get("/new",middleware.isLoggedIn, function(req, res) {
    Thing.findById(req.params.id, function(err, thing){
        if(err || !thing){
            req.flash("error", "Please login first!");
            req.redirect("/login");
        }else{
            res.render("comments/new", {thing: thing});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
    Thing.findById(req.params.id, function(err, thing){
        if(err || !thing){
            req.flash("error", "Please login first!");
            res.redirect("/login");
        }else{
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                   console.log("err");
               }else{
                   comment.authour.username = req.user.username;
                   comment.authour.id = req.user._id;
                   comment.save(err => {
                        if(err){
                            req.flash("error", "Error saving comment. Please try again.");
                            res.redirect("/things/" + thing._id);
                        }
                        var updatedComments = thing.comments;
                        updatedComments.push(comment);
                        thing.comments = updatedComments;
                        thing.rating = Math.round((thing.rating + parseInt(req.body.rating))/2);
                        thing.save(err => {
                            if(err){
                                req.flash("error", "Error saving comment. Please try again.");
                                res.redirect("/things/" + thing._id);
                            }
                            res.redirect("/things/" + thing._id);
                        });
                   });
               }
           });
        }
    });
});

router.get("/:comment_id/edit", middleware.checkCommentOwner, function(req, res){
    Comment.findById(req.params.comment_id, function(err, comment) {
        if(err || !comment){
            req.flash("error", "Couldn't find this comment!");
            res.redirect("back");
        }else{
            res.render("comments/edit", {thing_id: req.params.id, comment: comment});
        }
    })
});

router.put("/:comment_id", middleware.checkCommentOwner, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment) {
        if(err || !comment){
            req.flash("error", "Couldn't find this comment!");
            res.redirect("back");
        }else{
            req.flash("success", "Comment updated!");
            res.redirect("/things/" + req.params.id);
        }
    })
});

router.delete("/:comment_id", middleware.checkCommentOwner, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err, comment){
       if(err || !comment){
           req.flash("error", "Couldn't find this comment!");
           res.redirect("back");
       }else{
           req.flash("success", "Comment deleted!");
           res.redirect("/things/" + req.params.id);
       }
   }); 
});

module.exports = router;