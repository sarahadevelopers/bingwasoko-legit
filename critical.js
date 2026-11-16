// critical.js
let products = [];
let currentType = "all";

let allFilteredProducts = [];
let currentBatch = 0;
const BATCH_SIZE = 6;

const networkFilterBar = document.getElementById("networkFilterBar");
const productGrid = document.getElementById("productGrid");
const loadMoreContainer = document.getElementById("loadMoreContainer");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const bottomAllBtn = document.getElementById("bottomAllBtn");
const bottomDataBtn = document.getElementById("bottomDataBtn");
const bottomMinBtn = document.getElementById("bottomMinBtn");
const bottomSmsBtn = document.getElementById("bottomSmsBtn");

// ============================================
// TIME-BASED AVAILABILITY CHECK
// ============================================
function isNightTime() {
    const hour = new Date().getHours();
    // 19 is 7 PM, 23 is 11 PM
    return hour >= 19 && hour < 23; 
}

function buildTypeFilters() {
    if (!networkFilterBar) return;
    const buttons = [
        { type: "all",     label: "All Packages" },
        { type: "data",    label: "Data" },
        { type: "minutes", label: "Minutes" },
        { type: "sms",     label: "SMS" }
    ];

    networkFilterBar.innerHTML = buttons.map(b => `
        <button class="filter-btn ${currentType === b.type ? "active" : ""}" data-type="${b.type}">
            ${b.label}
        </button>
    `).join("");

    networkFilterBar.querySelectorAll("[data-type]").forEach(btn => {
        btn.addEventListener("click", () => {
            currentType = btn.dataset.type;
            networkFilterBar.querySelectorAll("[data-type]").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            updateBottomBarActive(currentType);
            renderProductsWithLoadMore();
        });
    });
}

function getFilteredProducts() {
    let filtered = products.filter(p => p.network === "Safaricom");
    if (currentType !== "all") {
        filtered = filtered.filter(p => p.type === currentType);
    }
    return filtered;
}

function renderProductsWithLoadMore() {
    if (!productGrid) return;
    allFilteredProducts = getFilteredProducts();
    currentBatch = 0;
    productGrid.innerHTML = "";
    renderNextBatch();

    if (loadMoreContainer) {
        if (allFilteredProducts.length > BATCH_SIZE) {
            loadMoreContainer.style.display = "flex";
            if (loadMoreBtn) loadMoreBtn.style.display = "inline-flex";
        } else {
            loadMoreContainer.style.display = "none";
        }
    }
}

