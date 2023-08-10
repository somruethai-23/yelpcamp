const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');}

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20 + 10);
        const camp = new Campground({
            author: '64cf61a7019f35928ec7c1e9',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'lorkapsdkpaskldlpxzlpclz;xc ll;!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dul2c8ude/image/upload/v1691480933/YelpCamp/px49vvqk4ricbuf3cgqk.png',
                    filename: 'YelpCamp/px49vvqk4ricbuf3cgqk'
                },
                {
                    url: 'https://res.cloudinary.com/dul2c8ude/image/upload/v1691480934/YelpCamp/awd4iwnyp56gb5cmigds.jpg',
                    filename: 'YelpCamp/awd4iwnyp56gb5cmigds',
                }
            ]
        })
        await camp.save();
    }
}
seedDB();