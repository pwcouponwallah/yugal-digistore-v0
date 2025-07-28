// Yugal Digital Store - Main JavaScript File

// Global Variables
const API_BASE_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'; // Replace with your deployed Apps Script URL
let currentProductId = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize based on current page
    const path = window.location.pathname.split('/').pop();
    
    if (path === 'index.html' || path === '') {
        initHomePage();
    } else if (path === 'products.html') {
        initProductsPage();
    } else if (path === 'product.html') {
        initProductPage();
    } else if (path === 'thank-you.html') {
        initThankYouPage();
    } else if (path === 'dashboard.html') {
        initDashboardPage();
    }
    
    // Common initializations
    initCommonFeatures();
});

// Common Features
function initCommonFeatures() {
    // Back to top button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
        
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Simulate API call
            fetch(`${API_BASE_URL}?action=newsletter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Success! Thank you for subscribing.', 'success');
                    newsletterForm.reset();
                } else {
                    showAlert('Error subscribing. Please try again.', 'danger');
                }
            })
            .catch(error => {
                showAlert('Error subscribing. Please try again.', 'danger');
                console.error('Error:', error);
            });
        });
    }
    
    // Rating stars
    const ratingInputs = document.querySelectorAll('.rating-input i');
    ratingInputs.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            const container = this.parentElement;
            const hiddenInput = container.querySelector('#ratingValue');
            
            // Set active class and value
            container.querySelectorAll('i').forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            
            if (hiddenInput) {
                hiddenInput.value = rating;
            }
        });
    });
}

// Home Page
function initHomePage() {
    // Fetch featured products
    fetchProducts('featured', '#featuredCarousel .carousel-inner');
    
    // Fetch trending products
    fetchProducts('trending', '#trendingProducts');
    
    // Initialize carousel
    const carousel = new bootstrap.Carousel(document.getElementById('featuredCarousel'), {
        interval: 5000,
        wrap: true
    });
}

// Products Page
function initProductsPage() {
    // Fetch all products
    fetchProducts('all', '#productsGrid');
    
    // View toggle buttons
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            const grid = document.getElementById('productsGrid');
            
            if (view === 'list') {
                grid.classList.add('list-view');
                grid.querySelectorAll('.col-md-6').forEach(col => {
                    col.classList.remove('col-md-6', 'col-lg-4');
                    col.classList.add('col-12');
                });
            } else {
                grid.classList.remove('list-view');
                grid.querySelectorAll('.col-12').forEach(col => {
                    col.classList.remove('col-12');
                    col.classList.add('col-md-6', 'col-lg-4');
                });
            }
        });
    });
    
    // Filter products
    const applyFilters = document.getElementById('applyFilters');
    if (applyFilters) {
        applyFilters.addEventListener('click', function() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const categories = Array.from(document.querySelectorAll('[name="category"]:checked')).map(el => el.value);
            const priceMin = parseFloat(document.getElementById('priceMin').value) || 0;
            const priceMax = parseFloat(document.getElementById('priceMax').value) || Infinity;
            
            // Filter products (this would normally be done via API)
            const products = document.querySelectorAll('.product-card:not(.skeleton)');
            
            products.forEach(product => {
                const title = product.querySelector('.card-title').textContent.toLowerCase();
                const category = product.getAttribute('data-category');
                const price = parseFloat(product.getAttribute('data-price'));
                
                const matchesSearch = title.includes(searchTerm) || searchTerm === '';
                const matchesCategory = categories.length === 0 || categories.includes(category);
                const matchesPrice = price >= priceMin && price <= priceMax;
                
                if (matchesSearch && matchesCategory && matchesPrice) {
                    product.closest('.col').style.display = 'block';
                } else {
                    product.closest('.col').style.display = 'none';
                }
            });
        });
    }
    
    // Reset filters
    const resetFilters = document.getElementById('resetFilters');
    if (resetFilters) {
        resetFilters.addEventListener('click', function() {
            document.getElementById('searchInput').value = '';
            document.querySelectorAll('[name="category"]').forEach(cb => cb.checked = false);
            document.getElementById('priceMin').value = '';
            document.getElementById('priceMax').value = '';
            
            document.querySelectorAll('.product-card:not(.skeleton)').forEach(product => {
                product.closest('.col').style.display = 'block';
            });
        });
    }
}

// Product Page
function initProductPage() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentProductId = urlParams.get('id');
    
    if (!currentProductId) {
        window.location.href = 'products.html';
        return;
    }
    
    // Fetch product details
    fetchProductDetails(currentProductId);
    
    // Fetch related products
    fetchProducts('related', '#relatedProducts');
    
    // Buy Now button
    const buyNowBtn = document.getElementById('buyNowBtn');
    const mobileBuyNowBtn = document.getElementById('mobileBuyNowBtn');
    
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const topmateUrl = this.getAttribute('data-topmate-url');
            if (topmateUrl) {
                window.location.href = topmateUrl;
            }
        });
    }
    
    if (mobileBuyNowBtn) {
        mobileBuyNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const topmateUrl = this.getAttribute('data-topmate-url');
            if (topmateUrl) {
                window.location.href = topmateUrl;
            }
        });
    }
    
    // Review form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const rating = document.getElementById('ratingValue').value;
            const title = document.getElementById('reviewTitle').value;
            const text = document.getElementById('reviewText').value;
            
            if (!rating || !title || !text) {
                showAlert('Please fill all fields and provide a rating.', 'danger');
                return;
            }
            
            // Simulate API call
            fetch(`${API_BASE_URL}?action=review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: currentProductId,
                    rating: rating,
                    title: title,
                    text: text,
                    user_email: 'user@example.com' // In a real app, get from auth
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Thank you for your review!', 'success');
                    $('#reviewModal').modal('hide');
                    reviewForm.reset();
                    // Refresh reviews
                    fetchProductReviews(currentProductId);
                } else {
                    showAlert('Error submitting review. Please try again.', 'danger');
                }
            })
            .catch(error => {
                showAlert('Error submitting review. Please try again.', 'danger');
                console.error('Error:', error);
            });
        });
    }
}

