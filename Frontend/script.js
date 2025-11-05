// ==================== GLOBAL VARIABLES ====================
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = []; 

// ==================== IMAGE MODAL FUNCTIONALITY ====================
function openModal(imgElement) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const captionText = document.getElementById("modalCaption");
    if (!modal || !modalImg) return;
    modal.style.display = "block";
    modalImg.src = imgElement.src || '';
    captionText && (captionText.innerHTML = imgElement.alt || '');
}

function closeModal() {
    const modal = document.getElementById("imageModal");
    if (!modal) return;
    modal.style.display = "none";
}

// ==================== SECTION MANAGEMENT ====================
function showSection(sectionName) {
    if (!sectionName) return;
    // Hide all sections safely
    document.querySelectorAll('main > section').forEach(section => section.style.display = 'none');

    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) link.classList.add('active');
    });

    // Show target
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) targetSection.style.display = 'block';

    if (sectionName === 'cart') showCart();
}

// ==================== CART FUNCTIONS ====================
function addToCart(productId) {
    if (!productId) return showNotification('Invalid product.');
    const productIdStr = String(productId);
    const product = allProducts.find(p => String(p._id) === productIdStr);
    if (!product) {
        console.error('Product not found for ID:', productId);
        showNotification('Product not found!');
        return;
    }

    const existingItem = cart.find(item => String(item._id) === productIdStr);
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 0) + 1;
    } else {
        cart.push({
            _id: product._id,
            name: product.name,
            price: Number(product.price) || 0,
            images: product.images || [],
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Failed to save cart to localStorage', e);
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    cartCount.textContent = totalItems;
}

function showCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    const total = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 0)), 0);

    if (!cart.length) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart</p>
                <button class="btn" onclick="showSection('products')">Continue Shopping</button>
            </div>
        `;
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item" data-product-id="${item._id}">
                <img src="${(item.images && item.images[0]) || 'https://via.placeholder.com/60x60?text=No+Image'}" width="60" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>₹${Number(item.price).toLocaleString()} x ${item.quantity}</p>
                    <div class="quantity-controls">
                        <button class="btn-quantity" data-action="decrease" data-product-id="${item._id}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="btn-quantity" data-action="increase" data-product-id="${item._id}">+</button>
                    </div>
                </div>
                <button class="btn remove-btn" data-product-id="${item._id}">Remove</button>
            </div>
        `).join('');
    }

    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) cartTotal.textContent = total.toLocaleString();
}

function updateQuantity(productId, change) {
    const productIdStr = String(productId);
    const item = cart.find(i => String(i._id) === productIdStr);
    if (!item) return;
    item.quantity = (item.quantity || 0) + change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartCount();
        showCart();
        showNotification(`Quantity updated to ${item.quantity}`);
    }
}

function removeFromCart(productId) {
    const productIdStr = String(productId);
    const idx = cart.findIndex(i => String(i._id) === productIdStr);
    if (idx === -1) return;
    const itemName = cart[idx].name;
    cart.splice(idx, 1);
    saveCart();
    updateCartCount();
    showCart();
    showNotification(`${itemName} removed from cart`);
}

function showCheckout() {
    if (!cart.length) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Simple checkout simulation - just show success message
    const totalAmount = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 0)), 0);
    
    // Clear cart and show success
    cart = [];
    saveCart();
    updateCartCount();
    
    showSection('order-success');
    showNotification(`Order placed successfully! Total: ₹${totalAmount.toLocaleString()}`);
}

