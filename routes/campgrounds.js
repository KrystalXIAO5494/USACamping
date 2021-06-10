const express = require('express');
const router = express.Router();
const catchAysnc=require('../utils/catchAsync');
const ExpressError=require("../utils/ExpressError");
const Campground= require('../model/campground');
const { campgroundSchema, reviewSchema } = require('../schemas.js');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/',async(req,res)=>{
    const campgrounds =await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
})
router.get('/new',async(req,res)=>{
    
    res.render('campgrounds/new');
}
)
router.get('/:id',async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show',{campground});
}
)

router.get('/:id/edit',catchAysnc (async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit',{campground});
})
)
router.put('/:id',catchAysnc( async(req,res)=>{
    const{id}=req.params;
    const campground= await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
})
)

router.post('/',validateCampground,catchAysnc(async(req,res)=>{
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})
)

router.delete('/:id',async(req,res)=>{
    const{id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

module.exports=router;
