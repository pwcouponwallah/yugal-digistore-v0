// Yugal Digital Store - Complete Google Apps Script Backend

/**
 * Main setup function - run this first to initialize the spreadsheet
 * Creates all necessary sheets and adds sample data
 */
function setupStore() {
  try {
    // Get or create the spreadsheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      spreadsheet = SpreadsheetApp.create('Yugal Digital Store Backend');
    }
    
    // Clear all existing sheets except the first one
    var sheets = spreadsheet.getSheets();
    for (var i = 1; i < sheets.length; i++) {
      spreadsheet.deleteSheet(sheets[i]);
    }
    
    // Create Products sheet
    var productsSheet = spreadsheet.insertSheet('Products');
    productsSheet.appendRow([
      'id', 'title', 'description', 'price', 'category', 
      'image_url', 'topmate_url', 'file_url', 'seller_email', 'timestamp'
    ]);
    
    // Create Orders sheet
    var ordersSheet = spreadsheet.insertSheet('Orders');
    ordersSheet.appendRow([
      'order_id', 'buyer_email', 'product_id', 'payment_status', 
      'download_url', 'timestamp'
    ]);
    
    // Create Reviews sheet
    var reviewsSheet = spreadsheet.insertSheet('Reviews');
    reviewsSheet.appendRow([
      'review_id', 'product_id', 'user_email', 'rating', 
      'comment', 'timestamp'
    ]);
    
    // Create Newsletter sheet
    var newsletterSheet = spreadsheet.insertSheet('Newsletter');
    newsletterSheet.appendRow(['email', 'timestamp']);
    
    // Add sample data
    addSampleData(spreadsheet);
    
    SpreadsheetApp.getUi().alert('Setup complete! Sheets created with sample data.');
  } catch (error) {
    SpreadsheetApp.getUi().alert('Setup failed: ' + error.message);
  }
}

/**
 * Adds sample data to the sheets for testing
 */
function addSampleData(spreadsheet) {
  var productsSheet = spreadsheet.getSheetByName('Products');
  var ordersSheet = spreadsheet.getSheetByName('Orders');
  var reviewsSheet = spreadsheet.getSheetByName('Reviews');
  var newsletterSheet = spreadsheet.getSheetByName('Newsletter');
  
  var timestamp = new Date();
  
  // Sample products
  var sampleProducts = [
    [
      'PROD-1001',
      'eBook: Digital Marketing Guide',
      'Comprehensive guide to digital marketing strategies for 2023',
      24.99,
      'eBooks',
      'https://via.placeholder.com/300?text=Digital+Marketing+eBook',
      'https://topmate.io/sample_product_1',
      'https://drive.google.com/file/d/sample1/view',
      'seller1@example.com',
      timestamp
    ],
    [
      'PROD-1002',
      'Resume Template Pack',
      'Professional resume templates in Word and PDF formats',
      14.99,
      'Templates',
      'https://via.placeholder.com/300?text=Resume+Templates',
      'https://topmate.io/sample_product_2',
      'https://drive.google.com/file/d/sample2/view',
      'seller2@example.com',
      timestamp
    ],
    [
      'PROD-1003',
      'Photoshop Actions Bundle',
      'Collection of 50 premium Photoshop actions for photographers',
      19.99,
      'Graphics',
      'https://via.placeholder.com/300?text=Photoshop+Actions',
      'https://topmate.io/sample_product_3',
      'https://drive.google.com/file/d/sample3/view',
      'seller1@example.com',
      timestamp
    ]
  ];
  
  // Add sample products
  sampleProducts.forEach(function(product) {
    productsSheet.appendRow(product);
  });
  
  // Sample orders
  var sampleOrders = [
    [
      'ORD-5001',
      'customer1@example.com',
      'PROD-1001',
      'completed',
      'https://drive.google.com/file/d/sample1/view',
      timestamp
    ],
    [
      'ORD-5002',
      'customer2@example.com',
      'PROD-1002',
      'pending',
      'https://drive.google.com/file/d/sample2/view',
      timestamp
    ]
  ];
  
  // Add sample orders
  sampleOrders.forEach(function(order) {
    ordersSheet.appendRow(order);
  });
  
  // Sample reviews
  var sampleReviews = [
    [
      'REV-9001',
      'PROD-1001',
      'customer1@example.com',
      5,
      'Excellent guide! Very comprehensive and up-to-date.',
      timestamp
    ],
    [
      'REV-9002',
      'PROD-1001',
      'customer3@example.com',
      4,
      'Good content but could use more examples.',
      timestamp
    ]
  ];
  
  // Add sample reviews
  sampleReviews.forEach(function(review) {
    reviewsSheet.appendRow(review);
  });
  
  // Sample newsletter subscriptions
  var sampleNewsletters = [
    ['customer1@example.com', timestamp],
    ['customer2@example.com', timestamp]
  ];
  
  // Add sample newsletter emails
  sampleNewsletters.forEach(function(email) {
    newsletterSheet.appendRow(email);
  });
}

