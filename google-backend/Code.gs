// Yugal Digital Store - Google Apps Script Backend

// Spreadsheet ID (replace with your actual spreadsheet ID)
var SPREADSHEET_ID = '1c1tdxzolOAn2fiTmFHPA6NvkLlnr_SRtKZxOVUUrTWA';

// Sheet Names
var SHEETS = {
  PRODUCTS: 'Products',
  ORDERS: 'Orders',
  REVIEWS: 'Reviews',
  NEWSLETTER: 'Newsletter'
};

// Main function to handle GET requests
function doGet(e) {
  var action = e.parameter.action;
  var response;
  
  try {
    switch(action) {
      case 'products':
        response = getProducts(e);
        break;
      case 'product':
        response = getProduct(e.parameter.id);
        break;
      case 'order':
        response = getOrder(e.parameter.id);
        break;
      case 'download':
        response = validateDownload(e.parameter.order_id);
        break;
      default:
        response = createResponse(false, 'Invalid action');
    }
  } catch (error) {
    response = createResponse(false, error.toString());
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Main function to handle POST requests
function doPost(e) {
  var action = e.parameter.action;
  var data = JSON.parse(e.postData.contents);
  var response;
  
  try {
    switch(action) {
      case 'order':
        response = recordOrder(data);
        break;
      case 'product':
        response = addProduct(data);
        break;
      case 'review':
        response = addReview(data);
        break;
      case 'newsletter':
        response = addToNewsletter(data.email);
        break;
      default:
        response = createResponse(false, 'Invalid action');
    }
  } catch (error) {
    response = createResponse(false, error.toString());
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Get all products with optional filtering
function getProducts(e) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.PRODUCTS);
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
    
    if (e.parameter.type === 'featured') {
      // In a real app, you might have a featured flag
      include = i <= 6; // Just return first 6 as featured
    } else if (e.parameter.type === 'trending') {
      // In a real app, you might sort by downloads/sales
      include = i <= 8; // Just return first 8 as trending
    } else if (e.parameter.type === 'seller') {
      include = product.seller_email === e.parameter.seller_email;
    }
    
    if (include) {
      products.push(product);
    }
  }
  
  return createResponse(true, '', { products: products });
}

// Get single product by ID
function getProduct(id) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.PRODUCTS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) { // Assuming ID is first column
      var product = {};
      for (var j = 0; j < headers.length; j++) {
        product[headers[j]] = data[i][j];
      }
      return createResponse(true, '', { product: product });
    }
  }
  
  return createResponse(false, 'Product not found');
}

// Record a new order
function recordOrder(orderData) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.ORDERS);
  
  // Generate order ID
  var orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
  var timestamp = new Date();
  
  // Get product details
  var product = getProduct(orderData.product_id);
  if (!product.success) {
    return createResponse(false, 'Product not found');
  }
  
  // Add order to sheet
  sheet.appendRow([
    orderId,
    orderData.buyer_email,
    orderData.product_id,
    'pending', // payment status
    product.product.file_url,
    timestamp
  ]);
  
  return createResponse(true, 'Order recorded', { 
    order_id: orderId,
    download_url: product.product.file_url
  });
}

// Get order details
function getOrder(id) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.ORDERS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) { // Assuming order_id is first column
      var order = {};
      for (var j = 0; j < headers.length; j++) {
        order[headers[j]] = data[i][j];
      }
      
      // Get product details
      var product = getProduct(order.product_id);
      if (product.success) {
        order.product_title = product.product.title;
        order.price = product.product.price;
      }
      
      return createResponse(true, '', { order: order });
    }
  }
  
  return createResponse(false, 'Order not found');
}

// Validate download and return file URL
function validateDownload(orderId) {
  var order = getOrder(orderId);
  if (!order.success) {
    return createResponse(false, 'Invalid order ID');
  }
  
  // In a real app, you would verify payment status
  if (order.order.payment_status !== 'completed') {
    return createResponse(false, 'Payment not completed');
  }
  
  return createResponse(true, '', { 
    download_url: order.order.download_url,
    status: order.order.payment_status
  });
}

// Add a new product
function addProduct(productData) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.PRODUCTS);
  
  // Generate product ID
  var productId = 'PROD-' + Math.floor(Math.random() * 1000000);
  var timestamp = new Date();
  
  // Add product to sheet
  sheet.appendRow([
    productId,
    productData.title,
    productData.description,
    productData.price,
    productData.category,
    productData.image_url,
    productData.topmate_url,
    productData.file_url,
    productData.seller_email,
    timestamp
  ]);
  
  return createResponse(true, 'Product added', { product_id: productId });
}

// Add a review
function addReview(reviewData) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.REVIEWS);
  
  // Generate review ID
  var reviewId = 'REV-' + Math.floor(Math.random() * 1000000);
  var timestamp = new Date();
  
  // Add review to sheet
  sheet.appendRow([
    reviewId,
    reviewData.product_id,
    reviewData.user_email,
    reviewData.rating,
    reviewData.comment,
    timestamp
  ]);
  
  return createResponse(true, 'Review added');
}

// Add email to newsletter
function addToNewsletter(email) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.NEWSLETTER);
  
  // Check if email already exists
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return createResponse(false, 'Email already subscribed');
    }
  }
  
  // Add email to sheet
  sheet.appendRow([email, new Date()]);
  return createResponse(true, 'Subscribed to newsletter');
}

// Helper function to create consistent response format
function createResponse(success, message, data) {
  return {
    success: success,
    message: message,
    data: data || {}
  };
}
