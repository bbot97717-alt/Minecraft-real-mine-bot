const mineflayer = require('mineflayer');
const vec3 = require('vec3');
const fs = require('fs');

// প্রিফিক্স সেট করুন
const prefix = '!';

// ==========================================
// ১. প্রথম কর্নারের কোঅর্ডিনেট
const startX = 100;
const startY = 64;
const startZ = 200;

// ২. দ্বিতীয় কর্নারের কোঅর্ডিনেট
const endX = 110;
const endY = 60;
const endZ = 210;
// ==========================================

// JSON ফাইল থেকে চেস্টের কোঅর্ডিনেট লোড করা
function getChestLocations() {
  try {
    const rawData = fs.readFileSync('chests.json');
    return JSON.parse(rawData);
  } catch (err) {
    console.log('chests.json ফাইল পড়তে সমস্যা হয়েছে, ফাকা তালিকা ব্যবহার করা হচ্ছে।');
    return [];
  }
}

// চেস্ট খুলতে সাহায্যকারী ফাংশন (ক্রমানুসারে খুঁজবে)
async function getToolsFromChests(bot) {
  const chests = getChestLocations();
  for (const pos of chests) {
    const chestBlock = bot.blockAt(vec3(pos.x, pos.y, pos.z));
    if (chestBlock && (chestBlock.name.includes('chest'))) {
      try {
        const chest = await bot.openChest(chestBlock);
        // এখান থেকে প্রয়োজন অনুযায়ী টুলস তুলে নেওয়ার লজিক রাখতে পারেন
        console.log(`Location (${pos.x}, ${pos.y}, ${pos.z}) এর চেস্ট খোলা হয়েছে।`);
        chest.close();
        return true; // টুল পেয়ে গেলে সফল
      } catch (err) {
        console.log(`Chest at (${pos.x}, ${pos.y}, ${pos.z}) খুলতে ব্যর্থ। পরেরটা দেখা হচ্ছে...`);
      }
    }
  }
  return false;
}

// ইনভেন্টরির আইটেম চেস্টে খালি করার ফাংশন
async function depositItemsToChest(bot) {
  const chests = getChestLocations();
  for (const pos of chests) {
    const chestBlock = bot.blockAt(vec3(pos.x, pos.y, pos.z));
    if (chestBlock && chestBlock.name.includes('chest')) {
      try {
        const chest = await bot.openChest(chestBlock);
        for (const item of bot.inventory.items()) {
          // পিক্যাক্স বা প্রধান টুল না রেখে বাকি জিনিস ডিপোজিট করবে
          if (!item.name.includes('pickaxe')) {
            await chest.deposit(item.type, null, item.count);
          }
        }
        chest.close();
        console.log('ইনভেন্টরি খালি করা হয়েছে।');
        return true;
      } catch (err) {
        console.log(`Chest at (${pos.x}, ${pos.y}, ${pos.z}) ফুল বা খোলা যাচ্ছে না।`);
      }
    }
  }
  console.log('কোনো খালি চেস্ট পাওয়া যায়নি! মাইনিং থামানো হচ্ছে।');
  return false;
}

function startMining(bot) {
  bot.on('chat', async (username, message) => {
    if (message.startsWith(prefix)) {
      const cmd = message.slice(prefix.length).trim().toLowerCase();
      
      if (cmd === 'mine' || cmd === 'mining') {
        console.log(`${username} এর কমান্ড পেয়ে টুলস খোঁজা হচ্ছে...`);
        
        // প্রথমে চেস্ট থেকে টুল নেওয়ার চেষ্টা করবে
        await getToolsFromChests(bot);
        
        console.log('মাইনিং শুরু করা হচ্ছে...');
        await executeMining(bot);
      }
    }
  });
}

async function executeMining(bot) {
  for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
    for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
      for (let z = Math.min(startZ, endZ); z <= Math.max(startZ, endZ); z++) {
        
        // ইনভেন্টরি ফুল আছে কিনা চেক (সাধারণত ৩৬টি সট থাকে)
        if (bot.inventory.items().length >= 36) {
          console.log('ইনভেন্টরি ফুল! চেস্টে খালি করতে যাচ্ছে...');
          const success = await depositItemsToChest(bot);
          if (!success) {
            console.log('চেস্ট ফুল থাকায় মাইনিং থামানো হলো।');
            return; // চেস্টও ফুল হলে মাইনিং থেমে যাবে
          }
        }

        const block = bot.blockAt(vec3(x, y, z));
        
        // বেডরক বা হাওয়ার মতো ব্লক বাদ দিয়ে শুধু ভাঙার যোগ্য ব্লক মাইন করবে
        if (block && block.name !== 'air' && block.name !== 'bedrock' && block.diggable) {
          try {
            await bot.dig(block);
            console.log(`Mined block at: ${x}, ${y}, ${z}`);
          } catch (err) {
            console.log(`Failed to mine block at: ${x}, ${y}, ${z}`);
          }
        }
      }
    }
  }
  console.log('মাইনিং শেষ হয়েছে!');
}

module.exports = { startMining };
