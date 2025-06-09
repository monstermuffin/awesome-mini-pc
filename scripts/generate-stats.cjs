const fs = require('fs');
const path = require('path');
const glob = require('glob');

function generateStats() {
  const deviceFiles = glob.sync('data/devices/**/*.yaml');
  
  const manufacturers = new Set();
  deviceFiles.forEach(file => {
    const manufacturer = path.dirname(file).split('/').pop();
    manufacturers.add(manufacturer);
  });

  const stats = {
    deviceCount: deviceFiles.length,
    manufacturerCount: manufacturers.size,
    lastUpdated: new Date().toISOString(),
    manufacturers: Array.from(manufacturers).sort(),
    categories: [
      'Mini PC',
      'Single Board Computer',
      'Server',
      'NAS',
      'Embedded System',
      'Development Board'
    ]
  };

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(publicDir, 'stats.json'), 
    JSON.stringify(stats, null, 2)
  );
  
  console.log(`✅ Stats generated: ${stats.deviceCount} devices from ${stats.manufacturerCount} manufacturers`);
}

if (require.main === module) {
  generateStats();
}

module.exports = { generateStats }; 