// Thank You Page
function initThankYouPage() {
    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (!orderId) {
        window.location.href = 'products.html';
        return;
    }
    
    // Fetch order details
    fetchOrderDetails(orderId);
}

// Dashboard Page
function initDashboardPage() {
    // Fetch seller products
    fetchSellerProducts();
    
    // Fetch seller stats
    fetchSellerStats();
    
    // New product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productData = {
                title: document.getElementById('productTitle').value,
                description: document.getElementById('productDescription').value,
                price: parseFloat(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value,
                tags: document.getElementById('productTags').value,
                image_url: document.getElementById('productImage').value,
                topmate_url: document.getElementById('topmateUrl').value,
                file_url: document.getElementById('fileUrl').value,
                seller_email: 'seller@example.com' // In a real app, get from auth
            };
            
            // Simulate API call
            fetch(`${API_BASE_URL}?action=product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Product added successfully!', 'success');
                    $('#newProductModal').modal('hide');
                    productForm.reset();
                    // Refresh products list
                    fetchSellerProducts();
                } else {
                    showAlert('Error adding product. Please try again.', 'danger');
                }
            })
            .catch(error => {
                showAlert('Error adding product. Please try again.', 'danger');
                console.error('Error:', error);
            });
        });
    }
    
    // Edit product form
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productId = document.getElementById('editProductId').value;
            const productData = {
                id: productId,
                title: document.getElementById('editProductTitle').value,
                description: document.getElementById('editProductDescription').value,
                price: parseFloat(document.getElementById('editProductPrice').value),
                category: document.getElementById('editProductCategory').value,
                tags: document.getElementById('editProductTags').value,
                image_url: document.getElementById('editProductImage').value,
                topmate_url: document.getElementById('editTopmateUrl').value,
                file_url: document.getElementById('editFileUrl').value
            };
            
            // Simulate API call
            fetch(`${API_BASE_URL}?action=product`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Product updated successfully!', 'success');
                    $('#editProductModal').modal('hide');
                    // Refresh products list
                    fetchSellerProducts();
                } else {
                    showAlert('Error updating product. Please try again.', 'danger');
                }
            })
            .catch(error => {
                showAlert('Error updating product. Please try again.', 'danger');
                console.error('Error:', error);
            });
        });
    }
    
    // Delete product
    const confirmDelete = document.getElementById('confirmDelete');
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function() {
            const productId = document.getElementById('deleteProductId').value;
            
            // Simulate API call
            fetch(`${API_BASE_URL}?action=product&id=${productId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Product deleted successfully!', 'success');
                    $('#deleteProductModal').modal('hide');
                    // Refresh products list
                    fetchSellerProducts();
                } else {
                    showAlert('Error deleting product. Please try again.', 'danger');
                }
            })
            .catch(error => {
                showAlert('Error deleting product. Please try again.', 'danger');
                console.error('Error:', error);
            });
        });
    }
}

