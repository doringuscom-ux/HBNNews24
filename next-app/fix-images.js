const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

const filesToFix = [
    'TechnologySection.jsx',
    'SportsSection.jsx',
    'BusinessSection.jsx',
    'EntertainmentSection.jsx',
    'ReligionSection.jsx',
    'LifestyleSection.jsx',
    'NewsGrid.jsx',
    'SidebarNews.jsx',
    'ShortVideos.jsx'
];

filesToFix.forEach(file => {
    const filePath = path.join(componentsDir, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if optimizeImage is imported
    if (!content.includes('import { optimizeImage }')) {
        content = content.replace(/(import React.*)/, "$1\nimport { optimizeImage } from '../utils/imageOptimizer';");
    }

    // Wrap raw src={...} with optimizeImage
    content = content.replace(/src=\{mainNews\.image\}/g, "src={optimizeImage(mainNews.image, 400)}");
    content = content.replace(/src=\{news\.image\}/g, "src={optimizeImage(news.image, 300)}");
    content = content.replace(/src=\{bottomNewsLeft\.image\}/g, "src={optimizeImage(bottomNewsLeft.image, 300)}");
    content = content.replace(/src=\{imageNews\[0\]\.image\}/g, "src={optimizeImage(imageNews[0].image, 400)}");
    content = content.replace(/src=\{imageNews\[1\]\.image\}/g, "src={optimizeImage(imageNews[1].image, 300)}");
    content = content.replace(/src=\{imageNews\[2\]\.image\}/g, "src={optimizeImage(imageNews[2].image, 300)}");
    
    content = content.replace(/src=\{item\.image \|\| ([^\}]+)\}/g, "src={optimizeImage(item.image, 300) || $1}");
    content = content.replace(/src=\{news\.image \|\| ([^\}]+)\}/g, "src={optimizeImage(news.image, 300) || $1}");
    content = content.replace(/src=\{video\.image \|\| ([^\}]+)\}/g, "src={optimizeImage(video.image, 300) || $1}");

    content = content.replace(/src=\{video\.image\}/g, "src={optimizeImage(video.image, 300)}");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
