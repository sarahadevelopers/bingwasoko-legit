const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// ===== CONFIGURATION =====
const BLOG_DIR = './blog';
const PRODUCT_DIR = './product';
const BACKUP_DIR = './blog-backup';

// ===== LOAD PRODUCTS =====
const products = require('./products.json');

// ===== HELPER: Generate slug matching products.html =====
function getSlug(title, id) {
    const slug = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/\//g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return `${slug}-${id}.html`;
}

// ===== FEATURED PRODUCT IDs (Customize these!) =====
const featuredIds = [1, 17, 30, 27]; // 1.25GB, 45 Mins, 2GB Midnight, 14GB Airtel

// ===== GENERATE PRODUCT CARD =====
function generateProductCard(product) {
    const isAirtel = product.network.toLowerCase().includes('airtel');
    const networkClass = isAirtel ? 'airtel' : 'safaricom';
    
    // Badge text
    let badge = '🔥 Popular';
    if (product.id === 30) badge = '⚡ Best Deal';
    else if (product.id === 17) badge = '📞 Best Value';
    else if (product.id === 27) badge = '📦 Big Saver';
    
    // Use the same slug function as products.html - includes ID!
    const filename = getSlug(product.title, product.id);
    const link = `../product/${filename}`;
    
    return `
        <a href="${link}" class="popular-package ${networkClass}">
            <div class="p-name">${product.title}</div>
            <div class="p-price">Ksh ${product.price}</div>
            <div class="p-validity">⏱️ ${product.validity}</div>
            <div class="p-badge">${badge}</div>
            <div class="p-cta">View Bundle →</div>
        </a>
    `;
}

// ===== GENERATE THE FULL SECTION =====
function generatePopularPackagesSection() {
    const featured = [];
    for (const id of featuredIds) {
        const product = products.find(p => p.id === id);
        if (product) featured.push(product);
    }
    
    // If less than 4, add extra products
    if (featured.length < 4) {
        const remaining = products.filter(p => !featuredIds.includes(p.id));
        for (let i = 0; i < remaining.length && featured.length < 4; i++) {
            featured.push(remaining[i]);
        }
    }
    
    const cardsHTML = featured.map(p => generateProductCard(p)).join('\n');
    
    return `
    <!-- ===== POPULAR PACKAGES ===== -->
    <div class="popular-packages">
        ${cardsHTML}
    </div>
    `;
}

