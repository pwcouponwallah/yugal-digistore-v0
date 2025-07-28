// Yugal Digital Store - Complete Error-Free Backend

/**
 * Main setup function - creates all sheets and sample data
 */
function setupStore() {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      spreadsheet = SpreadsheetApp.create('YugalDigitalStore');
    }
    
    // Clear existing sheets except the first one
    var sheets = spreadsheet.getSheets();
    for (var i = 1; i < sheets.length; i++) {
      spreadsheet.deleteSheet(sheets[i]);
    }
    
    // Create Products sheet with headers
    var productsSheet = spreadsheet.insertSheet('Products');
    productsSheet.getRange(1, 1, 1, 10).setValues([[
      'id', 'title', 'description', 'price', 'category', 
      'image_url', 'topmate_url', 'file_url', 'seller_email', 'timestamp'
    ]]);
    
    // Create Orders sheet with headers
    var ordersSheet = spreadsheet.insertSheet('Orders');
    ordersSheet.getRange(1, 1, 1, 6).setValues([[
      'order_id', 'buyer_email', 'product_id', 'payment_status', 
      'download_url', 'timestamp'
    ]]);
    
    // Create Reviews sheet with headers
    var reviewsSheet = spreadsheet.insertSheet('Reviews');
    reviewsSheet.getRange(1, 1, 1, 6).setValues([[
      'review_id', 'product_id', 'user_email', 'rating', 
      'comment', 'timestamp'
    ]]);
    
    // Create Newsletter sheet with headers
    var newsletterSheet = spreadsheet.insertSheet('Newsletter');
    newsletterSheet.getRange(1, 1, 1, 2).setValues([['email', 'timestamp']]);
    
    // Add sample data
    addSampleData(spreadsheet);
    
    return ContentService.createTextOutput(JSON.stringify({success: true, message: 'Setup complete'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, message: 'Setup failed: ' + error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Adds sample data to all sheets
 */
function addSampleData(spreadsheet) {
  try {
    var timestamp = new Date();
    
    // Sample products
    var products = [
      [
        'PROD-1001', 'eBook: Digital Marketing Guide',
        'Comprehensive guide to digital marketing strategies for 2023',
        24.99, 'eBooks', 'https://via.placeholder.com/300?text=Marketing+eBook',
        'https://topmate.io/sample1', 'https://drive.google.com/sample1',
        'seller1@example.com', timestamp
      ],
      [
        'PROD-1002', 'Resume Template Pack',
        'Professional resume templates in Word and PDF formats',
        14.99, 'Templates', 'https://via.placeholder.com/300?text=Resume+Templates',
        'https://topmate.io/sample2', 'https://drive.google.com/sample2',
        'seller2@example.com', timestamp
      ],
      [
        'PROD-1003', 'Social Media Graphics Bundle',
        '100+ customizable social media templates',
        19.99, 'Graphics', 'https://via.placeholder.com/300?text=Social+Media',
        'https://topmate.io/sample3', 'https://drive.google.com/sample3',
        'seller3@example.com', timestamp
      ]
    ];
    
    spreadsheet.getSheetByName('Products').getRange(2, 1, products.length, products[0].length).setValues(products);
    
    // Sample orders
    var orders = [
      [
        'ORD-5001', 'customer1@example.com', 'PROD-1001',
        'completed', 'https://drive.google.com/sample1', timestamp
      ],
      [
        'ORD-5002', 'customer2@example.com', 'PROD-1002',
        'pending', 'https://drive.google.com/sample2', timestamp
      ]
    ];
    
    spreadsheet.getSheetByName('Orders').getRange(2, 1, orders.length, orders[0].length).setValues(orders);
    
    // Sample reviews
    var reviews = [
      [
        'REV-9001', 'PROD-1001', 'customer1@example.com',
        5, 'Excellent guide! Very comprehensive.', timestamp
      ],
      [
        'REV-9002', 'PROD-1002', 'customer2@example.com',
        4, 'Great templates, easy to customize.', timestamp
      ]
    ];
    
    spreadsheet.getSheetByName('Reviews').getRange(2, 1, reviews.length, reviews[0].length).setValues(reviews);
    
    // Sample newsletter
    var newsletter = [
      ['customer1@example.com', timestamp],
      ['customer2@example.com', timestamp]
    ];
    
    spreadsheet.getSheetByName('Newsletter').getRange(2, 1, newsletter.length, newsletter[0].length).setValues(newsletter);
    
    return true;
  } catch (error) {
    console.error('Error adding sample data:', error);
    return false;
  }
}

/**
 * Main GET request handler
 */
function doGet(e) {
  var response;
  
  try {
    if (!e || !e.parameter || !e.parameter.action) {
      throw new Error('Action parameter is required');
    }
    
    var action = e.parameter.action.toLowerCase();
    var params = {};
    
    // Copy all parameters except action
    for (var key in e.parameter) {
      if (key !== 'action') params[key] = e.parameter[key];
    }
    
    switch(action) {
      case 'products':
        response = handleGetProducts(params);
        break;
      case 'product':
        if (!params.id) throw new Error('Product ID is required');
        response = handleGetProduct(params.id);
        break;
      case 'order':
        if (!params.id) throw new Error('Order ID is required');
        response = handleGetOrder(params.id);
        break;
      case 'download':
        if (!params.order_id) throw new Error('Order ID is required');
        response = handleValidateDownload(params.order_id);
        break;
      case 'stats':
        if (!params.seller_email) throw new Error('Seller email is required');
        response = handleGetStats(params.seller_email);
        break;
      case 'setup':
        response = setupStore();
        break;
      default:
        throw new Error('Invalid action: ' + action);
    }
  } catch (error) {
    response = {
      success: false,
      message: error.message
    };
  }
  
  // Enable CORS
  var output = ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
  
  return output;
}

/**
 * Main POST request handler
 */
function doPost(e) {
  var response;
  
  try {
    if (!e || !e.parameter || !e.parameter.action) {
      throw new Error('Action parameter is required');
    }
    
    var action = e.parameter.action.toLowerCase();
    var data;
    
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      throw new Error('Invalid JSON data');
    }
    
    switch(action) {
      case 'order':
        if (!data.product_id || !data.buyer_email) {
          throw new Error('Product ID and buyer email are required');
        }
        response = handleRecordOrder(data);
        break;
      case 'product':
        if (!data.title || !data.description || !data.price || !data.category || 
            !data.image_url || !data.file_url || !data.seller_email) {
          throw new Error('All product fields are required');
        }
        response = handleAddProduct(data);
        break;
      case 'review':
        if (!data.product_id || !data.user_email || !data.rating || !data.comment) {
          throw new Error('All review fields are required');
        }
        response = handleAddReview(data);
        break;
      case 'newsletter':
        if (!data.email) {
          throw new Error('Email is required');
        }
        response = handleAddToNewsletter(data);
        break;
      default:
        throw new Error('Invalid action: ' + action);
    }
  } catch (error) {
    response = {
      success: false,
      message: error.message
    };
  }
  
  // Enable CORS
  var output = ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
  
  return output;
}

/**
 * Get products with optional filtering
 */
function handleGetProducts(params) {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) throw new Error('Spreadsheet not found');
    
    var sheet = spreadsheet.getSheetByName('Products');
    if (!sheet) throw new Error('Products sheet not found');
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return { success: true, data: { products: [] } };
    
    var headers = data[0];
    var products = [];
    
    for (var i = 1; i < data.length; i++) {
      var product = {};
      for (var j = 0; j < headers.length; j++) {
        product[headers[j]] = data[i][j];
      }
      
      // Apply filters
      var include = true;
      if (params.category) include = product.category === params.category;
      if (params.seller_email) include = product.seller_email === params.seller_email;
      
      if (include) {
        product.rating = getAverageRating(product.id);
        products.push(product);
      }
    }
    
    return { success: true, data: { products: products } };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get single product by ID
 */
function handleGetProduct(productId) {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) throw new Error('Spreadsheet not found');
    
    var sheet = spreadsheet.getSheetByName('Products');
    if (!sheet) throw new Error('Products sheet not found');
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == productId) {
        var product = {};
        for (var j = 0; j < headers.length; j++) {
          product[headers[j]] = data[i][j];
        }
        
        product.rating = getAverageRating(productId);
        product.reviews = getProductReviews(productId);
        
        return { success: true, data: { product: product } };
      }
    }
    
    throw new Error('Product not found');
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get order by ID
 */
