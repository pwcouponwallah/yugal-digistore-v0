// Yugal Digital Store - Frontend JavaScript

// Configuration
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbwQ0UgP1VKOXYKgdyAW7nu0bZShT5hbPyUO9AWzSqFD-dhLQR7ekB_7cKlXrR9eRCzm2Q/exec'; // Replace with your deployed Apps Script URL
let currentProductId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname.split('/').pop();
  
  // Initialize page-specific functionality
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
  
  // Initialize common features
  initCommonFeatures();
});

// Common features initialization
function initCommonFeatures() {
  // Back to top button
  const backToTopButton = document.getElementById('backToTop');
  if (backToTopButton) {
    window.addEventListener('scroll', function() {
      backToTopButton.style.display = window.pageYOffset > 300 ? 'block' : 'none';
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
      
      fetchAPI('newsletter', 'POST', { email: email })
        .then(data => {
          if (data.success) {
            showAlert('Thank you for subscribing!', 'success');
            this.reset();
          } else {
            showAlert(data.message || 'Subscription failed', 'danger');
          }
        })
        .catch(error => {
          showAlert('Subscription failed. Please try again.', 'danger');
        });
    });
  }
  
  // Rating stars
  document.querySelectorAll('.rating-input i').forEach(star => {
    star.addEventListener('click', function() {
      const rating = parseInt(this.getAttribute('data-rating'));
      const container = this.parentElement;
      const hiddenInput = container.querySelector('#ratingValue');
      
      container.querySelectorAll('i').forEach((s, index) => {
        s.classList.toggle('active', index < rating);
      });
      
      if (hiddenInput) hiddenInput.value = rating;
    });
  });
}

// Home page initialization
function initHomePage() {
  // Load featured products
  fetchAPI('products', 'GET', { type: 'featured' })
    .then(data => {
      if (data.success) {
        renderProducts(data.data.products, '#featuredCarousel .carousel-inner');
      }
    });
  
  // Load trending products
  fetchAPI('products', 'GET', { type: 'trending' })
    .then(data => {
      if (data.success) {
        renderProducts(data.data.products, '#trendingProducts');
      }
    });
}

// Products page initialization
function initProductsPage() {
  // Load all products
  fetchAPI('products', 'GET')
    .then(data => {
      if (data.success) {
        renderProducts(data.data.products, '#productsGrid');
      }
    });
  
  // View toggle buttons
  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('[data-view]').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const grid = document.getElementById('productsGrid');
      grid.classList.toggle('list-view', this.getAttribute('data-view') === 'list');
      
      grid.querySelectorAll('.col-md-6, .col-12').forEach(col => {
        if (this.getAttribute('data-view') === 'list') {
          col.classList.remove('col-md-6', 'col-lg-4');
          col.classList.add('col-12');
        } else {
          col.classList.remove('col-12');
          col.classList.add('col-md-6', 'col-lg-4');
        }
      });
    });
  });
  
  // Filter functionality
  document.getElementById('applyFilters')?.addEventListener('click', applyProductFilters);
  document.getElementById('resetFilters')?.addEventListener('click', resetProductFilters);
}

// Product page initialization
function initProductPage() {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  currentProductId = urlParams.get('id');
  
  if (!currentProductId) {
    window.location.href = 'products.html';
    return;
  }
  
  // Load product details
  fetchAPI('product', 'GET', { id: currentProductId })
    .then(data => {
      if (data.success) {
        renderProductDetails(data.data.product);
      } else {
        window.location.href = 'products.html';
      }
    });
  
  // Load related products
  fetchAPI('products', 'GET', { type: 'trending' })
    .then(data => {
      if (data.success) {
        renderProducts(data.data.products, '#relatedProducts');
      }
    });
  
  // Buy Now buttons
  document.getElementById('buyNowBtn')?.addEventListener('click', handleBuyNow);
  document.getElementById('mobileBuyNowBtn')?.addEventListener('click', handleBuyNow);
  
  // Review form
  document.getElementById('reviewForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    submitReview();
  });
}