// Helper Functions
function fetchProducts(type, containerSelector) {
    const container = document.querySelector(containerSelector);
    
    // Show skeleton loading
    if (container) {
        container.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            container.innerHTML += `
                <div class="col-md-6 col-lg-4">
                    <div class="card product-card skeleton">
                        <div class="card-img-top skeleton-img"></div>
                        <div class="card-body">
                            <h5 class="card-title skeleton-text"></h5>
                            <p class="card-text skeleton-text"></p>
                            <div class="skeleton-text"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Simulate API call
    fetch(`${API_BASE_URL}?action=products&type=${type}`)
    .then(response => response.json())
    .then(data => {
        if (data.success && data.products) {
            renderProducts(data.products, containerSelector);
        } else {
            showAlert('Error loading products. Please try again.', 'danger');
        }
    })
    .catch(error => {
        showAlert('Error loading products. Please try again.', 'danger');
        console.error('Error:', error);
    });
}

function renderProducts(products, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    container.innerHTML = '';
    
    products.forEach(product => {
        const price = parseFloat(product.price).toFixed(2);
        const originalPrice = product.original_price ? parseFloat(product.original_price).toFixed(2) : null;
        
        container.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card product-card h-100 hover-lift" data-id="${product.id}" data-category="${product.category}" data-price="${price}">
                    <img src="${product.image_url}" class="card-img-top" alt="${product.title}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${product.title}</h5>
                            <div class="ratings small">
                                <i class="fa fa-star${product.rating >= 1 ? ' text-warning' : ''}"></i>
                                <i class="fa fa-star${product.rating >= 2 ? ' text-warning' : ''}"></i>
                                <i class="fa fa-star${product.rating >= 3 ? ' text-warning' : ''}"></i>
                                <i class="fa fa-star${product.rating >= 4 ? ' text-warning' : ''}"></i>
                                <i class="fa fa-star${product.rating >= 5 ? ' text-warning' : ''}"></i>
                            </div>
                        </div>
                        <p class="card-text text-muted small">${product.description.substring(0, 100)}...</p>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="fw-bold text-emerald">$${price}</span>
                                ${originalPrice ? `<span class="text-decoration-line-through text-muted small ms-2">$${originalPrice}</span>` : ''}
                            </div>
                            <a href="product.html?id=${product.id}" class="btn btn-sm btn-outline-emerald">View</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Add event listeners to product cards
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function() {
            window.location.href = `product.html?id=${this.getAttribute('data-id')}`;
        });
    });
}

function fetchProductDetails(productId) {
    // Show skeleton loading
    const elementsToSkeleton = [
        '#productTitle', '#productDescription', '#productPrice', 
        '#originalPrice', '#productFormat', '#downloadCount',
        '#publishDate', '#productTags', '#fullDescription'
    ];
    
    elementsToSkeleton.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
            el.classList.add('skeleton-text');
            el.innerHTML = '';
        }
    });
    
    // Simulate API call
    fetch(`${API_BASE_URL}?action=product&id=${productId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success && data.product) {
            renderProductDetails(data.product);
            fetchProductReviews(productId);
        } else {
            showAlert('Error loading product details. Please try again.', 'danger');
            window.location.href = 'products.html';
        }
    })
    .catch(error => {
        showAlert('Error loading product details. Please try again.', 'danger');
        console.error('Error:', error);
        window.location.href = 'products.html';
    });
}

