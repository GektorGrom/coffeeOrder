// call the packages we need
import low from 'lowdb';
import Twitter from 'twit';
import env from 'dotenv';
import Express from './lib/express'
// local dep
import parseTwit from './lib/parseTwit';
import respondForOrder from './lib/respondForOrder';
import slackBot from './lib/slackbot';

env.config();
slackBot();
let db = low('db.json');
db.defaults({ tweets: [] })
  .value();
const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const stream = client.stream('user', { stringify_friend_ids: true });

stream.on('connected', () => {
  console.log('Twit API connected');
});

stream.on('tweet', (event) => {
  db = low('db.json');
  if (parseTwit(event.text)) {
    event.text = parseTwit(event.text);
    client.post('statuses/update', { status: respondForOrder(event.user.screen_name), in_reply_to_status_id: event.id_str });
  }
  console.log('-------------');
  db.get('tweets')
    .push({ text: event.text, name: event.user.screen_name, image: event.user.profile_image_url_https })
    .value();
  const tweetsForSocket = db.get('tweets')
    .takeRight(1)
    .value();
  Express.updateWeb(tweetsForSocket);
  console.log(event.text);
});


stream.on('friends', (friendsMsg) => {
  console.log(friendsMsg);
});

stream.on('delete', (deleteMessage) => {
  console.log(deleteMessage);
});

stream.on('error', (error) => {
  throw error;
});

Express.app.get('/coffeeorder', (req, res) => {
  const re = low('db.json').get('tweets')
              .takeRight(3)
              .reverse()
              .value();
  // console.log(re)
  res.json(re);
})
