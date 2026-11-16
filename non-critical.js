// non-critical.js
// ============================================
// Payment Modal, Quick Buy, Live Notifications, Hero Section (Top Picks)
// Bingwa Sokoni - Safaricom Only Build
// ============================================

// ---------- Shared secret (must match API_SECRET in Render) ----------
const API_SECRET = "103e07b75c0b3d874cd4376dd0e095729f66d4f268033061aa087df169acc4ac4";

// ---------- reCAPTCHA site key (from Google) ----------
const RECAPTCHA_SITE_KEY = "6LcKDGEtAAAAAJKAWjXB7j5bSIPvzz94wBWapTD5";

// ---------- Modal Event Attachment ----------
function attachModalEvents() {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.removeEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
    }
    
    modal.removeEventListener('click', outsideClickHandler);
    modal.addEventListener('click', outsideClickHandler);
    
    const doneBtn = modal.querySelector('.done-btn');
    if (doneBtn) {
        doneBtn.removeEventListener('click', closeModal);
        doneBtn.addEventListener('click', closeModal);
    }
}

function outsideClickHandler(e) {
    if (e.target === document.getElementById('paymentModal')) {
        closeModal();
    }
}

// ---------- Lazy‑load modal HTML when needed ----------
function ensureModalExists() {
    let modal = document.getElementById('paymentModal');
    if (modal) {
        attachModalEvents();
        return;
    }
    
    const modalHTML = `
        <div id="paymentModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <div id="modalBody"></div>
                <div id="modalSpinner" style="display: none;" class="spinner-container">
                    <div class="spinner"></div>
                    <p class="spinner-text">Requesting M-PESA PIN... Check your phone.</p>
                </div>
                <div id="modalSuccess" style="display: none;" class="success-container">
                    <div class="checkmark">✔</div>
                    <h3>Payment Successful!</h3>
                    <p>Your bundle is being processed. Thank you for choosing Bingwa Sokoni.</p>
                    <button class="done-btn">Done</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    attachModalEvents();
}

// ---------- Payment Modal ----------
let selectedProduct = null;
let currentAction = null;
const phonePattern = '^(07[0-9]{8}|011[0-9]{7}|2547[0-9]{8}|25411[0-9]{7})$';

function validatePhone(phone) {
    const regex = new RegExp(phonePattern);
    return regex.test(phone);
}

function openPaymentModal(product, action) {
    // ============================================
    // 🎁 GIFTING VIA WHATSAPP (WITH INSTRUCTIONS & CALL OPTION)
    // ============================================
    if (action === "gift") {
        ensureModalExists();

        document.body.classList.add("modal-open");
        document.getElementById("modalBody").style.display = "block";
        document.getElementById("modalSpinner").style.display = "none";
        document.getElementById("modalSuccess").style.display = "none";

        const waNumber = "254725206054"; // Your WhatsApp number
        const callNumber = "+254725206054"; // Your Call number
        const message = `Hi Bingwa Sokoni! 👋\n\nI want to gift a friend:\n📦 *Bundle:* ${product.title}\n💰 *Price:* Ksh ${product.price}\n\n🎁 *Recipient Number:* [Type your friend's number here]\n📱 *My Payer Number:* [Type your number here]`;
        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

        let html = `
            <div class="product-summary" style="text-align:center; margin-bottom: 1rem;">
                <h3>Gift a Friend 🎁</h3>
                <p style="font-size: 1.1rem; margin-top: 0.5rem;">You are gifting <strong>${product.title}</strong> for <strong>Ksh ${product.price}</strong></p>
            </div>
            
            <div style="background: #f0f9f0; border: 1px solid #009B4D; border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; font-size: 0.95rem;">
                <h4 style="margin-bottom: 0.5rem; color: #009B4D;">How gifting works:</h4>
                <ol style="padding-left: 1.2rem; margin: 0; line-height: 1.6;">
                    <li>Click the WhatsApp button below.</li>
                    <li>Send us your friend's phone number.</li>
                    <li>We will reply with an M-Pesa prompt.</li>
                    <li>Once paid, your friend gets the bundle instantly!</li>
                </ol>
            </div>

            <a href="${waUrl}" target="_blank" class="pay-btn" style="display: block; text-align: center; text-decoration: none; background: #25D366; color: white; padding: 1rem; border-radius: 40px; font-weight: bold; font-size: 1.1rem; transition: transform 0.2s; margin-bottom: 1rem;">
                💬 Continue to WhatsApp
            </a>

            <div style="text-align: center; margin-top: 1rem; border-top: 1px solid #eee; padding-top: 1rem;">
                <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">Prefer to speak to a human?</p>
                <a href="tel:${callNumber}" style="display: inline-block; text-decoration: none; color: #009B4D; font-weight: bold; font-size: 1.05rem; background: #f0f9f0; padding: 0.6rem 1.5rem; border-radius: 40px; border: 1px solid #009B4D;">
                    📞 Call 0725 206 054
                </a>
            </div>
        `;

        document.getElementById("modalBody").innerHTML = html;
        document.getElementById("paymentModal").style.display = "flex";
        return; // Stop the rest of the function
    }
    // ============================================

    ensureModalExists();
    
    selectedProduct = product;
    currentAction = action;
    const savedNumber = localStorage.getItem("bingwasokoni_saved_number") || "";

    document.body.classList.add("modal-open");

    document.getElementById("modalBody").style.display = "block";
    document.getElementById("modalSpinner").style.display = "none";
    document.getElementById("modalSuccess").style.display = "none";

    let html = `
        <div class="product-summary">
            <h3>${product.title}</h3>
            <p>${product.validity} · Ksh ${product.price}</p>
        </div>
        <input type="tel" id="payerNumber" placeholder="Your phone number (e.g. 0712 345 678)" value="${savedNumber}" required>
        <div class="save-number">
            <input type="checkbox" id="saveNumberCheckbox" ${savedNumber ? "checked" : ""}>
            <label for="saveNumberCheckbox">Save my number for next time</label>
        </div>
        <button class="pay-btn" id="payNowBtn">Pay via M-PESA</button>
    `;

    document.getElementById("modalBody").innerHTML = html;

    const payBtn = document.getElementById("payNowBtn");
    if (payBtn) {
        payBtn.removeEventListener("click", handlePayClick);
        payBtn.addEventListener("click", handlePayClick);
    }

    function handlePayClick() {
        const saveCheckbox = document.getElementById("saveNumberCheckbox").checked;
        let payerNumber = document.getElementById("payerNumber").value.trim();
        if (!validatePhone(payerNumber)) {
            alert("Enter a valid Safaricom number (07XXXXXXXX, 011XXXXXXX, 2547XXXXXXXX, or 25411XXXXXXX).");
            return;
        }
        if (saveCheckbox) {
            localStorage.setItem("bingwasokoni_saved_number", payerNumber);
        } else {
            localStorage.removeItem("bingwasokoni_saved_number");
        }

        initiatePayment(product, payerNumber, action);
    }

    document.getElementById("paymentModal").style.display = "flex";
}

