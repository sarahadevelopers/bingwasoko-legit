const fs = require('fs');
const path = require('path');

const BLOG_DIR = './blog';
const BACKUP_DIR = './blog-brand-backup';

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
    console.log('📁 Created backup directory');
}

// Get all HTML files in blog directory
const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html') && f !== 'blog.html');

let updatedCount = 0;

files.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);
    
    // Backup original
    fs.copyFileSync(filePath, backupPath);
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // ===== BRAND NAME CORRECTIONS =====
    // Brand name in titles, headers, and body text
    content = content.replace(/BingwaSoko/g, 'Bingwa Sokoni');
    content = content.replace(/BingwaSoko's/g, "Bingwa Sokoni's");
    content = content.replace(/BingwaSokoni/g, 'Bingwa Sokoni');
    content = content.replace(/BingwaSokoni's/g, "Bingwa Sokoni's");
    
    // Domain name (should stay as is)
    // bingwasoko.co.ke should remain unchanged
    
    // Specifically fix the logo in header
    content = content.replace(
        /<span class="bingwa">Bingwa<\/span><span class="soko">Soko<\/span>/g,
        '<span class="bingwa">Bingwa</span><span class="soko"> Sokoni</span>'
    );
    
    // Fix footer logo
    content = content.replace(
        /<h3 class="footer-logo">Bingwa<span>Soko<\/span><\/h3>/g,
        '<h3 class="footer-logo">Bingwa<span> Sokoni</span></h3>'
    );
    
    // Only write if changes were made
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        updatedCount++;
        console.log(`✅ Updated: ${file}`);
    } else {
        console.log(`⏭️ No changes needed: ${file}`);
    }
});

console.log(`\n✅ Done! Updated ${updatedCount} files.`);
console.log(`📁 Backups saved in: ${BACKUP_DIR}`);