const port = 8000;
const express = require('express');
const bodyparser = require('body-parser');
const sentiment = require('sentiment');
const ml = require('ml-sentiment')();
const config = require('./config');
const twitter = require('twitter');
const tweetClient = new twitter({
	'consumer_key': config.consumer_key,
	'consumer_secret': config.consumer_secret,
	'access_token_key': config.access_token_key,
	'access_token_secret': config.access_token_secret
});

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Routes
app.get('/tweets', (req,res)=>{
	tweetClient.verifyCredentials((err, data)=>{
		let totalSentiment = 0;
		let testTweetCount = 0;
		let log = ''
		const phrase = 'blade runner 2049';
		stream = tweetClient.stream('statuses/filter', {
			'track': phrase
		}, (stream)=>{
			res.send(`Monitoring Twitter for ${phrase}...\n${log}`);
			stream.on('data', (data)=>{
				// Only evaluate the sentiment of English-language tweets
				if (data.lang === 'en') {
					testTweetCount++;
					totalSentiment += ml.classify(data.text);
					console.log(`Tweet #${testTweetCount}: ${data.text}`);
					console.log(`Sentiment score so far: ${totalSentiment/testTweetCount}`);

					/*	
					sentiment(data.text, (err, result)=>{
						testTweetCount++;
						console.log(`Tweet #${testTweetCount}: ${data.text}`);
						totalSentiment += result.score;
						console.log(`Sentiment score so far: ${totalSentiment/testTweetCount}`);
					});*/
				}
			});

		}
		);
		// res.send(`Hello ${data.name}. I am analyzing your twitter.`);
	});
});

app.get('/', (req,res)=>{
	const phrase = 'Westbrook is a god.'
	/*
	sentiment(phrase,(err, result)=>{
		const response = `Sentiment score for "${phrase}" is ${result.score}.`;
		res.send(response);
	});*/
	console.log(ml.classify(phrase));
	res.send(`${phrase} got a score of ${ml.classify(phrase)}`);
});

app.get('/search', (req,res)=>{
	const phrase = 'bitcoin';
	let totalSentiment = 0;
	let testTweetCount = 0;
	tweetClient.get('search/tweets', {q: phrase, vertical:'news',src:'typd',count:100}, (err,tweets,response)=>{
		// console.log(tweets)
		let parsedTweets = tweets['statuses'].map((json)=>{
			return ml.classify(json['text']);
		})
		res.send(parsedTweets)
	})
	// res.send(`Monitoring Twitter statuses for: ${phrase}...`)
	// tweetClient.stream('statuses/filter',{track: phrase}, (stream)=>{
	// 	stream.on('data',(tweet)=>{
	// 		if(tweet.lang === 'en'){
	// 			testTweetCount++;
	// 			totalSentiment += ml.classify(tweet.text);
	// 			console.log(totalSentiment/testTweetCount);
	// 		}
	// 	})

	// })

	
});


app.listen(8000, ()=>{
	console.log(`Listening on port ${port}`);
});
