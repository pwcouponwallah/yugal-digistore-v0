# Yugal Digital Store - Setup Instructions

## Overview
Yugal Digital Store is a complete Etsy-style marketplace for digital products, powered by Google Sheets as a backend and Topmate.io for payments.

## Setup Steps

### 1. Google Sheets Backend Setup
1. Create a new Google Spreadsheet
2. Create 4 sheets with these exact names:
   - `Products` - For storing product information
   - `Orders` - For recording customer orders
   - `Reviews` - For product reviews
   - `Newsletter` - For newsletter subscriptions
3. Set up the columns as specified in the documentation
4. Open Script Editor from the Tools menu
5. Replace the default code with the provided `Code.gs`
6. Update the `SPREADSHEET_ID` variable with your spreadsheet ID
7. Deploy the script as a web app:
   - Click "Deploy" > "New deployment"
   - Select "Web app" as the type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
8. Copy the web app URL (this will be your `API_BASE_URL`)

### 2. Frontend Setup
1. Update the `API_BASE_URL` in `assets/js/app.js` with your deployed Apps Script URL
2. Host all HTML, CSS, and JS files on your preferred hosting service
3. Ensure all file paths are correct

### 3. Payment Integration with Topmate.io
1. Create a Topmate.io account
2. For each product in your store:
   - Create a product/service on Topmate
   - Configure the payment settings
   - Set the success redirect URL to: `yourdomain.com/thank-you.html?id=ORDER_ID`
   - Copy the product URL and add it to your Google Sheet in the `topmate_url` column

### 4. Adding Products
1. Use the seller dashboard (`dashboard.html`) to add new products
2. For each product:
   - Upload your digital file to Google Drive and make it shareable
   - Copy the shareable link and add it to the `file_url` field
   - Create a Topmate product and add its URL to the `topmate_url` field

### 5. Testing the Purchase Flow
1. Browse to a product page and click "Buy Now"
2. Complete the purchase on Topmate
3. You should be redirected to the thank you page with a download link
4. Verify the order appears in your Google Sheet

## Troubleshooting
- If downloads don't work, verify the Google Drive file is shared correctly
- If products don't appear, check the Google Sheet permissions
- If API calls fail, check the Apps Script execution logs
