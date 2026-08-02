const mineflayer = require('mineflayer');
const config = require('./config.json');
const mining = require('./mining.js');
const storage = require('./storage.js');
const tools = require('./tools.js');

function createBot() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
  });

  bot.on('login', () => {
    console.log('Bot logged in!');
  });

  bot.on('spawn', () => {
    console.log('Bot has spawned in the world!');
    tools.equipBestTool(bot);
    mining.startMining(bot);
  });

  // বট ডিসকানেক্ট হলে পুনরায় যুক্ত হওয়ার লজিক
  bot.on('end', () => {
    console.log('Bot disconnected. Reconnecting in 5 seconds...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', (err) => {
    console.log('Bot error:', err);
  });
}

console.log('Bot starting up successfully!');
createBot();