// ---------- Initiate Payment (with reCAPTCHA & Secret) ----------
function initiatePayment(product, payerNumber, action) {
    document.getElementById("modalBody").style.display = "none";
    document.getElementById("modalSpinner").style.display = "block";

    // FIXED: Updated to the correct Render URL
    const apiUrl = (typeof window.API_BASE_URL !== 'undefined')
        ? window.API_BASE_URL + "/api/pay"
        : "https://saraha-pay-daraja.onrender.com/api/pay";

    // FIXED: Added the SKU so the backend knows what to deliver
    const bundleSku = `SAF_${product.id}_${product.price}`;

    const payload = {
        name: product.title,
        phone: payerNumber,
        amount: product.price,
        bundle_sku: bundleSku,
        bundle_id: product.id,
        source: "bingwasoko-web"
    };

    let attempts = 0;
    const maxAttempts = 10;

    function checkRecaptcha() {
        if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.execute === 'function') {
            executePayment(apiUrl, payload, product, action);
            return;
        }

        attempts++;
        if (attempts < maxAttempts) {
            console.warn(`reCAPTCHA not ready (attempt ${attempts}/${maxAttempts}) – retrying...`);
            setTimeout(checkRecaptcha, 500);
        } else {
            console.error("reCAPTCHA failed to load after 5 seconds");
            alert("Security verification timed out. Please refresh the page and try again.");
            closeModal();
        }
    }

    checkRecaptcha();
}

function executePayment(apiUrl, payload, product, action) {
    grecaptcha.ready(() => {
        grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'payment' })
            .then(token => {
                if (!token) {
                    console.error("reCAPTCHA returned empty token");
                    alert("Security verification failed. Please refresh and try again.");
                    closeModal();
                    return;
                }
                sendPaymentRequest(apiUrl, payload, token, product, action);
            })
            .catch(err => {
                console.error("reCAPTCHA error:", err);
                alert("Security verification failed. Please refresh and try again.");
                closeModal();
            });
    });
}

// ---------- Actual fetch with headers ----------
function sendPaymentRequest(apiUrl, payload, recaptchaToken, product, action) {
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Secret": API_SECRET,
            "X-Recaptcha-Token": recaptchaToken
        },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        const data = await res.json();
        if (res.ok) {
            if (action !== "gift") saveLastPurchase(product);
            return { success: true, transactionId: data.transactionId };
        } else {
            throw new Error(data.error || data.details || "Payment failed");
        }
    })
    .then(() => {
        setTimeout(() => {
            document.getElementById("modalSpinner").style.display = "none";
            document.getElementById("modalSuccess").style.display = "block";
        }, 2000);
    })
    .catch(error => {
        console.error("Payment error:", error);
        alert("Payment failed: " + error.message);
        closeModal();
    });
}

