// ═══════════════════════════════════════════════════════════════
// 🌸 SADAFATOUNE - MAIN JAVASCRIPT WITH SHOPPING CART 🌸
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// 🛒 SHOPPING CART STATE
// ═══════════════════════════════════════════════════════════════
let cart = [];

// ═══════════════════════════════════════════════════════════════
// 🎯 INITIALIZATION
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initializeWebsite();
    loadProducts();
    setupNavigation();
    setupScrollAnimations();
    setupOrderForm();
    loadContactInfo();
    setupCart();
    loadCartFromStorage();
});

// ═══════════════════════════════════════════════════════════════
// 🌸 INITIALIZE WEBSITE
// ═══════════════════════════════════════════════════════════════
function initializeWebsite() {
    console.log('🌸 Sadafatoune website initialized!');
    
    // Apply colors from config
    if (CONFIG.colors) {
        const root = document.documentElement;
        Object.keys(CONFIG.colors).forEach(key => {
            root.style.setProperty(`--color-${key}`, CONFIG.colors[key]);
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// 🛍️ LOAD PRODUCTS
// ═══════════════════════════════════════════════════════════════
function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) return;
    
    // Clear existing content
    productsGrid.innerHTML = '';
    
    // Load products from config
    CONFIG.products.forEach((product, index) => {
        const card = createProductCard(product, index);
        productsGrid.appendChild(card);
    });
}

// ═══════════════════════════════════════════════════════════════
// 🎨 CREATE PRODUCT CARD
// ═══════════════════════════════════════════════════════════════
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product__card fade-in';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="product__image">
            <img src="${product.image}" alt="${product.name}" class="product__img">
            <span class="product__badge">${product.category}</span>
        </div>
        <div class="product__content">
            <h3 class="product__name">${product.name}</h3>
            <p class="product__price">${product.price}</p>
            <div class="product__actions">
                <button class="product__btn product__btn-add" data-product-id="${product.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 2L7 6H3L6 20H18L21 6H17L15 2H9Z"/>
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="15" cy="21" r="1"/>
                    </svg>
                    Ajouter au panier
                </button>
            </div>
        </div>
    `;
    
    // Add to cart button event
    const addButton = card.querySelector('.product__btn-add');
    addButton.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product);
    });
    
    return card;
}

// ═══════════════════════════════════════════════════════════════
// 🛒 SHOPPING CART FUNCTIONS
// ═══════════════════════════════════════════════════════════════
function setupCart() {
    const cartButton = document.getElementById('cart-button');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const continueShopping = document.getElementById('continue-shopping');
    const checkoutButton = document.getElementById('checkout-button');
    
    // Open cart
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            cartSidebar.classList.add('active');
        });
    }
    
    // Close cart
    const closeCart = () => {
        cartSidebar.classList.remove('active');
    };
    
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (continueShopping) continueShopping.addEventListener('click', closeCart);
    
    // Checkout button
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Votre panier est vide. Ajoutez des produits avant de commander.');
                return;
            }
            closeCart();
            document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function addToCart(product) {
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    saveCartToStorage();
    
    // Show feedback
    showAddToCartFeedback();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToStorage();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            saveCartToStorage();
        }
    }
}

function updateCart() {
    updateCartCount();
    updateCartItems();
    updateCartTotal();
    updateFormCartSummary();
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function updateCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartFooter = document.getElementById('cart-footer');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'flex';
        cartFooter.style.display = 'none';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';
    
    // Clear and rebuild cart items
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart__item';
        cartItem.innerHTML = `
            <div class="cart__item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart__item-details">
                <h4 class="cart__item-name">${item.name}</h4>
                <p class="cart__item-price">${item.price}</p>
                <div class="cart__item-controls">
                    <div class="cart__item-quantity">
                        <button class="cart__item-btn" data-action="decrease" data-id="${item.id}">-</button>
                        <span class="cart__item-count">${item.quantity}</span>
                        <button class="cart__item-btn" data-action="increase" data-id="${item.id}">+</button>
                    </div>
                    <button class="cart__item-remove" data-id="${item.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const decreaseBtn = cartItem.querySelector('[data-action="decrease"]');
        const increaseBtn = cartItem.querySelector('[data-action="increase"]');
        const removeBtn = cartItem.querySelector('.cart__item-remove');
        
        decreaseBtn.addEventListener('click', () => updateQuantity(item.id, -1));
        increaseBtn.addEventListener('click', () => updateQuantity(item.id, 1));
        removeBtn.addEventListener('click', () => removeFromCart(item.id));
        
        cartItemsContainer.appendChild(cartItem);
    });
}

