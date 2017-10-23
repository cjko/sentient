const port = 8000;
const express = require('express');
const bodyparser = require('body-parser');
const sentiment = require('sentiment');
const tweeter = require('./config');

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Routes
app.get('/tweets', (req,res)=>{
	tweeter.verifyCredentials((err, data)=>{
		let totalSentiment = 0;
		let testTweetCount = 0;
		const phrase = 'weinstein';
		stream = tweeter.stream('statuses/filter', {
			'track': phrase
		}, (stream)=>{
			res.send(`Monitoring Twitter for ${phrase}...`);
			stream.on('data', (data)=>{
				testTweetCount++;
				console.log(`Tweet #${testTweetCount}: ${data.text}`);
				sentiment(data.text, (err, result)=>{
					totalSentiment += result.score;
					console.log(`Sentiment score so far: ${totalSentiment}`);
				});
			});
		}
		);
		// res.send(`Hello ${data.name}. I am analyzing your twitter.`);
	});
});

app.get('/', (req,res)=>{
	sentiment('westbrook',(err, result)=>{
		const response = `Sentiment score for WESTBROOK is ${result.score}.`;
		res.send(response);
	});
});


app.listen(8000, ()=>{
	console.log(`Listening on port ${port}`);
});
