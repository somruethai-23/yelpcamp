if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
// Sanitize your express payload to prevent MongoDB operator injection.
const mongoSanitize = require('express-mongo-sanitize');
const usersRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');
const dbUrl = process.env.DB_URL;
const MongoStore = require('connect-mongo');
// 'mongodb://127.0.0.1:27017/yelp-camp'

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl)};

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public' )));
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'somruethai'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function(e){
    console.log("SESSTION STORE ERROR", e);
})

const sessionConfig ={
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 90 * 24 * 7,
        maxAge: 1000 * 60 * 90 * 24 * 7 
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());



const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls,  "https://cdn.jsdelivr.net"],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//LOGIN LOGOUT USER
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//can access in any template
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', usersRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


//Campgrounds
app.get('/', (req, res) => {
    res.render('home')
});


//Handle Error
app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next)=>{
    const {statusCode = 500 } = err;
    if(!err.message) err.message = 'Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

//check server
app.listen(3000, () => {
    console.log('Serving on port 3000')
})