function updateCartTotal() {
    const cartTotalElement = document.getElementById('cart-total');
    if (!cartTotalElement) return;
    
    const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(/[^\d]/g, ''));
        return sum + (price * item.quantity);
    }, 0);
    
    cartTotalElement.textContent = `${total} DH`;
}

function updateFormCartSummary() {
    const formCartSummary = document.getElementById('form-cart-summary');
    if (!formCartSummary) return;
    
    if (cart.length === 0) {
        formCartSummary.innerHTML = '<p class="form__cart-empty">Votre panier est vide. Ajoutez des produits avant de commander.</p>';
        return;
    }
    
    let summaryHTML = '';
    cart.forEach(item => {
        summaryHTML += `
            <div class="form__cart-item">
                <div>
                    <div class="form__cart-item-name">${item.name}</div>
                    <div class="form__cart-item-details">Quantité: ${item.quantity} × ${item.price}</div>
                </div>
            </div>
        `;
    });
    
    const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(/[^\d]/g, ''));
        return sum + (price * item.quantity);
    }, 0);
    
    summaryHTML += `
        <div class="form__cart-item" style="border-top: 2px solid var(--color-primary); margin-top: 1rem; padding-top: 1rem;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--color-primary);">
                <span>Total:</span>
                <span>${total} DH</span>
            </div>
        </div>
    `;
    
    formCartSummary.innerHTML = summaryHTML;
}

function showAddToCartFeedback() {
    const cartButton = document.getElementById('cart-button');
    if (cartButton) {
        cartButton.style.animation = 'none';
        setTimeout(() => {
            cartButton.style.animation = 'pulse 0.5s ease';
        }, 10);
    }
}

