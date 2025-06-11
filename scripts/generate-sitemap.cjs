const fs = require('fs');
const path = require('path');
const glob = require('glob');

function generateSitemap() {
  const baseUrl = 'https://awesomeminipc.com';
  const currentDate = new Date().toISOString();
  
  const deviceFiles = glob.sync('data/devices/**/*.yaml');
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

  const manufacturers = new Set();
  deviceFiles.forEach(file => {
    const manufacturer = path.dirname(file).split('/').pop();
    manufacturers.add(manufacturer);
  });

  manufacturers.forEach(manufacturer => {
    sitemap += `  <url>
    <loc>${baseUrl}/?manufacturer=${encodeURIComponent(manufacturer)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  const categories = [
    'mini-pc', 'sbc', 'server', 'nas', 'embedded', 'development-board'
  ];

  categories.forEach(category => {
    sitemap += `  <url>
    <loc>${baseUrl}/?category=${encodeURIComponent(category)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  const dataDir = path.join(__dirname, '..', 'data');
  fs.writeFileSync(path.join(dataDir, 'sitemap.xml'), sitemap);
  console.log('Sitemap generated successfully');
}

if (require.main === module) {
  generateSitemap();
}

module.exports = { generateSitemap }; 