// Thank You page initialization
function initThankYouPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');
  
  if (!orderId) {
    window.location.href = 'products.html';
    return;
  }
  
  fetchAPI('download', 'GET', { order_id: orderId })
    .then(data => {
      if (data.success) {
        renderOrderDetails(data.data);
      } else {
        showOrderError(data.message || 'Order not found');
      }
    });
}

// Dashboard page initialization
function initDashboardPage() {
  // Load seller products
  fetchSellerProducts();
  
  // Load seller stats
  fetchSellerStats();
  
  // Product form
  document.getElementById('productForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    submitProductForm();
  });
  
  // Edit/Delete product handlers
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-product')) {
      e.preventDefault();
      const productId = e.target.getAttribute('data-id');
      prepareEditProduct(productId);
    }
    
    if (e.target.classList.contains('delete-product')) {
      e.preventDefault();
      const productId = e.target.getAttribute('data-id');
      document.getElementById('deleteProductId').value = productId;
      $('#deleteProductModal').modal('show');
    }
  });
  
  // Confirm delete
  document.getElementById('confirmDelete')?.addEventListener('click', function() {
    deleteProduct(document.getElementById('deleteProductId').value);
  });
}

// API helper function
function fetchAPI(action, method = 'GET', params = {}) {
  const url = new URL(API_BASE_URL);
  url.searchParams.append('action', action);
  
  if (method === 'GET') {
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    return fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .catch(error => {
        console.error('Fetch error:', error);
        return { success: false, message: 'Network error' };
      });
  } else {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .catch(error => {
      console.error('Fetch error:', error);
      return { success: false, message: 'Network error' };
    });
  }
}

// Render products to a container
function renderProducts(products, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!products || products.length === 0) {
    container.innerHTML = '<div class="col-12 text-center py-5 text-muted">No products found</div>';
    return;
  }
  
  products.forEach(product => {
    const price = parseFloat(product.price).toFixed(2);
    const originalPrice = product.original_price ? parseFloat(product.original_price).toFixed(2) : null;
    
    container.innerHTML += `
      <div class="col-md-6 col-lg-4">
        <div class="card product-card h-100 hover-lift" data-id="${product.id}" data-category="${product.category}" data-price="${price}">
          <img src="${product.image_url}" class="card-img-top" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300'">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">${product.title}</h5>
              <div class="ratings small">
                ${renderStars(product.rating || 0)}
              </div>
            </div>
            <p class="card-text text-muted small">${truncateDescription(product.description)}</p>
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
}

// Helper function to truncate description
function truncateDescription(text, maxLength = 100) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Helper function to render star ratings
function renderStars(rating) {
  rating = parseFloat(rating) || 0;
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<i class="fa fa-star${i <= rating ? ' text-warning' : ''}"></i>`;
  }
  return stars;
}