function saveCartToStorage() {
    localStorage.setItem('sadafatoune_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('sadafatoune_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCart();
        } catch (e) {
            console.error('Error loading cart from storage:', e);
            cart = [];
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 🧭 NAVIGATION SETUP
// ═══════════════════════════════════════════════════════════════
function setupNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');
    const header = document.getElementById('header');
    
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════
// ✨ SCROLL ANIMATIONS
// ═══════════════════════════════════════════════════════════════
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    // Observe sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
}

// ═══════════════════════════════════════════════════════════════
// 📧 LOAD CONTACT INFORMATION
// ═══════════════════════════════════════════════════════════════
function loadContactInfo() {
    // Update contact information from config
    const contactPhone = document.getElementById('contact-phone');
    const contactEmail = document.getElementById('contact-email');
    const contactAddress = document.getElementById('contact-address');
    const instagramLink = document.getElementById('instagram-link');
    const instagramHandle = document.getElementById('instagram-handle');
    const facebookLink = document.getElementById('facebook-link');
    const facebookHandle = document.getElementById('facebook-handle');
    
    if (contactPhone) contactPhone.textContent = CONFIG.contact.phone;
    if (contactEmail) contactEmail.textContent = CONFIG.contact.email;
    if (contactAddress) contactAddress.textContent = CONFIG.contact.address;
    if (instagramHandle) instagramHandle.textContent = CONFIG.contact.instagram;
    if (facebookHandle) facebookHandle.textContent = CONFIG.contact.facebook;
    
    // Update social links
    if (instagramLink) {
        instagramLink.href = `https://instagram.com/${CONFIG.contact.instagram.replace('@', '')}`;
    }
    if (facebookLink) {
        facebookLink.href = `https://facebook.com/${CONFIG.contact.facebook}`;
    }
}

// ═══════════════════════════════════════════════════════════════
// 📝 ORDER FORM SETUP
// ═══════════════════════════════════════════════════════════════
function setupOrderForm() {
    const form = document.getElementById('order-form');
    const submitBtn = document.getElementById('submit-btn');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check if cart is empty
        if (cart.length === 0) {
            alert('Votre panier est vide. Ajoutez des produits avant de commander.');
            return;
        }
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            products: cart.map(item => `${item.name} (x${item.quantity})`).join(', '),
            address: document.getElementById('address').value.trim(),
            notes: document.getElementById('notes').value.trim(),
            total: cart.reduce((sum, item) => {
                const price = parseFloat(item.price.replace(/[^\d]/g, ''));
                return sum + (price * item.quantity);
            }, 0) + ' DH',
            timestamp: new Date().toLocaleString('fr-FR', {
                dateStyle: 'full',
                timeStyle: 'short'
            })
        };
        
        // Validate form
        if (!validateForm(formData)) {
            return;
        }
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Send to Google Sheets
            await sendToGoogleSheets(formData);
            
            // Show success message
            showThankYouModal(formData);
            
            // Reset form and cart
            form.reset();
            cart = [];
            updateCart();
            saveCartToStorage();
            
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Une erreur est survenue lors de l\'envoi de votre commande. Veuillez réessayer ou nous contacter directement.');
        } finally {
            // Remove loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// ✅ VALIDATE FORM
// ═══════════════════════════════════════════════════════════════
function validateForm(data) {
    if (!data.name || data.name.length < 2) {
        alert('Veuillez entrer votre nom complet.');
        return false;
    }
    
    if (!data.phone || data.phone.length < 10) {
        alert('Veuillez entrer un numéro de téléphone valide.');
        return false;
    }
    
    if (!data.address || data.address.length < 10) {
        alert('Veuillez entrer une adresse de livraison complète.');
        return false;
    }
    
    return true;
}

// ═══════════════════════════════════════════════════════════════
// 📊 SEND TO GOOGLE SHEETS
// ═══════════════════════════════════════════════════════════════
async function sendToGoogleSheets(data) {
    const webAppURL = CONFIG.googleSheetsWebAppURL;
    
    // Check if Google Sheets URL is configured
    if (!webAppURL || webAppURL === 'Yhttps://script.google.com/macros/s/AKfycbyavRta5hb0fK41i7oOyeIH3F2OnFPW8ltIKPUWKUlyBwfMQdC2rP8C0fu8qtI0KWam/exec') {
        console.warn('⚠️ Google Sheets integration not configured yet.');
        console.log('📋 Order data:', data);
        
        // For testing purposes, we'll still show success
        // In production, you should configure the Google Sheets integration
        return Promise.resolve();
    }
    
    try {
        const response = await fetch(webAppURL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('✅ Order sent to Google Sheets successfully!');
        console.log('📋 Order data:', data);
        
        return response;
        
    } catch (error) {
        console.error('❌ Error sending to Google Sheets:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════
// 🎉 SHOW THANK YOU MODAL
// ═══════════════════════════════════════════════════════════════
function showThankYouModal(data) {
    const modal = document.getElementById('thank-you-modal');
    const orderDetails = document.getElementById('order-details');
    const closeBtn = document.getElementById('close-modal');
    
    if (!modal) return;
    
    // Populate order details
    orderDetails.innerHTML = `
        <p><strong>Nom:</strong> ${data.name}</p>
        <p><strong>Téléphone:</strong> ${data.phone}</p>
        <p><strong>Produits:</strong> ${data.products}</p>
        <p><strong>Total:</strong> ${data.total}</p>
        <p><strong>Adresse:</strong> ${data.address}</p>
        ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
        <p><strong>Date:</strong> ${data.timestamp}</p>
    `;
    
    // Show modal
    modal.classList.add('active');
    
    // Close modal handlers
    const closeModal = () => {
        modal.classList.remove('active');
    };
    
    closeBtn.addEventListener('click', closeModal);
    
    modal.querySelector('.modal__overlay').addEventListener('click', closeModal);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// 🎨 PARALLAX EFFECT FOR HERO
// ═══════════════════════════════════════════════════════════════
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroShapes = document.querySelectorAll('.hero__shape');
    
    heroShapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.2);
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ═══════════════════════════════════════════════════════════════
// 🌸 CONSOLE MESSAGE
// ═══════════════════════════════════════════════════════════════
console.log('%c🌸 Sadafatoune 🌸', 'color: #FFB6C1; font-size: 24px; font-weight: bold;');
console.log('%cAccessoires élégants pour femmes', 'color: #DDA0DD; font-size: 14px;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #FFC0CB;');
console.log('%c🛒 Shopping cart enabled!', 'color: #8B8B8B; font-size: 12px;');
