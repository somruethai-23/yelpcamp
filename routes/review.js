const express = require('express');
const router = express.Router({mergeParams: true});
const { ValidateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');


//Review
router.post('/', isLoggedIn,ValidateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(reviews.deleteReview));


module.exports = router;