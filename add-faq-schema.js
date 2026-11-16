const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURATION
// ============================================================

// Path to your blog folder
const BLOG_DIR = path.join(__dirname, 'blog');

// Generic FAQ schema template (replace with your questions)
const FAQ_SCHEMA = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I buy bundles with Okoa?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can buy bundles with Okoa using Till 509947 via M-PESA Buy Goods and Services. The transaction bypasses Okoa checks and delivers bundles instantly."
      }
    },
    {
      "@type": "Question",
      "name": "Does Till 509947 work with Okoa debt?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes – Till 509947 bypasses Okoa debt checks. You can buy airtime, bundles, minutes, and data even with active Okoa Jahazi or Airtel Pewa debt."
      }
    },
    {
      "@type": "Question",
      "name": "Is Till 509947 safe and verified?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes – Till 509947 is a verified reseller till used by thousands of Kenyans. It is safe, automated, and delivers purchases instantly."
      }
    }
  ]
}
</script>
`;

// Pages to exclude (add filenames here)
const EXCLUDE_PAGES = [
  'bingwa-soko-ussd-code-quick-access-guide.html'
];

// ============================================================
// MAIN FUNCTION
// ============================================================

function addFaqSchemaToFile(filePath) {
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if schema already exists
    if (content.includes('"@type": "FAQPage"')) {
      console.log(`⏭️  SKIP: ${path.basename(filePath)} (already has FAQ schema)`);
      return;
    }

    // Check if file is excluded
    const fileName = path.basename(filePath);
    if (EXCLUDE_PAGES.includes(fileName)) {
      console.log(`⏭️  SKIP: ${fileName} (excluded)`);
      return;
    }

    // Insert FAQ schema before </head>
    const headClosingTag = '</head>';
    if (content.includes(headClosingTag)) {
      content = content.replace(headClosingTag, FAQ_SCHEMA + '\n\n' + headClosingTag);
    } else {
      // Fallback: insert before </body>
      const bodyClosingTag = '</body>';
      if (content.includes(bodyClosingTag)) {
        content = content.replace(bodyClosingTag, FAQ_SCHEMA + '\n\n' + bodyClosingTag);
      } else {
        console.log(`❌ ERROR: Could not find </head> or </body> in ${fileName}`);
        return;
      }
    }

    // Write the updated file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ADDED: ${fileName}`);

  } catch (error) {
    console.error(`❌ ERROR processing ${path.basename(filePath)}:`, error.message);
  }
}

// ============================================================
// PROCESS ALL HTML FILES IN BLOG FOLDER
// ============================================================

console.log('🚀 Starting FAQ schema insertion...\n');

// Check if blog directory exists
if (!fs.existsSync(BLOG_DIR)) {
  console.error(`❌ Blog directory not found: ${BLOG_DIR}`);
  console.error('   Please update BLOG_DIR path in the script.');
  process.exit(1);
}

// Get all HTML files in the blog directory
const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.html'));

console.log(`📁 Found ${files.length} HTML files in blog folder\n`);

let addedCount = 0;
let skipCount = 0;

files.forEach(file => {
  const filePath = path.join(BLOG_DIR, file);
  
  // Check if file has FAQ schema already
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('"@type": "FAQPage"')) {
    skipCount++;
    console.log(`⏭️  SKIP: ${file} (already has FAQ schema)`);
    return;
  }
  
  // Check if excluded
  if (EXCLUDE_PAGES.includes(file)) {
    skipCount++;
    console.log(`⏭️  SKIP: ${file} (excluded)`);
    return;
  }
  
  // Add schema
  addFaqSchemaToFile(filePath);
  addedCount++;
});

console.log('\n📊 SUMMARY:');
console.log(`   ✅ Added: ${addedCount} files`);
console.log(`   ⏭️  Skipped: ${skipCount} files`);
console.log(`   📁 Total: ${files.length} files`);
console.log('\n🎉 Done! FAQ schema added to all blog pages.');