const slugMap = {
    1: "safaricom-1-gb-1-hour-5.html", 2: "safaricom-500-mb-24-hours-7.html", 3: "safaricom-600-mb-7-days-6.html",
    4: "safaricom-1-gb-24-hours-11.html", 5: "safaricom-25-gb-24-hours-2.html", 6: "safaricom-15-gb-3-hours-4.html",
    7: "safaricom-125-gb-midnight-1.html", 8: "safaricom-14-gb-7-days-8.html", 9: "safaricom-15-gb-6-hours-9.html",
    10: "safaricom-45-mins-3-hours-17.html", 11: "safaricom-50-mins-midnight-16.html", 12: "safaricom-100-mins-2-days-15.html",
    13: "safaricom-250-mins-7-days-12.html", 14: "safaricom-300-mins-30-days-14.html", 15: "safaricom-800-mins-30-days-13.html",
    16: "safaricom-1250-mins-30-days-22.html", 17: "safaricom-7-gb-7-days-3.html", 18: "safaricom-300-mb-24-hours-10.html",
    19: "safaricom-150-mins-2gb-7-days-23.html", 20: "safaricom-1700-mins-30-days-20.html", 21: "safaricom-20-sms-24-hours-25.html",
    22: "safaricom-150-calls-sms-no-expiry-18.html", 23: "safaricom-60-calls-sms-no-expiry-19.html", 24: "safaricom-550-mins-6gb-30-days-24.html"
};
function renderNextBatch() {
    const nextItems = allFilteredProducts.slice(currentBatch, currentBatch + BATCH_SIZE);
    const isNight = isNightTime(); // Check time once per batch

    nextItems.forEach(product => {
        const template = document.getElementById("productCardTemplate");
        if (!template) return;
        const card = template.content.cloneNode(true);
        const cardDiv = card.querySelector(".product-card");
        cardDiv.classList.add("safaricom");

        card.querySelector(".product-title").textContent = product.title;
        card.querySelector(".validity-badge").textContent = product.validity;
        card.querySelector(".price-value").textContent = product.price;

        // ============================================
        // NIGHT-TIME OVERRIDE LOGIC
        // ============================================
        const nightRestrictedIds = [1, 6, 7]; // IDs for 1GB@19, 1.5GB@52, 1GB Tunukiwa@22
        
        if (isNight && nightRestrictedIds.includes(product.id)) {
            cardDiv.style.opacity = "0.6";
            
            const btnBuy = card.querySelector(".btn-buy");
            btnBuy.textContent = "Unavailable (7PM-11PM)";
            btnBuy.style.background = "#999";
            btnBuy.style.cursor = "not-allowed";
            btnBuy.disabled = true;
            
            // Add a note below the buttons
            const note = document.createElement("div");
            note.style.fontSize = "0.75rem";
            note.style.color = "#E10000";
            note.style.marginTop = "0.5rem";
            note.style.textAlign = "center";
            note.innerHTML = "🌙 Unavailable tonight. Try <strong>250MB @ 20</strong> or <strong>1GB 24Hrs @ 55</strong>.";
            cardDiv.appendChild(note);
        } else {
            // Normal behavior
            card.querySelector(".btn-buy").addEventListener("click", () => {
                if (typeof openPaymentModal === "function") openPaymentModal(product, "buy");
            });
        }

        // Gift button is always available
        card.querySelector(".btn-gift").addEventListener("click", () => {
            if (typeof openPaymentModal === "function") openPaymentModal(product, "gift");
        });

        const popularIds = [1, 5, 9, 15, 17, 21]; 
        if (popularIds.includes(product.id)) {
            const popularBadge = card.querySelector(".popular-badge");
            if (popularBadge) popularBadge.style.display = "block";
        }

        productGrid.appendChild(card);
    });

    currentBatch += BATCH_SIZE;
    if (loadMoreBtn && currentBatch >= allFilteredProducts.length) {
        loadMoreBtn.style.display = "none";
    }
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", renderNextBatch);
}

function updateBottomBarActive(type) {
    [bottomAllBtn, bottomDataBtn, bottomMinBtn, bottomSmsBtn].forEach(btn => {
        if (btn) btn.classList.remove("active");
    });
    const map = { "all": bottomAllBtn, "data": bottomDataBtn, "minutes": bottomMinBtn, "sms": bottomSmsBtn };
    if (map[type]) map[type].classList.add("active");
}

function handleBottomTypeClick(type) {
    const mainBtn = document.querySelector(`.filter-btn[data-type="${type}"]`);
    if (mainBtn) {
        mainBtn.click();
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
}

if (bottomAllBtn) bottomAllBtn.addEventListener("click", () => handleBottomTypeClick("all"));
if (bottomDataBtn) bottomDataBtn.addEventListener("click", () => handleBottomTypeClick("data"));
if (bottomMinBtn) bottomMinBtn.addEventListener("click", () => handleBottomTypeClick("minutes"));
if (bottomSmsBtn) bottomSmsBtn.addEventListener("click", () => handleBottomTypeClick("sms"));

fetch("/products.json")
    .then(res => res.json())
    .then(data => {
        const raw = Array.isArray(data) ? data : (data.products || []);
        products = raw;
        buildTypeFilters();
        renderProductsWithLoadMore();
        updateBottomBarActive("all");
    })
    .catch(err => console.error("Failed to load products:", err));
