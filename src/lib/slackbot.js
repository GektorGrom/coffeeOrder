import SlackBot from 'slackbots';
import low from 'lowdb';
import { updateSocket } from './express';


export default () => {
  const bot = new SlackBot({
    token: process.env.SLACK_TOKEN,
    name: 'Marina Mednikova'
  });

  bot.on('start', () => {
    // bot.postMessageToChannel('general', 'meow!');
    // bot.postMessageToUser('lion58', 'meow!', { 'slackbot': true, icon_emoji: ':coffee:' });
    console.log('listening');
  });
  bot.on('message', (data) => {
    // all ingoing events https://api.slack.com/rtm

    if (data.type === 'desktop_notification') {
      const db = low('db.json');
      console.log('recieve message');
      const object = { text: data.content, name: data.subtitle, image: data.avatarImage, type: 'Slack' };
      db.get('tweets')
        .push(object)
        .value();
      const tweetsForSocket = db.get('tweets')
        .takeRight(1)
        .value();
      updateSocket(tweetsForSocket);
    }
  });
  bot.on('error', () => {
    console.log('error');
    bot.login();
  });
};

