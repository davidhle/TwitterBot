/*
David Le
LMC 2700

Rating Intervals
Raw:0-99
Soft Boiled: 100-199
Over Easy: 200-299
Hard Boiled: 300-399
Fried: 400-499
Scrambled: 500+
*/
// Twitter Library and File System
var Twit = require('twit'),
    fs = require('fs');
// Include config file
var T = new Twit(require('./config.js'));
// Set up a user stream
var stream = T.stream('user');

// Define the ID of the user we are interested in
//460554621 my personal user id for testing/debugging
//25073877 Trump's user id
var userID = 25073877;


// Open a stream following events from that user ID
var stream = T.stream('statuses/filter', { follow: ( userID ) });
console.log("Stream for checking tweets from @realDonaldTrump is on!");

	stream.on('tweet', function (tweet) {
        var tweetStr = tweet.text;
		// Make sure that the tweet's from the right user
		if (tweet.user.id == userID) {
			console.log("This tweet was posted by @realDonaldTrump: ");
            console.log(tweetStr);
            var rating = eggRating(tweet);
            var url = eggURL(rating);
            console.log(rating + " " + url);
            uploadEggImage(url, tweet.created_at, rating);
		}
	});

function tweeted(err, data, response) {
    if (err){
        console.log("Error! Something went wrong!");
    } else{
        console.log("Tweet successfully posted");
    }
}

function uploadEggImage(url, time, rating) {
    console.log('Uploading an image...');
    b64content = fs.readFileSync(url, {encoding: 'base64'});
    T.post('media/upload', { media_data: b64content }, function (err, data, response) {
      if (err){
        console.log('ERROR:');
        console.log(err);
      }
      else{
        console.log('Image uploaded!');
        console.log('Now tweeting it...');

        T.post('statuses/update', {
          status: 'Trump\'s tweet on ' + time + " has an egg rating of: " + rating,
          media_ids: new Array(data.media_id_string)
        },
          function(err, data, response) {
            if (err){
              console.log('ERROR:');
              console.log(err);
            }
            else{
              console.log('Posted an image!');
            }
          }
        );
      }
    });
}

function eggURL(rating) {
    var url = "./images/"
    if(rating >= 0 && rating < 100) { // Raw
        url += "Raw.jpg";
    } else if (rating >= 100 && rating < 200) { // Soft Boiled
        url += "SoftBoiled.jpg";
    } else if (rating >= 200 && rating < 300) { // Over Easy
        url += "OverEasy.jpg";
    } else if (rating >= 300 && rating < 400) { // Hard Boiled
        url += "HardBoiled.jpg";
    } else if (rating >= 400 && rating < 500) { // Fried
        url += "Fried.jpg";
    } else if (rating >= 500) { // Scrambled
        url += "Scrambled.jpg";
    }
    return url;
}

function eggRating(tweet) {
    var tweetStr = tweet.text;
    var words = tweetStr.split(/\s*\b\s*/);
    console.log(words);
    var rating = 0;
    rating += words.length * 5; // More words = more cooked up!
    for (var i = 0; i < words.length; i++) {
        if (words[i] == "!" || words[i] == "?") {
            rating += 50;
        } else if (words[i].toUpperCase() === "FAKE") {
            rating += 100;
        } else if (words[i] === words[i].toUpperCase()) { // uses all caps word
            rating += 150;
        } else if (words[i].toUpperCase() === "LIE" || words[i].toUpperCase() === "LIES") {
            rating += 50;
        } else if (words[i].toUpperCase() === "CLINTON" || words[i].toUpperCase() === "OBAMACARE") {
            rating += 125;
        }
    }
    return rating;
}
