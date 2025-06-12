const fs = require('fs');
const path = require('path');
const { generateWIPStatus } = require('./generate-wip-status.cjs');

function updateReadmeWIP() {
  const readmePath = path.join(__dirname, '..', 'README.md');
  
  if (!fs.existsSync(readmePath)) {
    console.error('README.md not found');
    return;
  }
  
  const content = fs.readFileSync(readmePath, 'utf8');
  const wipSection = generateWIPStatus();
  
  const startMarker = '<!-- WIP_DEVICES_START -->';
  const endMarker = '<!-- WIP_DEVICES_END -->';
  
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);
  
  let updatedContent;
  
  if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex + startMarker.length);
    const after = content.substring(endIndex);
    updatedContent = before + '\n' + wipSection + after;
  } else {
    const contributingIndex = content.indexOf('## Contributing');
    
    if (contributingIndex === -1) {
      console.error('Could not find "## Contributing" section in README');
      return;
    }
    
    const before = content.substring(0, contributingIndex);
    const after = content.substring(contributingIndex);
    
    updatedContent = before + 
      startMarker + '\n' + 
      wipSection + 
      endMarker + '\n\n' + 
      after;
  }
  
  fs.writeFileSync(readmePath, updatedContent);
  console.log('README.md updated with WIP devices status');
}

if (require.main === module) {
  updateReadmeWIP();
}

module.exports = { updateReadmeWIP };