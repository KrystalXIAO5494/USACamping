const express =require('express');
const app =express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride=require('method-override');
const ejsMate = require ('ejs-mate');
const ExpressError=require("./utils/ExpressError");
const joi=require('joi');
const campgrounds= require('./routes/campgrounds');
const reviews= require('./routes/reviews');


mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify: false
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
app.use(express.static(path.join(__dirname, 'public')))



app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews/',reviews);

app.get('/',(req,res)=>{
    res.render('home')
})

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