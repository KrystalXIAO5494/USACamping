const express =require('express');
const app =express();
const path = require('path');
const mongoose = require('mongoose');
const Campground= require('./model/campground');
const methodOverride=require('method-override');
const ejsMate = require ('ejs-mate');
const catchAysnc=require('./utils/catchAsync');
const ExpressError=require("./utils/ExpressError");
const joi=require('joi');
const Review=require('./model/review')
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const campground = require('./model/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
})


app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


app.get('/',(req,res)=>{
    res.render('home')
})
app.get('/campgrounds',async(req,res)=>{
    const campgrounds =await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
})
app.get('/campgrounds/new',async(req,res)=>{
    
    res.render('campgrounds/new');
}
)
app.get('/campgrounds/:id',async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show',{campground});
}
)

app.get('/campgrounds/:id/edit',catchAysnc (async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit',{campground});
})
)
app.put('/campgrounds/:id',catchAysnc( async(req,res)=>{
    const{id}=req.params;
    const campground= await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
})
)

app.post('/campgrounds',validateCampground,catchAysnc(async(req,res)=>{
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})
)

app.delete('/campgrounds/:id',async(req,res)=>{
    const{id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.post('/campgrounds/:id/reviews',validateReview,catchAysnc(async(req,res)=>{
    const campground= await Campground.findById(req.params.id);

    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)

}))

app.delete('/campgrounds/:id/reviews/:reviewId',catchAysnc(async(req,res)=>{
    const{id,reviewId}= req.params;
    await campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)

}))


app.all("*",(req,res,next)=>{
    next(new ExpressError('page not found',404))
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})
app.listen(3000,()=>{
    console.log('Serving on port 3000');
})