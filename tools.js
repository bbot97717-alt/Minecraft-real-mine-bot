const mineflayer = require('mineflayer');
const path = require('path');
const fs = require('fs');

// tools_chest_coordinates.json ফাইল থেকে চেস্টের লোকেশন লোড করা
const chestCoordsPath = path.join(__dirname, 'tools_chest_coordinates.json');
let chestLocations = [];

try {
  const data = fs.readFileSync(chestCoordsPath, 'utf8');
  chestLocations = JSON.parse(data);
} catch (err) {
  console.error('Error loading tools_chest_coordinates.json:', err);
}

async function equipBestTool(bot) {
  // ১০টি চেস্ট পর পর চেক করা
  for (const location of chestLocations) {
    try {
      const chestBlock = bot.blockAt(new mineflayer.vec3(location.x, location.y, location.z));
      if (!chestBlock) continue;

      const chest = await bot.openChest(chestBlock);

      // চেস্টে পিক্যাক্স (Pickaxe) আছে কিনা দেখা
      const tool = chest.containerItems().find(item => item.name.includes('pickaxe'));

      if (tool) {
        await bot.equip(tool, 'hand');
        console.log(`Equipped ${tool.name} from chest at (${location.x}, ${location.y}, ${location.z})`);
        await chest.close();
        return true;
      }

      await chest.close();
    } catch (err) {
      console.log(`Could not access chest at (${location.x}, ${location.y}, ${location.z})`);
    }
  }

  console.log('No pickaxe found in any of the configured chests.');
  return false;
}

module.exports = { equipBestTool };
