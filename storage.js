const mineflayer = require('mineflayer');

const chestLocations = [
  { x: 10, y: 64, z: 10 },
  { x: 15, y: 64, z: 15 }
];

async function depositItems(bot) {
  const inventory = bot.inventory.items();
  const isFull = inventory.length >= 36; // ইনভেন্টরিতে ৩৬টি স্লট পূর্ণ হলে

  if (isFull) {
    console.log('Inventory is full! Searching for a chest to deposit items.');
    for (const location of chestLocations) {
      try {
        const chestBlock = bot.blockAt(new mineflayer.vec3(location.x, location.y, location.z));
        const chest = await bot.openChest(chestBlock);
        
        for (const item of inventory) {
          await chest.deposit(item.type, null, item.count);
        }
        await chest.close();
        console.log('Items deposited successfully.');
        break; // সফলভাবে ডিপোজিট করার পর লুপ থেকে বের হয়ে আসা
      } catch (err) {
        console.log('Could not open chest at this location.');
      }
    }
  }
}

module.exports = { depositItems, chestLocations };