// ==================== PRODUCT DISPLAY ====================
function displayProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = (products || []).map(product => {
        const imageSrc = (product.images && product.images[0]) || `https://via.placeholder.com/300x400?text=${encodeURIComponent(product.name || 'Product')}`;
        return `
            <div class="product-card" data-category="${product.category || 'all'}">
                <div class="product-image-container">
                    <img src="${imageSrc}" alt="${product.name || ''}" class="product-image" data-product-image="true" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
                    <div class="product-overlay">
                        <button class="btn view-details-btn" data-product-id="${product._id}">Quick View</button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category-badge">${(product.category || '').charAt(0).toUpperCase() + (product.category || '').slice(1)}</div>
                    <h3 class="product-title">${product.name || ''}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-features">
                        <span class="size-badge">${(product.sizes || []).join(', ')}</span>
                        <span class="color-badge">${(product.colors || []).length} colors</span>
                    </div>
                    <div class="product-price-section">
                        <p class="product-price">₹${Number(product.price || 0).toLocaleString()}</p>
                        <div class="rating">
                            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
                            <span class="rating-text">(4.5)</span>
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="btn add-to-cart-btn" data-product-id="${product._id}">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                        <button class="wishlist-btn" title="Add to Wishlist"><i class="far fa-heart"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterProducts(category) {
    const filtered = (category === 'all') ? allProducts : (allProducts || []).filter(p => p.category === category);
    displayProducts(filtered);
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) btn.classList.add('active');
    });
    const productsSection = document.getElementById('products-section');
    if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== QUICK VIEW FUNCTIONALITY ====================
function showQuickView(productId) {
    const product = allProducts.find(p => String(p._id) === String(productId));
    if (!product) return;
    
    const imageSrc = (product.images && product.images[0]) || `https://via.placeholder.com/400x500?text=${encodeURIComponent(product.name)}`;
    
    // Create quick view modal
    const quickViewModal = document.createElement('div');
    quickViewModal.className = 'quick-view-modal';
    quickViewModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    `;
    
    quickViewModal.innerHTML = `
        <div class="quick-view-content" style="background: white; padding: 2rem; border-radius: 10px; max-width: 800px; width: 100%; position: relative;">
            <button class="close-quick-view" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
                <div>
                    <img src="${imageSrc}" alt="${product.name}" style="width: 100%; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/400x500?text=No+Image'">
                </div>
                <div>
                    <h2 style="margin-bottom: 1rem; color: #333;">${product.name}</h2>
                    <p style="color: #666; margin-bottom: 1rem;">${product.description}</p>
                    <div style="margin-bottom: 1rem;">
                        <strong style="font-size: 1.5rem; color: #b8860b;">₹${Number(product.price).toLocaleString()}</strong>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong>Sizes:</strong> ${(product.sizes || []).join(', ')}
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong>Colors:</strong> ${(product.colors || []).join(', ')}
                    </div>
                    <button class="btn add-to-cart-quick" data-product-id="${product._id}" style="background: #b8860b; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem;">
                        <i class="fas fa-shopping-bag"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(quickViewModal);
    
    // Add event listeners
    quickViewModal.querySelector('.close-quick-view').addEventListener('click', () => {
        document.body.removeChild(quickViewModal);
    });
    
    quickViewModal.querySelector('.add-to-cart-quick').addEventListener('click', () => {
        addToCart(product._id);
        document.body.removeChild(quickViewModal);
    });
    
    // Close on background click
    quickViewModal.addEventListener('click', (e) => {
        if (e.target === quickViewModal) {
            document.body.removeChild(quickViewModal);
        }
    });
}

// ==================== UTILITIES ====================
function showNotification(message) {
    if (!message) return;
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #8B0000; color: white;
        padding: 15px 20px; border-radius: 5px; z-index: 1000; box-shadow: 0 5px 15px rgba(0,0,0,0.3); 
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (!notification.parentNode) return;
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => { if (notification.parentNode) document.body.removeChild(notification); }, 300);
    }, 3000);
}

// ==================== EVENT DELEGATION ====================
function setupEventDelegation() {
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        // Normalize: if icon or element inside button clicked, climb to button
        const btn = target.closest && target.closest('[data-product-id], .add-to-cart-btn, .btn-quantity, .remove-btn, [data-product-image="true"], .view-details-btn');
        if (btn) {
            // add-to-cart
            if (btn.classList && btn.classList.contains('add-to-cart-btn')) {
                addToCart(btn.getAttribute('data-product-id'));
                return;
            }
            
            // quantity controls
            if (btn.classList && btn.classList.contains('btn-quantity')) {
                const productId = btn.getAttribute('data-product-id');
                const action = btn.getAttribute('data-action');
                updateQuantity(productId, action === 'increase' ? 1 : -1);
                return;
            }
            
            // remove from cart
            if (btn.classList && btn.classList.contains('remove-btn')) {
                removeFromCart(btn.getAttribute('data-product-id'));
                return;
            }
            
            // image open modal
            if (btn.hasAttribute && btn.hasAttribute('data-product-image')) {
                openModal(btn);
                return;
            }
            
            // quick view button
            if (btn.classList && btn.classList.contains('view-details-btn')) {
                showQuickView(btn.getAttribute('data-product-id'));
                return;
            }
        }

        // click outside image modal closes
        if (target.id === 'imageModal') closeModal();
    });
}






// ==================== EVENT LISTENER SETUP ====================
function setupEventListeners() {
    // Cart and navigation
    const cartIcon = document.getElementById('cart-icon');
    cartIcon && cartIcon.addEventListener('click', () => showSection('cart'));

    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn && checkoutBtn.addEventListener('click', showCheckout);

    const continueShopping = document.getElementById('continue-shopping');
    continueShopping && continueShopping.addEventListener('click', () => showSection('home'));

    const closeImageModalBtn = document.getElementById('close-image-modal');
    closeImageModalBtn && closeImageModalBtn.addEventListener('click', closeModal);

    // Navigation buttons
    const shopNowBtn = document.getElementById('shop-now-btn');
    shopNowBtn && shopNowBtn.addEventListener('click', () => showSection('products'));

    const ourStoryBtn = document.getElementById('our-story-btn');
    ourStoryBtn && ourStoryBtn.addEventListener('click', () => showSection('about'));

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', function() {
        filterProducts(this.getAttribute('data-category'));
    }));








    // Mobile menu toggle
