// REQUIRE
require('dotenv').config();
const express = require('express');
const twit = require('twitter-lite');
const colors = require('colors');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
// SOCKET IO
const io = require('socket.io')(httpServer);

// VIEWS ENGINE STATIC ROUTE
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
// BODY PARSER MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// TWT CONF
let tw = new twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000 // optional HTTP request timeout to apply to all requests.
});

// ─── SOCKET IO EVENTS ──────────────────────────────────
let socketIo;
io.on('connection', socket => {
    // Define user id
    let ID = socket.id;
    console.log(`User ${ID} connected.`);
    socketIo = socket;
});
// ─── STREAN TWITTS BY GEO LOCATION ──────────────────────
// Use this site to find the correct coordinates use TSV format!!!
// https://boundingbox.klokantech.com
// STREAM FUNCTION
let streamOne;
const geoStream = async(geoLocation) => {
    // AWAIT STREAM PROMISE RESPONSE    
    streamOne = await tw.stream("statuses/filter", {
        locations: geoLocation
    });
    // ON EVENTs
    streamOne
        .on("start", response => console.log("start"))
        .on("data", tweet => {
            console.log('Stream One')
                // ─── SOCKET EMIT ────────────────────────
            socketIo.emit('tweet', tweet);
        })
        .on("ping", () => console.log("ping"))
        .on("error", error =>  {
            console.log("error", error.source);
            // Emit error Message
            socketIo.emit("error", error.source);
            stopStream()
        })
        .on("end", response => console.log("end"));
};
//
// ─── STOP STREAM ────────────────────────────────────────     
const stopStream = () => {
    if (streamOne !== undefined) {
        // To stop the stream:
        process.nextTick(() => streamOne.destroy()); // emits "end" and "error" events
        console.log(`Stream Killed.`);
        return
    }
    console.log('Stream already stopped.')
}

// ─── GOOGLE GEOCODING ───────────────────────────────────────────

// Empty Bounds Box array
let newRegionBoundsBox = [];
// Empty lat lng  array
let latLngArr = [];
// Country
let country = 'IT';

const fetchGeocode = async(region, country) => {
    try {
        let URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${region}&components=country:${country}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        let fetchGeo = await axios(URL);
        let res = await fetchGeo;
        res.data.results.forEach(m => {
            console.log(m.formatted_address);
            // RESET arrays
            latLngArr.length = 0;
            newRegionBoundsBox.length = 0;
            // PUSH lat and lng coordinates
            latLngArr.push(`${m.geometry.location.lat}`);
            latLngArr.push(`${m.geometry.location.lng}`);
            socketIo.emit('latlng', latLngArr)
                // PUSH BOUNDS BOX COORDINATES
            newRegionBoundsBox.push(`${m.geometry.bounds.southwest.lng}`)
            newRegionBoundsBox.push(`${m.geometry.bounds.southwest.lat}`)
            newRegionBoundsBox.push(`${m.geometry.bounds.northeast.lng}`)
            newRegionBoundsBox.push(`${m.geometry.bounds.northeast.lat}`)
            console.log(newRegionBoundsBox)
            console.log(latLngArr)
                // Geo Stream
            geoStream(newRegionBoundsBox);
        });
        console.log(region);
    } catch (err) {
        if (err) console.log(err);
    }
};

// ─── ROOT ROUTE ─────────────────────────────────────────────────

// GET
app.get('/', (req, res) => {
    res.render('index.ejs', {
        key: process.env.MAPQUEST_KEY
    });
});
// POST ROUTE
app.post('/', (req, res) => {
    // Set country and region from the form
    let country = req.body.country;
    let region = req.body.region;
    // Fetch Geo code coordinates
    fetchGeocode(region, country)
        //  REDIRECT
    res.render('index.ejs', {
        key: process.env.MAPQUEST_KEY
    });
});
// GET STOP STREAM ROUTE
app.get('/stopstream', (req, res) => {
        // Stop stream
        stopStream();
        // Redirect to home
        res.redirect('/');
    })
    //
    // ─── GET SEARCH TWEETS USING KEYWORDS ────────────────────

// SEARCH PARAMETER OBJECT
let params = {
        q: 'Creazione Siti Web',
        result_type: 'recent',
        count: 10 // 5 tweets
    }
    // Empty array
let tweetIdArray = [];
// FUNCTION SEARCH TWEETS
function seachTweets(params) {
    tw.get("search/tweets", params, (err, data, response) => {
        if (err) {
            console.log(err);
        }
        // Tweet id
        let tweets = data.statuses;
        // Loop through all tweets
        for (let val of tweets) {
            let reTweetId = val.id_str;
            // Push inside the array
            tweetIdArray.push({ reTweetId });
        }
        // If id is not present inside the array retweet
        tweetIdArray.forEach(t => {
            // Run reTweet function
            postReTweet(t);
        });
    });
}

// ─── RETWEET FUNCTION ───────────────────────────────────────────────────────────

const postReTweet = (id) => {
    tw.post('statuses/retweet/:id', { id: id }, (err, response) => {
        if (err) {
            return console.log(err.message);
        }

        if (response) {
            console.log('Retweeted. ' + reTweetId);
        }
    });
}

// ─── RUN SEARCH AND RETWEET EVERY 15 minutes in millisec ────────────────────────────────────────────────────

setInterval(() => {
    console.log('Restart.');
    seachTweets(params);
}, 900000); // 15 minutes

// ─── SERVER LISTENER ────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server beating 💙 on port: ${ PORT } `);
});