function handleGetOrder(orderId) {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) throw new Error('Spreadsheet not found');
    
    var sheet = spreadsheet.getSheetByName('Orders');
    if (!sheet) throw new Error('Orders sheet not found');
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == orderId) {
        var order = {};
        for (var j = 0; j < headers.length; j++) {
          order[headers[j]] = data[i][j];
        }
        
        var productResponse = handleGetProduct(order.product_id);
        if (productResponse.success) {
          order.product_title = productResponse.data.product.title;
          order.price = productResponse.data.product.price;
        }
        
        return { success: true, data: { order: order } };
      }
    }
    
    throw new Error('Order not found');
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Validate download and return file URL
 */
function handleValidateDownload(orderId) {
  try {
    var orderResponse = handleGetOrder(orderId);
    if (!orderResponse.success) throw new Error(orderResponse.message);
    
    var order = orderResponse.data.order;
    
    if (order.payment_status !== 'completed') {
      throw new Error('Payment not completed');
    }
    
    return { 
      success: true, 
      data: { 
        download_url: order.download_url,
        status: order.payment_status 
      } 
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Get seller stats
 */
function handleGetStats(sellerEmail) {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) throw new Error('Spreadsheet not found');
    
    var productsSheet = spreadsheet.getSheetByName('Products');
    if (!productsSheet) throw new Error('Products sheet not found');
    
    var ordersSheet = spreadsheet.getSheetByName('Orders');
    if (!ordersSheet) throw new Error('Orders sheet not found');
    
    var productsData = productsSheet.getDataRange().getValues();
    var ordersData = ordersSheet.getDataRange().getValues();
    
    var totalProducts = 0;
    var totalEarnings = 0;
    var totalSales = 0;
    var productIds = [];
    
    // Calculate stats
    for (var i = 1; i < productsData.length; i++) {
      if (productsData[i][8] === sellerEmail) {
        totalProducts++;
      }
    }
    
    for (var i = 1; i < ordersData.length; i++) {
      productIds.push(ordersData[i][2]);
    }
    
    for (var i = 1; i < productsData.length; i++) {
      if (productsData[i][8] === sellerEmail) {
        var productId = productsData[i][0];
        var productPrice = parseFloat(productsData[i][3]);
        var productSales = productIds.filter(function(id) { return id === productId; }).length;
        totalSales += productSales;
        totalEarnings += productSales * productPrice;
      }
    }
    
    return {
      success: true,
      data: {
        total_products: totalProducts,
        total_earnings: totalEarnings.toFixed(2),
        total_sales: totalSales
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Record a new order
 */
function handleRecordOrder(data) {
  try {
    var productResponse = handleGetProduct(data.product_id);
    if (!productResponse.success) throw new Error(productResponse.message);
    
    var orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
    var timestamp = new Date();
    
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders').appendRow([
      orderId,
      data.buyer_email,
      data.product_id,
      'pending',
      productResponse.data.product.file_url,
      timestamp
    ]);
    
    return { 
      success: true, 
      data: { 
        order_id: orderId,
        download_url: productResponse.data.product.file_url
      } 
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Add new product
 */
function handleAddProduct(data) {
  try {
    // Validate required fields
    if (!data.title) throw new Error('Title is required');
    if (!data.description) throw new Error('Description is required');
    if (!data.price) throw new Error('Price is required');
    if (!data.category) throw new Error('Category is required');
    if (!data.image_url) throw new Error('Image URL is required');
    if (!data.file_url) throw new Error('File URL is required');
    if (!data.seller_email) throw new Error('Seller email is required');
    
    // Validate price is a number
    if (isNaN(parseFloat(data.price))) {
      throw new Error('Price must be a number');
    }
    
    var productId = 'PROD-' + Math.floor(Math.random() * 1000000);
    var timestamp = new Date();
    
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Products').appendRow([
      productId,
      data.title,
      data.description,
      parseFloat(data.price),
      data.category,
      data.image_url,
      data.topmate_url || '',
      data.file_url,
      data.seller_email,
      timestamp
    ]);
    
    return { success: true, data: { product_id: productId } };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Add new review
 */
function handleAddReview(data) {
  try {
    // Validate required fields
    if (!data.product_id) throw new Error('Product ID is required');
    if (!data.user_email) throw new Error('User email is required');
    if (!data.rating) throw new Error('Rating is required');
    if (!data.comment) throw new Error('Comment is required');
    
    // Validate rating is between 1-5
    var rating = parseInt(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    var reviewId = 'REV-' + Math.floor(Math.random() * 1000000);
    var timestamp = new Date();
    
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reviews').appendRow([
      reviewId,
      data.product_id,
      data.user_email,
      rating,
      data.comment,
      timestamp
    ]);
    
    return { success: true, data: { review_id: reviewId } };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Add to newsletter
 */
function handleAddToNewsletter(data) {
  try {
    if (!data.email) {
      throw new Error('Email is required');
    }
    
    // Simple email validation
    if (!data.email.includes('@') || !data.email.includes('.')) {
      throw new Error('Invalid email format');
    }
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Newsletter');
    var existingData = sheet.getDataRange().getValues();
    
    // Check if email already exists
    for (var i = 1; i < existingData.length; i++) {
      if (existingData[i][0] === data.email) {
        throw new Error('Email already subscribed');
      }
    }
    
    sheet.appendRow([data.email, new Date()]);
    return { success: true, data: { subscribed: true } };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Helper function to get average rating for a product
 */
function getAverageRating(productId) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reviews');
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
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return 0;
  }
}

/**
 * Helper function to get reviews for a product
 */
function getProductReviews(productId) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reviews');
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
  } catch (error) {
    console.error('Error getting product reviews:', error);
    return [];
  }
}