/**
 * Main function to handle GET requests
 */
function doGet(e) {
  // Validate request
  if (!e || !e.parameter) {
    return createErrorResponse('Invalid request parameters');
  }
  
  var action = e.parameter.action;
  if (!action) {
    return createErrorResponse('Action parameter is required');
  }
  
  try {
    switch(action.toLowerCase()) {
      case 'products':
        return handleGetProducts(e.parameter);
      case 'product':
        return handleGetProduct(e.parameter);
      case 'order':
        return handleGetOrder(e.parameter);
      case 'download':
        return handleValidateDownload(e.parameter);
      case 'stats':
        return handleGetStats(e.parameter);
      default:
        return createErrorResponse('Invalid action: ' + action);
    }
  } catch (error) {
    return createErrorResponse(error.message);
  }
}

/**
 * Main function to handle POST requests
 */
function doPost(e) {
  // Validate request
  if (!e || !e.postData || !e.postData.contents) {
    return createErrorResponse('Invalid request data');
  }
  
  var action = e.parameter.action;
  if (!action) {
    return createErrorResponse('Action parameter is required');
  }
  
  try {
    var data = JSON.parse(e.postData.contents);
    
    switch(action.toLowerCase()) {
      case 'order':
        return handleRecordOrder(data);
      case 'product':
        return handleAddProduct(data);
      case 'review':
        return handleAddReview(data);
      case 'newsletter':
        return handleAddToNewsletter(data);
      default:
        return createErrorResponse('Invalid action: ' + action);
    }
  } catch (error) {
    return createErrorResponse(error.message);
  }
}

/**
 * Handles GET /products request
 */
function handleGetProducts(params) {
  var spreadsheet = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
  var sheet = spreadsheet.getSheetByName('Products');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var products = [];
  
  // Convert rows to objects
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var product = {};
    
    for (var j = 0; j < headers.length; j++) {
      product[headers[j]] = row[j];
    }
    
    // Apply filters if provided
    var include = true;
    
    if (params.type === 'featured') {
      include = i <= 3; // Return first 3 as featured
    } else if (params.type === 'trending') {
      include = i <= 3; // Return first 3 as trending
    } else if (params.type === 'seller' && params.seller_email) {
      include = product.seller_email === params.seller_email;
    }
    
    if (include) {
      // Add rating data
      product.rating = getAverageRating(product.id);
      products.push(product);
    }
  }
  
  return createSuccessResponse({ products: products });
}

/**
 * Handles GET /product request
 */