function renderProductDetails(product) {
    // Basic info
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productPrice').textContent = `$${parseFloat(product.price).toFixed(2)}`;
    document.getElementById('productCategory').textContent = product.category;
    
    // Mobile elements
    if (document.getElementById('mobileProductTitle')) {
        document.getElementById('mobileProductTitle').textContent = product.title;
        document.getElementById('mobileProductPrice').textContent = `$${parseFloat(product.price).toFixed(2)}`;
    }
    
    // Images
    const productImages = document.getElementById('productImages');
    if (productImages) {
        productImages.innerHTML = `
            <div class="carousel-item active">
                <div class="ratio ratio-1x1">
                    <img src="${product.image_url}" class="d-block w-100" alt="${product.title}">
                </div>
            </div>
        `;
        
        // Add thumbnails (in a real app, you might have multiple images)
        const thumbnails = document.getElementById('thumbnails');
        if (thumbnails) {
            thumbnails.innerHTML = `
                <div class="col-3">
                    <div class="ratio ratio-1x1 cursor-pointer" data-bs-target="#productCarousel" data-bs-slide-to="0">
                        <img src="${product.image_url}" class="w-100 h-100 object-fit-cover" alt="Thumbnail">
                    </div>
                </div>
            `;
        }
    }
    
    // Buy Now button
    const buyNowBtn = document.getElementById('buyNowBtn');
    const mobileBuyNowBtn = document.getElementById('mobileBuyNowBtn');
    
    if (buyNowBtn) {
        buyNowBtn.setAttribute('data-topmate-url', product.topmate_url);
        buyNowBtn.href = product.topmate_url;
    }
    
    if (mobileBuyNowBtn) {
        mobileBuyNowBtn.setAttribute('data-topmate-url', product.topmate_url);
        mobileBuyNowBtn.href = product.topmate_url;
    }
    
    // Full description
    const fullDescription = document.getElementById('fullDescription');
    if (fullDescription) {
        fullDescription.innerHTML = `
            <p>${product.description}</p>
            <h5>What's Included</h5>
            <ul>
                <li>High-quality digital file in multiple formats</li>
                <li>Lifetime updates</li>
                <li>24/7 customer support</li>
            </ul>
            <h5>How to Use</h5>
            <p>After purchase, you'll receive instant access to download the files. Simply open the files with the appropriate software and start customizing!</p>
        `;
    }
    
    // Remove skeleton loading
    const elementsToRemoveSkeleton = [
        '#productTitle', '#productDescription', '#productPrice', 
        '#originalPrice', '#productFormat', '#downloadCount',
        '#publishDate', '#productTags', '#fullDescription'
    ];
    
    elementsToRemoveSkeleton.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
            el.classList.remove('skeleton-text');
        }
    });
}

function fetchProductReviews(productId) {
    // Simulate API call
    fetch(`${API_BASE_URL}?action=reviews&product_id=${productId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success && data.reviews) {
            renderProductReviews(data.reviews);
        }
    })
    .catch(error => {
        console.error('Error loading reviews:', error);
    });
}

function renderProductReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    reviewsList.innerHTML = '';
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-muted">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    reviews.forEach(review => {
        reviewsList.innerHTML += `
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                        <h6 class="mb-0">${review.user_name || 'Anonymous'}</h6>
                        <div class="ratings small">
                            <i class="fa fa-star${review.rating >= 1 ? ' text-warning' : ''}"></i>
                            <i class="fa fa-star${review.rating >= 2 ? ' text-warning' : ''}"></i>
                            <i class="fa fa-star${review.rating >= 3 ? ' text-warning' : ''}"></i>
                            <i class="fa fa-star${review.rating >= 4 ? ' text-warning' : ''}"></i>
                            <i class="fa fa-star${review.rating >= 5 ? ' text-warning' : ''}"></i>
                        </div>
                    </div>
                    <p class="text-muted small mb-2">${review.date}</p>
                    <h6>${review.title}</h6>
                    <p>${review.text}</p>
                </div>
            </div>
        `;
    });
}

function fetchOrderDetails(orderId) {
    // Simulate API call
    fetch(`${API_BASE_URL}?action=order&id=${orderId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success && data.order) {
            renderOrderDetails(data.order);
        } else {
            showOrderError('Order not found or payment pending.');
        }
    })
    .catch(error => {
        showOrderError('Error loading order details.');
        console.error('Error:', error);
    });
}

function renderOrderDetails(order) {
    document.getElementById('orderId').textContent = order.id;
    document.getElementById('orderProduct').textContent = order.product_title;
    document.getElementById('orderPrice').textContent = `$${parseFloat(order.price).toFixed(2)}`;
    document.getElementById('orderDate').textContent = new Date(order.date).toLocaleDateString();
    
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.href = order.download_url;
    }
    
    // Show appropriate status
    if (order.status === 'completed') {
        document.getElementById('downloadStatus').classList.remove('d-none');
        document.getElementById('pendingStatus').classList.add('d-none');
    } else {
        document.getElementById('downloadStatus').classList.add('d-none');
        document.getElementById('pendingStatus').classList.remove('d-none');
    }
}

