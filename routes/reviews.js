const express = require('express');
const router = express.Router({mergeParams:true});

const catchAysnc=require('../utils/catchAsync');
const ExpressError=require("../utils/ExpressError");
const Campground= require('../model/campground');
const Review=require('../model/review')
const {reviewSchema } = require('../schemas.js');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.post('/',validateReview,catchAysnc(async(req,res)=>{
    const campground= await Campground.findById(req.params.id);

    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)

}))

router.delete('/:reviewId',catchAysnc(async(req,res)=>{
    const{id,reviewId}= req.params;
    await campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)

}))

module.exports=router;