// ---------- Close Modal ----------
function closeModal() {
    const modal = document.getElementById("paymentModal");
    if (!modal) return;
    
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
    
    const modalBody = document.getElementById("modalBody");
    const modalSpinner = document.getElementById("modalSpinner");
    const modalSuccess = document.getElementById("modalSuccess");
    
    if (modalBody) modalBody.style.display = "block";
    if (modalSpinner) modalSpinner.style.display = "none";
    if (modalSuccess) modalSuccess.style.display = "none";
    
    selectedProduct = null;
    currentAction = null;
}

// ---------- Quick Buy Bar ----------
function saveLastPurchase(product) {
    localStorage.setItem('bingwasokoni_last_bundle', JSON.stringify({
        title: product.title,
        network: product.network,
        price: product.price,
        validity: product.validity,
        type: product.type,
        id: product.id
    }));
    showQuickBuyBar();
}

function showQuickBuyBar() {
    const lastBundle = localStorage.getItem('bingwasokoni_last_bundle');
    if (!lastBundle) return;
    const quickBuyBar = document.getElementById('quickBuyBar');
    const lastBundleName = document.getElementById('lastBundleName');
    if (!quickBuyBar || !lastBundleName) return;
    const bundle = JSON.parse(lastBundle);
    lastBundleName.innerText = `${bundle.title} (Ksh ${bundle.price})`;
    quickBuyBar.classList.add('show');
    setTimeout(() => quickBuyBar.classList.remove('show'), 6000);
}

const repeatBuyBtn = document.getElementById('repeatBuyBtn');
if (repeatBuyBtn) {
    repeatBuyBtn.addEventListener('click', () => {
        const lastBundle = localStorage.getItem('bingwasokoni_last_bundle');
        if (lastBundle) openPaymentModal(JSON.parse(lastBundle), 'buy');
    });
}

// ---------- Live Notifications (Updated to Safaricom Poster) ----------
const purchaseMessages = [
    "🔥 Someone in Nairobi just bought 1.5GB Tunukiwa for Ksh 105!",
    "⚡ Mombasa user just grabbed 1GB for Ksh 19!",
    "📞 Nakuru customer purchased 45 Mins for Ksh 23",
    "📱 Kisumu user topped up 1.5GB for 3 hours",
    "💬 Eldoret user bought 20 SMS for Ksh 5",
    "🚀 Thika resident just grabbed 250MB for Ksh 20!"
];

let notifIndex = 0;

function startLiveNotifications() {
    const notif = document.getElementById('liveNotification');
    if (!notif) return;
    setInterval(() => {
        const notifText = document.getElementById('liveNotifText');
        if (notifText) {
            notifText.innerText = purchaseMessages[notifIndex % purchaseMessages.length];
        }
        notif.style.display = 'block';
        setTimeout(() => notif.style.display = 'none', 4000);
        notifIndex++;
    }, 25000);
}

// ---------- Hero Section (Top Picks) ----------
function renderHeroSection() {
    const heroContainer = document.getElementById("heroScroll");
    if (!heroContainer) return;
    if (typeof products === 'undefined') return;
    
    // Updated to new IDs based on the poster
    const topPickIds = [1, 9, 10, 17, 18, 21]; 
    const topPicks = products.filter(p => topPickIds.includes(p.id)).slice(0, 6);
    if (topPicks.length === 0) return;

    heroContainer.innerHTML = topPicks.map(product => `
        <div class="hero-card safaricom" data-product-id="${product.id}">
            <div class="network-strip" style="background: var(--safaricom);"></div>
            <div class="featured-badge">⭐ Top Pick</div>
            <div class="card-header">
                <div class="product-title">${product.title}</div>
                <div class="validity-badge">${product.validity}</div>
            </div>
            <div class="price-container">
                <span class="currency">Ksh</span>
                <span class="price-value">${product.price}</span>
            </div>
            <div class="okoa-badge">⚡ Okoa Friendly</div>
            <div class="actions">
                <button class="btn-buy">Buy Now</button>
                <button class="btn-gift">Gift</button>
            </div>
        </div>
    `).join("");

    document.querySelectorAll(".hero-card").forEach(card => {
        const productId = parseInt(card.dataset.productId);
        const product = products.find(p => p.id === productId);
        if (!product) return;
        card.querySelector(".btn-buy").addEventListener("click", (e) => {
            e.stopPropagation();
            openPaymentModal(product, "buy");
        });
        card.querySelector(".btn-gift").addEventListener("click", (e) => {
            e.stopPropagation();
            openPaymentModal(product, "gift");
        });
    });
}

// ---------- Wait for critical.js to define products ----------
function waitForProducts() {
    if (typeof products !== 'undefined' && products.length) {
        renderHeroSection();
        startLiveNotifications();
        setTimeout(() => {
            if (localStorage.getItem('bingwasokoni_last_bundle')) showQuickBuyBar();
        }, 1000);
    } else {
        setTimeout(waitForProducts, 200);
    }
}

// ===== FIX: Ensure close button works on existing modals =====
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('paymentModal')) {
        attachModalEvents();
    }
});

waitForProducts();