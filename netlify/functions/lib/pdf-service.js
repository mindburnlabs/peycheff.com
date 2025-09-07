const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// PDF generation service for digital packs
const pdfService = {
  // Generate PDF from HTML content
  generatePDF: async (htmlContent, options = {}) => {
    let browser = null;
    
    try {
      // Launch browser with production settings
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        timeout: 30000
      });

      const page = await browser.newPage();

      // Set viewport and emulate print media
      await page.setViewport({ width: 1200, height: 1600 });
      await page.emulateMediaType('print');

      // Set content with base styling
      const styledContent = wrapWithStyles(htmlContent, options);
      await page.setContent(styledContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Generate PDF with professional settings
      const pdfOptions = {
        format: 'A4',
        margin: {
          top: '40px',
          right: '40px',
          bottom: '60px',
          left: '40px'
        },
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: true,
        headerTemplate: generateHeaderTemplate(options),
        footerTemplate: generateFooterTemplate(options),
        ...options.pdfOptions
      };

      const pdfBuffer = await page.pdf(pdfOptions);
      
      return {
        success: true,
        buffer: pdfBuffer,
        size: pdfBuffer.length,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('PDF generation failed:', error);
      return {
        success: false,
        error: error.message,
        generatedAt: new Date().toISOString()
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },

  // Generate pack-specific PDF
  generatePackPDF: async (packData, packType) => {
    try {
      const htmlContent = generatePackHTML(packData, packType);
      const options = getPackPDFOptions(packType);
      
      return await pdfService.generatePDF(htmlContent, options);
    } catch (error) {
      console.error('Pack PDF generation failed:', error);
      return {
        success: false,
        error: error.message,
        packType
      };
    }
  },

  // Generate invoice PDF
  generateInvoicePDF: async (invoiceData) => {
    try {
      const htmlContent = generateInvoiceHTML(invoiceData);
      const options = {
        title: `Invoice ${invoiceData.invoiceNumber}`,
        pdfOptions: {
          format: 'A4',
          margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        }
      };
      
      return await pdfService.generatePDF(htmlContent, options);
    } catch (error) {
      console.error('Invoice PDF generation failed:', error);
      return {
        success: false,
        error: error.message,
        invoiceNumber: invoiceData.invoiceNumber
      };
    }
  },

  // Batch generate multiple PDFs
  generateBatchPDFs: async (requests) => {
    const results = [];
    
    for (const request of requests) {
      try {
        let result;
        
        if (request.type === 'pack') {
          result = await pdfService.generatePackPDF(request.data, request.packType);
        } else if (request.type === 'invoice') {
          result = await pdfService.generateInvoicePDF(request.data);
        } else {
          result = await pdfService.generatePDF(request.html, request.options);
        }
        
        results.push({
          id: request.id,
          ...result
        });
        
      } catch (error) {
        results.push({
          id: request.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      results,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }
};

// HTML template generators
function generatePackHTML(packData, packType) {
  const { title, personalizedFor, sections, generatedAt } = packData;
  
  let sectionsHTML = '';
  Object.entries(sections).forEach(([sectionTitle, sectionData]) => {
    sectionsHTML += `
      <div class="section">
        <h2 class="section-title">${sectionTitle}</h2>
        <div class="section-content">
          ${formatContent(sectionData.content)}
        </div>
      </div>
      <div class="page-break"></div>
    `;
  });

  return `
    <div class="pack-document">
      <div class="cover-page">
        <div class="cover-header">
          <img src="data:image/svg+xml;base64,${getLogoSVG()}" alt="Logo" class="logo" />
          <div class="tagline">Personalized Strategy Pack</div>
        </div>
        
        <div class="cover-content">
          <h1 class="pack-title">${title}</h1>
          <div class="personalization">Personalized for: <strong>${personalizedFor}</strong></div>
          <div class="generation-date">Generated: ${formatDate(generatedAt)}</div>
        </div>
        
        <div class="cover-footer">
          <div class="disclaimer">
            This document contains personalized strategic guidance generated specifically for ${personalizedFor}.
            The recommendations are based on the information provided and should be adapted to your specific circumstances.
          </div>
        </div>
      </div>
      
      <div class="page-break"></div>
      
      <div class="table-of-contents">
        <h2>Table of Contents</h2>
        <ul class="toc-list">
          ${Object.keys(sections).map((title, index) => 
            `<li class="toc-item">
              <span class="toc-title">${title}</span>
              <span class="toc-page">${index + 3}</span>
            </li>`
          ).join('')}
        </ul>
      </div>
      
      <div class="page-break"></div>
      
      ${sectionsHTML}
      
      <div class="back-cover">
        <div class="contact-info">
          <h3>Need More Help?</h3>
          <p>This pack is just the beginning. For personalized implementation support:</p>
          <ul>
            <li>Book a strategy session: peycheff.com/advisory</li>
            <li>Join office hours: peycheff.com/office-hours</li>
            <li>Email questions: ivan@peycheff.com</li>
          </ul>
        </div>
        
        <div class="resources">
          <h3>Additional Resources</h3>
          <ul>
            <li>Weekly newsletter: peycheff.com/newsletter</li>
            <li>Strategy templates: peycheff.com/templates</li>
            <li>Case studies: peycheff.com/case-studies</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function generateInvoiceHTML(invoiceData) {
  const { 
    invoiceNumber, 
    date, 
    dueDate, 
    customer, 
    items, 
    subtotal, 
    tax, 
    total,
    paymentMethod,
    transactionId 
  } = invoiceData;

  const itemsHTML = items.map(item => `
    <tr class="invoice-item">
      <td class="item-description">${item.description}</td>
      <td class="item-quantity">${item.quantity}</td>
      <td class="item-price">$${item.price.toFixed(2)}</td>
      <td class="item-total">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div class="invoice-document">
      <div class="invoice-header">
        <div class="company-info">
          <img src="data:image/svg+xml;base64,${getLogoSVG()}" alt="Logo" class="logo" />
          <div class="company-details">
            <div class="company-name">Ivan Peycheff</div>
            <div class="company-address">
              Strategy & Product Advisory<br>
              ivan@peycheff.com<br>
              peycheff.com
            </div>
          </div>
        </div>
        
        <div class="invoice-info">
          <h1 class="invoice-title">Invoice</h1>
          <div class="invoice-number">#${invoiceNumber}</div>
          <div class="invoice-dates">
            <div>Date: ${formatDate(date)}</div>
            <div>Due: ${formatDate(dueDate)}</div>
          </div>
        </div>
      </div>
      
      <div class="customer-info">
        <h3>Bill To:</h3>
        <div class="customer-details">
          ${customer.name}<br>
          ${customer.email}<br>
          ${customer.company ? `${customer.company}<br>` : ''}
          ${customer.address || ''}
        </div>
      </div>
      
      <table class="invoice-items">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      
      <div class="invoice-totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        ${tax > 0 ? `
          <div class="total-row">
            <span>Tax:</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total-row total-final">
          <span>Total:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="payment-info">
        <h3>Payment Information</h3>
        <div class="payment-details">
          <div>Method: ${paymentMethod}</div>
          <div>Transaction ID: ${transactionId}</div>
          <div class="payment-status paid">PAID</div>
        </div>
      </div>
      
      <div class="invoice-footer">
        <div class="terms">
          <h4>Terms & Conditions</h4>
          <p>Digital products are delivered immediately upon payment confirmation. 
          All sales are final. For support, contact ivan@peycheff.com.</p>
        </div>
      </div>
    </div>
  `;
}

// Styling and utility functions
function wrapWithStyles(content, options = {}) {
  const baseStyles = getBaseStyles();
  const customStyles = options.styles || '';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${options.title || 'Document'}</title>
      <style>
        ${baseStyles}
        ${customStyles}
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}

function getBaseStyles() {
  return `
    /* Apple-grade typography and layout */
    @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&family=SF+Pro+Text:wght@300;400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
    }
    
    .pack-document, .invoice-document {
      max-width: 100%;
      margin: 0 auto;
      background: white;
    }
    
    /* Typography Scale */
    h1, .pack-title, .invoice-title {
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 32px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 24px;
    }
    
    h2, .section-title {
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 24px;
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 16px;
      color: #0A84FF;
    }
    
    h3 {
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.4;
      margin-bottom: 12px;
    }
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    p {
      margin-bottom: 16px;
      color: #333333;
    }
    
    ul, ol {
      margin-bottom: 16px;
      padding-left: 24px;
    }
    
    li {
      margin-bottom: 4px;
    }
    
    strong {
      font-weight: 600;
      color: #000000;
    }
    
    /* Cover Page Styles */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 40px;
      background: linear-gradient(135deg, #0A84FF 0%, #0056B3 100%);
      color: white;
      text-align: center;
    }
    
    .cover-header {
      flex: 0;
    }
    
    .logo {
      width: 60px;
      height: 60px;
      margin-bottom: 16px;
    }
    
    .tagline {
      font-size: 16px;
      font-weight: 500;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .cover-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .pack-title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 32px;
      color: white;
    }
    
    .personalization {
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 16px;
      opacity: 0.95;
    }
    
    .generation-date {
      font-size: 14px;
      opacity: 0.8;
    }
    
    .cover-footer {
      flex: 0;
    }
    
    .disclaimer {
      font-size: 12px;
      opacity: 0.8;
      line-height: 1.5;
      max-width: 600px;
      margin: 0 auto;
    }
    
    /* Table of Contents */
    .table-of-contents {
      padding: 60px 40px;
    }
    
    .toc-list {
      list-style: none;
      padding: 0;
    }
    
    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .toc-title {
      font-weight: 500;
    }
    
    .toc-page {
      font-weight: 600;
      color: #0A84FF;
    }
    
    /* Section Styles */
    .section {
      padding: 40px;
      min-height: 80vh;
    }
    
    .section-content {
      color: #333333;
    }
    
    /* Page Breaks */
    .page-break {
      page-break-after: always;
    }
    
    /* Invoice Styles */
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding: 40px 40px 0 40px;
    }
    
    .company-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .company-name {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .company-address {
      font-size: 14px;
      line-height: 1.5;
      color: #666666;
    }
    
    .invoice-info {
      text-align: right;
    }
    
    .invoice-number {
      font-size: 18px;
      font-weight: 600;
      color: #0A84FF;
      margin-bottom: 12px;
    }
    
    .invoice-dates {
      font-size: 14px;
      color: #666666;
    }
    
    .customer-info {
      margin: 40px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .invoice-items {
      width: 100%;
      margin: 40px;
      border-collapse: collapse;
      max-width: calc(100% - 80px);
    }
    
    .invoice-items th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e9ecef;
    }
    
    .invoice-items td {
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .item-quantity, .item-price, .item-total {
      text-align: right;
    }
    
    .invoice-totals {
      margin: 40px;
      margin-left: auto;
      max-width: 300px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    
    .total-final {
      border-top: 2px solid #0A84FF;
      font-weight: 600;
      font-size: 16px;
      margin-top: 8px;
      padding-top: 12px;
    }
    
    .payment-info {
      margin: 40px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .payment-status.paid {
      color: #28a745;
      font-weight: 600;
      margin-top: 8px;
    }
    
    .invoice-footer {
      margin: 40px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }
    
    .terms p {
      font-size: 12px;
      color: #666666;
      line-height: 1.5;
    }
    
    /* Back Cover */
    .back-cover {
      height: 100vh;
      padding: 60px 40px;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .contact-info, .resources {
      margin-bottom: 40px;
    }
    
    .contact-info ul, .resources ul {
      list-style: none;
      padding: 0;
    }
    
    .contact-info li, .resources li {
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    
    /* Print optimizations */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
    }
  `;
}

function generateHeaderTemplate(options) {
  if (options.hideHeader) return '<span></span>';
  
  return `
    <div style="font-size: 10px; color: #666; padding: 10px 40px; width: 100%; text-align: center;">
      ${options.title || 'Document'} | Generated ${formatDate(new Date())}
    </div>
  `;
}

function generateFooterTemplate(options) {
  if (options.hideFooter) return '<span></span>';
  
  return `
    <div style="font-size: 10px; color: #666; padding: 10px 40px; width: 100%; display: flex; justify-content: space-between;">
      <span>peycheff.com</span>
      <span class="pageNumber"></span>
    </div>
  `;
}

function getPackPDFOptions(packType) {
  const baseOptions = {
    title: PACK_TEMPLATES[packType]?.name || 'Strategy Pack',
    styles: '',
    pdfOptions: {
      format: 'A4',
      margin: { top: '60px', right: '0px', bottom: '60px', left: '0px' }
    }
  };
  
  return baseOptions;
}

function formatContent(content) {
  if (typeof content !== 'string') return '';
  
  // Convert markdown-style formatting to HTML
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getLogoSVG() {
  // Base64 encoded simple logo SVG
  const logoSVG = `
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="60" rx="12" fill="white"/>
      <path d="M20 40V20h4v16h12v4H20z" fill="#0A84FF"/>
      <circle cx="42" cy="30" r="6" fill="#0A84FF"/>
    </svg>
  `;
  
  return Buffer.from(logoSVG).toString('base64');
}

// Import pack templates from ai-service
const PACK_TEMPLATES = {
  'PACK_30DAY': { name: '30-Day Idea→Product Sprint' },
  'KIT_AUTOMATION': { name: 'Micro-Automation Kit' },  
  'KIT_DIAGRAMS': { name: 'Diagram Library Kit' }
};

module.exports = {
  pdfService
};