// Render product details
function renderProductDetails(product) {
  // Basic info
  setElementText('productTitle', product.title);
  setElementText('productDescription', product.description);
  setElementText('productPrice', `$${parseFloat(product.price).toFixed(2)}`);
  setElementText('productCategory', product.category);
  
  // Mobile elements
  setElementText('mobileProductTitle', product.title);
  setElementText('mobileProductPrice', `$${parseFloat(product.price).toFixed(2)}`);
  
  // Images
  const productImages = document.getElementById('productImages');
  if (productImages) {
    productImages.innerHTML = `
      <div class="carousel-item active">
        <div class="ratio ratio-1x1">
          <img src="${product.image_url}" class="d-block w-100" alt="${product.title}" onerror="this.src='https://via.placeholder.com/600'">
        </div>
      </div>
    `;
  }
  
  // Thumbnails
  const thumbnails = document.getElementById('thumbnails');
  if (thumbnails) {
    thumbnails.innerHTML = `
      <div class="col-3">
        <div class="ratio ratio-1x1 cursor-pointer" data-bs-target="#productCarousel" data-bs-slide-to="0">
          <img src="${product.image_url}" class="w-100 h-100 object-fit-cover" alt="Thumbnail" onerror="this.src='https://via.placeholder.com/150'">
        </div>
      </div>
    `;
  }
  
  // Buy Now buttons
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
    `;
  }
  
  // Reviews
  if (product.reviews) {
    renderProductReviews(product.reviews);
    updateRatingStats(product.reviews);
  }
}

// Handle Buy Now click
function handleBuyNow(e) {
  e.preventDefault();
  const topmateUrl = e.currentTarget.getAttribute('data-topmate-url');
  if (topmateUrl) {
    window.location.href = topmateUrl;
  }
}

// Submit review form
function submitReview() {
  const rating = document.getElementById('ratingValue')?.value;
  const title = document.getElementById('reviewTitle')?.value;
  const text = document.getElementById('reviewText')?.value;
  
  if (!rating || !title || !text) {
    showAlert('Please fill all fields and provide a rating.', 'danger');
    return;
  }
  
  fetchAPI('review', 'POST', {
    product_id: currentProductId,
    rating: rating,
    title: title,
    comment: text,
    user_email: 'user@example.com' // In real app, get from auth
  })
  .then(data => {
    if (data.success) {
      showAlert('Thank you for your review!', 'success');
      $('#reviewModal').modal('hide');
      document.getElementById('reviewForm').reset();
      
      // Refresh reviews
      fetchAPI('product', 'GET', { id: currentProductId })
        .then(data => {
          if (data.success && data.data.product.reviews) {
            renderProductReviews(data.data.product.reviews);
            updateRatingStats(data.data.product.reviews);
          }
        });
    } else {
      showAlert(data.message || 'Failed to submit review', 'danger');
    }
  });
}

// Render product reviews
function renderProductReviews(reviews) {
  const reviewsList = document.getElementById('reviewsList');
  if (!reviewsList) return;
  
  reviewsList.innerHTML = '';
  
  if (!reviews || reviews.length === 0) {
    reviewsList.innerHTML = '<p class="text-muted">No reviews yet. Be the first to review!</p>';
    return;
  }
  
  reviews.forEach(review => {
    reviewsList.innerHTML += `
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2">
            <h6 class="mb-0">${review.user_email || 'Anonymous'}</h6>
            <div class="ratings small">
              ${renderStars(review.rating)}
            </div>
          </div>
          <p class="text-muted small mb-2">${review.date ? new Date(review.date).toLocaleDateString() : ''}</p>
          <h6>${review.title || ''}</h6>
          <p>${review.comment || ''}</p>
        </div>
      </div>
    `;
  });
}

// Update rating statistics
function updateRatingStats(reviews) {
  if (!reviews || reviews.length === 0) return;
  
  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const averageRating = (totalRating / reviews.length).toFixed(1);
  
  setElementText('averageRating', averageRating);
  setElementText('totalReviews', `Based on ${reviews.length} reviews`);
  
  // Update star distribution (simplified)
  document.querySelectorAll('.ratings').forEach(el => {
    el.innerHTML = renderStars(averageRating);
  });
}

// Render order details
function renderOrderDetails(orderData) {
  setElementText('orderId', orderData.order_id || 'N/A');
  setElementText('orderProduct', orderData.product_title || 'N/A');
  setElementText('orderPrice', orderData.price ? `$${parseFloat(orderData.price).toFixed(2)}` : 'N/A');
  setElementText('orderDate', orderData.timestamp ? new Date(orderData.timestamp).toLocaleDateString() : 'N/A');
  
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn && orderData.download_url) {
    downloadBtn.href = orderData.download_url;
  }
  
  // Show appropriate status
  const downloadStatus = document.getElementById('downloadStatus');
  const pendingStatus = document.getElementById('pendingStatus');
  
  if (orderData.status === 'completed') {
    downloadStatus?.classList.remove('d-none');
    pendingStatus?.classList.add('d-none');
  } else {
    downloadStatus?.classList.add('d-none');
    pendingStatus?.classList.remove('d-none');
  }
}

// Show order error
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

// Fetch seller products
function fetchSellerProducts() {
  fetchAPI('products', 'GET', { seller_email: 'seller@example.com' }) // In real app, get from auth
    .then(data => {
      if (data.success) {
        renderSellerProducts(data.data.products);
      } else {
        showAlert(data.message || 'Failed to load products', 'danger');
      }
    });
}

// Render seller products
function renderSellerProducts(products) {
  const tableBody = document.querySelector('#productsTable tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (!products || products.length === 0) {
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
            <img src="${product.image_url}" width="50" height="50" class="rounded me-3" alt="${product.title}" onerror="this.src='https://via.placeholder.com/50'">
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
            ${renderStars(product.rating || 0)}
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
}

// Fetch seller stats
function fetchSellerStats() {
  fetchAPI('stats', 'GET', { seller_email: 'seller@example.com' }) // In real app, get from auth
    .then(data => {
      if (data.success) {
        setElementText('totalProducts', data.data.total_products || 0);
        setElementText('totalEarnings', data.data.total_earnings ? `$${parseFloat(data.data.total_earnings).toFixed(2)}` : '$0.00');
        setElementText('totalDownloads', data.data.total_downloads || 0);
      }
    });
}

// Submit product form
function submitProductForm() {
  const form = document.getElementById('productForm');
  const formData = {
    title: form.querySelector('#productTitle').value,
    description: form.querySelector('#productDescription').value,
    price: form.querySelector('#productPrice').value,
    category: form.querySelector('#productCategory').value,
    tags: form.querySelector('#productTags').value,
    image_url: form.querySelector('#productImage').value,
    topmate_url: form.querySelector('#topmateUrl').value,
    file_url: form.querySelector('#fileUrl').value,
    seller_email: 'seller@example.com' // In real app, get from auth
  };
  
  fetchAPI('product', 'POST', formData)
    .then(data => {
      if (data.success) {
        showAlert('Product added successfully!', 'success');
        $('#newProductModal').modal('hide');
        form.reset();
        fetchSellerProducts();
      } else {
        showAlert(data.message || 'Failed to add product', 'danger');
      }
    });
}

// Prepare edit product form
function prepareEditProduct(productId) {
  fetchAPI('product', 'GET', { id: productId })
    .then(data => {
      if (data.success) {
        const product = data.data.product;
        
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductTitle').value = product.title;
        document.getElementById('editProductDescription').value = product.description;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductTags').value = product.tags || '';
        document.getElementById('editProductImage').value = product.image_url;
        document.getElementById('editTopmateUrl').value = product.topmate_url;
        document.getElementById('editFileUrl').value = product.file_url;
        
        $('#editProductModal').modal('show');
      } else {
        showAlert(data.message || 'Failed to load product', 'danger');
      }
    });
}

// Delete product
function deleteProduct(productId) {
  fetchAPI('product', 'DELETE', { id: productId })
    .then(data => {
      if (data.success) {
        showAlert('Product deleted successfully!', 'success');
        $('#deleteProductModal').modal('hide');
        fetchSellerProducts();
      } else {
        showAlert(data.message || 'Failed to delete product', 'danger');
      }
    });
}

// Apply product filters
function applyProductFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const categories = Array.from(document.querySelectorAll('[name="category"]:checked')).map(el => el.value);
  const priceMin = parseFloat(document.getElementById('priceMin').value) || 0;
  const priceMax = parseFloat(document.getElementById('priceMax').value) || Infinity;
  
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
}

// Reset product filters
function resetProductFilters() {
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('[name="category"]').forEach(cb => cb.checked = false);
  document.getElementById('priceMin').value = '';
  document.getElementById('priceMax').value = '';
  
  document.querySelectorAll('.product-card:not(.skeleton)').forEach(product => {
    product.closest('.col').style.display = 'block';
  });
}

// Helper function to set element text
function setElementText(selector, text) {
  const element = document.getElementById(selector);
  if (element) element.textContent = text;
}

// Show alert message
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