// ===== INJECT INTO BLOG POST =====
function injectIntoBlog(filePath) {
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    
    // Remove old popular packages section if exists (to avoid duplicates)
    if ($('.popular-packages').length > 0) {
        $('.popular-packages').remove();
        console.log(`🔄 Removed old section from ${path.basename(filePath)}`);
    }
    
    const postContent = $('.post-content');
    if (postContent.length === 0) return false;
    
    // Insert after table of contents or first paragraph
    const toc = postContent.find('.table-of-contents');
    if (toc.length > 0) {
        toc.after(generatePopularPackagesSection());
    } else {
        const firstParagraph = postContent.find('p').first();
        if (firstParagraph.length > 0) {
            firstParagraph.after(generatePopularPackagesSection());
        } else {
            postContent.prepend(generatePopularPackagesSection());
        }
    }
    
    // Add CSS if not present
    const head = $('head');
    const existingStyle = head.find('style').filter((i, el) => {
        return $(el).html().includes('popular-package');
    });
    
    if (existingStyle.length === 0) {
        const styles = `
    <style>
        /* ===== Popular Packages ===== */
        .popular-packages {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }
        .popular-package {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            border-radius: 20px;
            padding: 1.4rem 0.8rem;
            border: 1px solid #eef2f6;
            transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
            text-decoration: none;
            color: #1a1a1a;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            height: 100%;
            min-height: 200px;
            position: relative;
            overflow: hidden;
        }
        .popular-package:hover {
            transform: translateY(-6px);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
            border-color: #d0d9e6;
        }
        .popular-package .p-name {
            font-weight: 700;
            font-size: 1.15rem;
            margin-bottom: 2px;
            color: #111827;
        }
        .popular-package .p-price {
            font-weight: 800;
            font-size: 1.3rem;
            color: var(--safaricom, #009B4D);
            margin-bottom: 2px;
        }
        .popular-package .p-validity {
            font-size: 0.75rem;
            color: #64748b;
            margin-bottom: 6px;
        }
        .popular-package .p-badge {
            font-size: 0.6rem;
            font-weight: 700;
            padding: 0.2rem 0.8rem;
            border-radius: 30px;
            background: #dcfce7;
            color: #166534;
            margin-bottom: 12px;
            display: inline-block;
            letter-spacing: 0.3px;
        }
        .popular-package.airtel .p-price {
            color: var(--airtel, #E10000);
        }
        .popular-package.airtel .p-badge {
            background: #fef2f2;
            color: #991b1b;
        }
        .popular-package .p-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            background: var(--safaricom, #009B4D);
            color: #ffffff;
            font-weight: 700;
            font-size: 0.8rem;
            padding: 8px 24px;
            border-radius: 50px;
            letter-spacing: 0.4px;
            transition: all 0.2s ease;
            width: auto;
            min-width: 120px;
            border: none;
            cursor: pointer;
            text-transform: uppercase;
            box-shadow: 0 4px 10px rgba(0, 155, 77, 0.25);
            margin-top: 4px;
            background: #0f7b3a;
        }
        .popular-package:hover .p-cta {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(0, 155, 77, 0.35);
            background: #00632e;
        }
        .popular-package.airtel .p-cta {
            background: #cc0000;
            box-shadow: 0 4px 10px rgba(225, 0, 0, 0.25);
        }
        .popular-package.airtel:hover .p-cta {
            background: #a30000;
            box-shadow: 0 8px 20px rgba(225, 0, 0, 0.35);
        }
        .popular-package::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--safaricom, #009B4D);
            border-radius: 20px 20px 0 0;
            opacity: 0.6;
            transition: opacity 0.2s;
        }
        .popular-package.airtel::before {
            background: var(--airtel, #E10000);
        }
        .popular-package:hover::before {
            opacity: 1;
        }
        @media (max-width: 480px) {
            .popular-packages {
                grid-template-columns: 1fr 1fr;
                gap: 0.5rem;
            }
            .popular-package {
                padding: 0.7rem;
                min-height: 150px;
            }
            .popular-package .p-cta {
                font-size: 0.7rem;
                padding: 6px 16px;
                min-width: 90px;
            }
            .popular-package .p-price {
                font-size: 1.1rem;
            }
            .popular-package .p-name {
                font-size: 0.85rem;
            }
        }
    </style>
    `;
        
        const lastStyle = head.find('style').last();
        if (lastStyle.length > 0) {
            lastStyle.after(styles);
        } else {
            head.append(styles);
        }
    }
    
    // Write updated HTML
    fs.writeFileSync(filePath, $.html());
    return true;
}

// ===== MAIN =====
function main() {
    console.log('🚀 Injecting Popular Packages (with correct links!) into blog posts...\n');
    
    // Backup directory
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR);
        console.log(`📁 Created backup: ${BACKUP_DIR}\n`);
    }
    
    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html') && f !== 'blog.html');
    console.log(`📂 Found ${files.length} blog posts.\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const file of files) {
        const filePath = path.join(BLOG_DIR, file);
        
        // Backup
        const backupPath = path.join(BACKUP_DIR, file);
        fs.copyFileSync(filePath, backupPath);
        
        const result = injectIntoBlog(filePath);
        if (result) {
            updated++;
            console.log(`✅ Updated: ${file}`);
        } else {
            skipped++;
        }
    }
    
    console.log(`\n✅ Done!`);
    console.log(`📊 Updated: ${updated} files`);
    console.log(`⏭️ Skipped: ${skipped} files`);
    console.log(`📁 Backups: ${BACKUP_DIR}`);
}

main();