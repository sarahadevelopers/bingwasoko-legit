const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, 'blog');

// Pages that should KEEP their FAQ schema (unique, page-specific)
const KEEP_FAQ = [
    'airtime-with-okoa.html',
    'safaricom-okoa-guide.html',
    'business-till-airtime.html',
    'bingwa-gift-bundles.html',
    'safaricom-ussd-codes.html',
    'how-to-buy-minutes-with-okoa.html',
    'how-to-buy-minutes-with-okoa-via-mpesa.html',
    'how-to-buy-bundles-even-with-okoa.html',
    'airtime-to-mpesa-cash.html',
    'get-more-data.html',
    'start-airtime-business.html'
];

// The generic FAQ text that was added by the script
const GENERIC_FAQ_MARKER = '"How do I buy bundles with Okoa?"';

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html'));

let removedCount = 0;
let keptCount = 0;

files.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that should keep their FAQ
    if (KEEP_FAQ.includes(file)) {
        console.log(`✅ KEEP: ${file} (page-specific FAQ)`);
        keptCount++;
        return;
    }
    
    // Check if file has the generic FAQ schema
    if (content.includes(GENERIC_FAQ_MARKER)) {
        // Remove the generic FAQ script block
        const regex = /<script type="application\/ld\+json">\s*\{\s*"@context"[\s\S]*?"How do I buy bundles with Okoa\?"[\s\S]*?<\/script>/;
        
        if (regex.test(content)) {
            content = content.replace(regex, '');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`🗑️  REMOVED generic FAQ: ${file}`);
            removedCount++;
        } else {
            console.log(`⚠️  Could not parse: ${file}`);
        }
    } else {
        console.log(`⏭️  SKIP: ${file} (no generic FAQ)`);
    }
});

console.log(`\n📊 SUMMARY:`);
console.log(`   🗑️  Removed: ${removedCount} files`);
console.log(`   ✅ Kept: ${keptCount} files`);
console.log(`\n🎉 Done! Generic FAQ schemas removed.`);