const mobileToggle = document.getElementById('mobile-toggle');
const nav = document.querySelector('.nav-menu');

// 🟢 Toggle menu open/close
mobileToggle && mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent outside click from triggering
    nav && nav.classList.toggle('active');
});

// 🟢 Close when clicking a nav link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        nav && nav.classList.remove('active');
    });
});

// 🟢 Close when clicking outside the menu
document.addEventListener('click', (e) => {
    if (nav && nav.classList.contains('active') &&
        !nav.contains(e.target) && !mobileToggle.contains(e.target)) {
        nav.classList.remove('active');
    }
});







    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });











    

    // Footer navigation
    document.querySelectorAll('.footer-links a[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    setupEventDelegation();
}

// ==================== INITIALIZATION ====================
function init() {
    // Sample products data
    allProducts = [
        {
            _id: '1', 
            name: 'Navy Blue Silk Kurta', 
            description: 'Premium silk kurta with traditional embroidery and comfortable fit', 
            price: 3499, 
            category: 'kurtas', 
            images: ['uploads/kurta1.jpg'], 
            sizes: ['S', 'M', 'L', 'XL'], 
            colors: ['Navy Blue']
        },
        {
            _id: '2', 
            name: 'White Chikan Kurta', 
            description: 'Handcrafted chikan work with premium cotton fabric', 
            price: 5899, 
            category: 'kurtas', 
            images: ['uploads/kurta2.jpg'], 
            sizes: ['S', 'M', 'L', 'XL'], 
            colors: ['White', 'Off-White']
        },
        {
            _id: '3', 
            name: 'Royal Maroon Sherwani', 
            description: 'Regal sherwani with intricate zari work and silk fabric', 
            price: 10999, 
            category: 'sherwanis', 
            images: ['uploads/shervani.jpg'], 
            sizes: ['M', 'L', 'XL', 'XXL'], 
            colors: ['Maroon', 'Red']
        },
        {
            _id: '4', 
            name: 'Designer Indo-Western Suit', 
            description: 'Contemporary fusion wear blending traditional and modern styles', 
            price: 15399, 
            category: 'modern', 
            images: ['uploads/Indowestern.jpg'], 
            sizes: ['S', 'M', 'L', 'XL'], 
            colors: ['Black', 'Grey', 'Navy']
        },
        {
            _id: '5', 
            name: 'Traditional Dhoti Kurta Set', 
            description: 'Complete traditional attire for festive occasions', 
            price: 4599, 
            category: 'traditional', 
            images: ['uploads/dhotikurta.jpg'], 
            sizes: ['M', 'L', 'XL'], 
            colors: ['White', 'Cream']
        },
        {
            _id: '6', 
            name: 'Embroidered Jodhpuri Suit', 
            description: 'Classic Jodhpuri style with modern embroidery patterns', 
            price: 14999, 
            category: 'modern', 
            images: ['uploads/jodhpuri.jpg'], 
            sizes: ['S', 'M', 'L', 'XL'], 
            colors: ['Blue', 'Black']
        }
    ];

    setupEventListeners();
    displayProducts(allProducts);
    updateCartCount();
    showSection('home');
}

// CSS animations injection
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { 
        from { transform: translateX(300px); opacity: 0; } 
        to { transform: translateX(0); opacity: 1; } 
    }
    @keyframes slideOut { 
        from { transform: translateX(0); opacity: 1; } 
        to { transform: translateX(300px); opacity: 0; } 
    }
    
    .empty-cart {
        text-align: center;
        padding: 3rem 1rem;
        color: #666;
    }
    
    .cart-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .cart-item-details {
        flex: 1;
    }
    
    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .btn-quantity {
        width: 30px;
        height: 30px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .quantity-display {
        padding: 0 1rem;
        font-weight: bold;
    }
    
    .remove-btn {
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .product-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .product-image-container:hover .product-overlay {
        opacity: 1;
    }
    
    .nav-menu.active {
        display: flex !important;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background:black;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);









 document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const messageBox = document.createElement("p");
  messageBox.id = "responseMessage";
  messageBox.style.marginTop = "10px";
  form.appendChild(messageBox);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get values
    const name = e.target[0].value.trim();
    const email = e.target[1].value.trim();
    const message = e.target[2].value.trim();
    const submitBtn = form.querySelector("button");

    // Basic validation
    if (!name || !email || !message) {
      showMessage("⚠️ All fields are required!", "red");
      return;
    }

    // Email format check (simple regex)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showMessage("❌ Please enter a valid email address!", "red");
      return;
    }

    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      const res = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("✅ Message submitted successfully!", "green");
        form.reset(); // clear form
      } else {
        showMessage(data.message || "❌ Submission failed!", "red");
      }
    } catch (err) {
      console.error(err);
      showMessage("🚫 Server not responding. Try again later.", "red");
    } finally {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  });

  // Helper function to show message below form
  function showMessage(text, color) {
    messageBox.textContent = text;
    messageBox.style.color = color;
  }
});