function showOrderError(message) {
    const downloadStatus = document.getElementById('downloadStatus');
    if (downloadStatus) {
        downloadStatus.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i> ${message}
            </div>
            <a href="products.html" class="btn btn-emerald mt-3">Browse Products</a>
        `;
    }
}

function fetchSellerProducts() {
    // Simulate API call (in a real app, you'd filter by seller)
    fetch(`${API_BASE_URL}?action=products&type=seller&seller_email=seller@example.com`)
    .then(response => response.json())
    .then(data => {
        if (data.success && data.products) {
            renderSellerProducts(data.products);
        } else {
            showAlert('Error loading your products. Please try again.', 'danger');
        }
    })
    .catch(error => {
        showAlert('Error loading your products. Please try again.', 'danger');
        console.error('Error:', error);
    });
}

function renderSellerProducts(products) {
    const tableBody = document.querySelector('#productsTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    You haven't added any products yet. Click "Add Product" to get started.
                </td>
            </tr>
        `;
        return;
    }
    
    products.forEach(product => {
        const price = parseFloat(product.price).toFixed(2);
        
        tableBody.innerHTML += `
            <tr data-id="${product.id}">
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${product.image_url}" width="50" height="50" class="rounded me-3" alt="${product.title}">
                        <div>
                            <h6 class="mb-0">${product.title}</h6>
                            <small class="text-muted">${product.category}</small>
                        </div>
                    </div>
                </td>
                <td>$${price}</td>
                <td>${product.sales || 0}</td>
                <td>
                    <div class="ratings small">
                        <i class="fa fa-star${product.rating >= 1 ? ' text-warning' : ''}"></i>
                        <i class="fa fa-star${product.rating >= 2 ? ' text-warning' : ''}"></i>
                        <i class="fa fa-star${product.rating >= 3 ? ' text-warning' : ''}"></i>
                        <i class="fa fa-star${product.rating >= 4 ? ' text-warning' : ''}"></i>
                        <i class="fa fa-star${product.rating >= 5 ? ' text-warning' : ''}"></i>
                    </div>
                </td>
                <td><span class="badge bg-success">Published</span></td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Actions
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="product.html?id=${product.id}" target="_blank">View</a></li>
                            <li><a class="dropdown-item edit-product" href="#" data-id="${product.id}">Edit</a></li>
                            <li><a class="dropdown-item delete-product" href="#" data-id="${product.id}">Delete</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    });
    
    // Add event listeners for edit/delete
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            // In a real app, you'd fetch the product details
            const product = {
                id: productId,
                title: `Product ${productId}`,
                description: 'Sample product description',
                price: '19.99',
                category: 'eBooks',
                tags: 'ebook, guide',
                image_url: 'https://via.placeholder.com/300',
                topmate_url: 'https://topmate.io/product',
                file_url: 'https://drive.google.com/file'
            };
            
            // Populate edit form
            document.getElementById('editProductId').value = product.id;
            document.getElementById('editProductTitle').value = product.title;
            document.getElementById('editProductDescription').value = product.description;
            document.getElementById('editProductPrice').value = product.price;
            document.getElementById('editProductCategory').value = product.category;
            document.getElementById('editProductTags').value = product.tags;
            document.getElementById('editProductImage').value = product.image_url;
            document.getElementById('editTopmateUrl').value = product.topmate_url;
            document.getElementById('editFileUrl').value = product.file_url;
            
            // Show modal
            $('#editProductModal').modal('show');
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            document.getElementById('deleteProductId').value = productId;
            $('#deleteProductModal').modal('show');
        });
    });
}

function fetchSellerStats() {
    // Simulate API call
    fetch(`${API_BASE_URL}?action=stats&seller_email=seller@example.com`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('totalProducts').textContent = data.total_products || 0;
            document.getElementById('totalEarnings').textContent = `$${(data.total_earnings || 0).toFixed(2)}`;
            document.getElementById('totalDownloads').textContent = data.total_downloads || 0;
        }
    })
    .catch(error => {
        console.error('Error loading stats:', error);
    });
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Prepend to body or a specific container
    document.body.prepend(alert);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
    }, 5000);
}