function handleGetProduct(params) {
  if (!params.id) {
    return createErrorResponse('Product ID is required');
  }
  
  var spreadsheet = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
  var sheet = spreadsheet.getSheetByName('Products');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == params.id) {
      var product = {};
      for (var j = 0; j < headers.length; j++) {
        product[headers[j]] = data[i][j];
      }
      
      // Add rating data
      product.rating = getAverageRating(params.id);
      product.reviews = getProductReviews(params.id);
      
      return createSuccessResponse({ product: product });
    }
  }
  
  return createErrorResponse('Product not found');
}

/**
 * Handles GET /order request
 */
function handleGetOrder(params) {
  if (!params.id) {
    return createErrorResponse('Order ID is required');
  }
  
  var spreadsheet = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
  var sheet = spreadsheet.getSheetByName('Orders');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == params.id) {
      var order = {};
      for (var j = 0; j < headers.length; j++) {
        order[headers[j]] = data[i][j];
      }
      
      // Get product details
      var productResponse = handleGetProduct({ id: order.product_id });
      if (productResponse.success) {
        order.product_title = productResponse.data.product.title;
        order.price = productResponse.data.product.price;
      }
      
      return createSuccessResponse({ order: order });
    }
  }
  
  return createErrorResponse('Order not found');
}

/**
 * Handles GET /download request
 */
function handleValidateDownload(params) {
  if (!params.order_id) {
    return createErrorResponse('Order ID is required');
  }
  
  var orderResponse = handleGetOrder({ id: params.order_id });
  if (!orderResponse.success) {
    return orderResponse;
  }
  
  var order = orderResponse.data.order;
  
  // In a real app, you would verify payment status
  if (order.payment_status !== 'completed') {
    return createErrorResponse('Payment not completed');
  }
  
  return createSuccessResponse({ 
    download_url: order.download_url,
    status: order.payment_status
  });
}

/**
 * Handles GET /stats request
 */
function handleGetStats(params) {
  if (!params.seller_email) {
    return createErrorResponse('Seller email is required');
  }
  
  var spreadsheet = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
  
  // Get total products
  var productsSheet = spreadsheet.getSheetByName('Products');
  var productsData = productsSheet.getDataRange().getValues();
  var totalProducts = 0;
  var totalEarnings = 0;
  
  for (var i = 1; i < productsData.length; i++) {
    if (productsData[i][8] === params.seller_email) { // seller_email column
      totalProducts++;
    }
  }
  
  // Get total orders and earnings
  var ordersSheet = spreadsheet.getSheetByName('Orders');
  var ordersData = ordersSheet.getDataRange().getValues();
  var productIds = [];
  
  for (var i = 1; i < ordersData.length; i++) {
    productIds.push(ordersData[i][2]); // product_id column
  }
  
  // Calculate earnings by matching product IDs with seller's products
  for (var i = 1; i < productsData.length; i++) {
    if (productsData[i][8] === params.seller_email) {
      var productId = productsData[i][0];
      var productPrice = parseFloat(productsData[i][3]);
      var productSales = productIds.filter(id => id === productId).length;
      totalEarnings += productSales * productPrice;
    }
  }
  
  // Get total downloads (simplified - in real app you'd track downloads separately)
  var totalDownloads = productIds.length;
  
  return createSuccessResponse({
    total_products: totalProducts,
    total_earnings: totalEarnings,
    total_downloads: totalDownloads
  });
}

/**
 * Handles POST /order request
 */
function handleRecordOrder(data) {
  if (!data.product_id || !data.buyer_email) {
    return createErrorResponse('Product ID and buyer email are required');
  }
  
  var spreadsheet = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
  var ordersSheet = spreadsheet.getSheetByName('Orders');
  
  // Generate order ID
  var orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
  var timestamp = new Date();
  
  // Get product details
  var productResponse = handleGetProduct({ id: data.product_id });
  if (!productResponse.success) {
    return productResponse;
  }
  
  var product = productResponse.data.product;
  
  // Add order to sheet
  ordersSheet.appendRow([
    orderId,
    data.buyer_email,
    data.product_id,
    'pending', // initial payment status
    product.file_url,
    timestamp
  ]);
  
  return createSuccessResponse({ 
    order_id: orderId,
    download_url: product.file_url
  });
}

