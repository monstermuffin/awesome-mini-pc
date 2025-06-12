const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

function extractRequirements(content) {
  const lines = content.split('\n');
  const requirements = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# -')) {
      requirements.push(trimmed.substring(3).trim());
    }
  }
  
  return requirements;
}

function generateWIPStatus() {
  const devicesDir = path.join(__dirname, '..', 'data', 'devices');
  const wipDevices = [];
  
  const brandDirs = fs.readdirSync(devicesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const brand of brandDirs) {
    const brandPath = path.join(devicesDir, brand);
    
    const files = fs.readdirSync(brandPath)
      .filter(file => file.endsWith('.WIP.yaml'));
    
    for (const file of files) {
      const filePath = path.join(brandPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      try {
        const data = yaml.load(content);
        const requirements = extractRequirements(content);
        
        wipDevices.push({
          brand: data.brand || 'Unknown',
          model: data.model || 'Unknown',
          cpu: data.cpu?.model || 'Unknown',
          file: `${brand}/${file}`,
          requirements
        });
      } catch (error) {
        console.warn(`Failed to parse WIP file ${filePath}:`, error.message);
      }
    }
  }
  
  if (wipDevices.length === 0) {
    return '## WIP Devices\n\n*No devices currently pending verification.*\n';
  }
  
  let markdown = '## Work In Progress / Need Help\n\n';
  markdown += `*${wipDevices.length} device${wipDevices.length === 1 ? '' : 's'} pending verification. Contributions welcome!*\n\n`;
  
  markdown += '| Device | CPU | File | Missing Information |\n';
  markdown += '|--------|-----|------|--------------------|\n';
  
  for (const device of wipDevices) {
    const deviceName = `${device.brand} ${device.model}`;
    const requirementsList = device.requirements.join('<br>• ');
    const formattedReqs = requirementsList ? `• ${requirementsList}` : 'Unknown requirements';
    
    markdown += `| ${deviceName} | ${device.cpu} | \`${device.file}\` | ${formattedReqs} |\n`;
  }
  
  markdown += '\n**How to contribute:** If you have detailed specs for any of these devices:\n';
  markdown += '1. Find the exact chipset models from official sources\n';
  markdown += '2. Update the device file with confirmed specifications  \n';
  markdown += '3. Rename from `.WIP.yaml` to `.yaml` to include in the database\n\n';
  
  return markdown;
}

if (require.main === module) {
  console.log(generateWIPStatus());
}

module.exports = { generateWIPStatus };