/**
 * Handles POST /product request
 */
function handleAddProduct(data) {
  var requiredFields = ['title', 'description', 'price', 'category', 
                       'image_url', 'topmate_url', 'file_url', 'seller_email'];
  
  for (var i = 0; i < requiredFields.length; i++) {
    if (!data[requiredFields[i]]) {
      return createErrorResponse(requiredFields[i] + ' is required');
    }
  }
  
  var spreadsheet = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
  var productsSheet = spreadsheet.getSheetByName('Products');
  
  // Generate product ID
  var productId = 'PROD-' + Math.floor(Math.random() * 1000000);
  var timestamp = new Date();
  
  // Add product to sheet
  productsSheet.appendRow([
    productId,
    data.title,
    data.description,
    parseFloat(data.price),
    data.category,
    data.image_url,
    data.topmate_url,
    data.file_url,
    data.seller_email,
    timestamp
  ]);
  
  return createSuccessResponse({ product_id: productId });
}

/**
 * Handles POST /review request
 */
function handleAddReview(data) {
  if (!data.product_id || !data.user_email || !data.rating || !data.comment) {
    return createErrorResponse('All review fields are required');
  }
  
  if (data.rating < 1 || data.rating > 5) {
    return createErrorResponse('Rating must be between 1 and 5');
  }
  
  var spreadsheet = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
  var reviewsSheet = spreadsheet.getSheetByName('Reviews');
  
  // Generate review ID
  var reviewId = 'REV-' + Math.floor(Math.random() * 1000000);
  var timestamp = new Date();
  
  // Add review to sheet
  reviewsSheet.appendRow([
    reviewId,
    data.product_id,
    data.user_email,
    parseInt(data.rating),
    data.comment,
    timestamp
  ]);
  
  return createSuccessResponse({ review_id: reviewId });
}

/**
 * Handles POST /newsletter request
 */
function handleAddToNewsletter(data) {
  if (!data.email) {
    return createErrorResponse('Email is required');
  }
  
  // Simple email validation
  if (!data.email.includes('@') || !data.email.includes('.')) {
    return createErrorResponse('Invalid email format');
  }
  
  var spreadsheet = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
  var newsletterSheet = spreadsheet.getSheetByName('Newsletter');
  var data = newsletterSheet.getDataRange().getValues();
  
  // Check if email already exists
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === data.email) {
      return createErrorResponse('Email already subscribed');
    }
  }
  
  // Add email to sheet
  newsletterSheet.appendRow([data.email, new Date()]);
  return createSuccessResponse({ subscribed: true });
}

/**
 * Helper function to get average rating for a product
 */
function getAverageRating(productId) {
  var spreadsheet = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
  var sheet = spreadsheet.getSheetByName('Reviews');
  var data = sheet.getDataRange().getValues();
  
  var total = 0;
  var count = 0;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === productId) {
      total += parseInt(data[i][3]);
      count++;
    }
  }
  
  return count > 0 ? (total / count).toFixed(1) : 0;
}

/**
 * Helper function to get reviews for a product
 */
function getProductReviews(productId) {
  var spreadsheet = SpreadsheetApp.openById(SpreadsheetApp.getActiveSpreadsheet().getId());
  var sheet = spreadsheet.getSheetByName('Reviews');
  var data = sheet.getDataRange().getValues();
  var reviews = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === productId) {
      reviews.push({
        user_email: data[i][2],
        rating: parseInt(data[i][3]),
        comment: data[i][4],
        date: data[i][5]
      });
    }
  }
  
  return reviews;
}

/**
 * Creates a success response
 */
function createSuccessResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data || {}
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Creates an error response
 */
function createErrorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: message || 'An error occurred'
  })).setMimeType(ContentService.MimeType.JSON);
}
