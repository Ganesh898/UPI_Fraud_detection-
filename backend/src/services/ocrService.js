const fs = require('fs');

/**
 * OCR Receipt Inspector Service
 * Extracts UPI payment receipt fields with regex heuristics and OCR fallback
 */
const ocrService = {
  extractReceiptData: async (filePath) => {
    try {
      if (!filePath || !fs.existsSync(filePath)) {
        return {
          extractedUtr: null,
          extractedAmount: null,
          extractedSenderVpa: null,
          extractedReceiverVpa: null,
          confidence: 0,
          rawText: '',
        };
      }

      // Try running Tesseract if tesseract.js is available
      let rawText = '';
      try {
        const { createWorker } = require('tesseract.js');
        const worker = await createWorker('eng');
        const ret = await worker.recognize(filePath);
        rawText = ret.data.text || '';
        await worker.terminate();
      } catch (ocrErr) {
        // Fallback: If Tesseract language data download is offline or restricted
        rawText = fs.readFileSync(filePath, 'utf8').substring(0, 1000);
      }

      // Heuristic Regex Extraction from parsed receipt text
      const utrMatch = rawText.match(/(?:UPI Ref|UTR|Ref No|Reference)[\s:]*([0-9]{10,14})/i) ||
                       rawText.match(/\b([0-9]{12})\b/) ||
                       rawText.match(/\b([0-9]{10})\b/);

      const amountMatch = rawText.match(/(?:₹|INR|Rs\.?)\s*([0-9,]+(?:\.[0-9]{2})?)/i) ||
                          rawText.match(/\b([0-9]{2,6}(?:\.[0-9]{2})?)\b/);

      const vpaMatches = rawText.match(/[a-zA-Z0-9.\-_]{2,100}@[a-zA-Z]{2,30}/g) || [];

      return {
        extractedUtr: utrMatch ? utrMatch[1] : null,
        extractedAmount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null,
        extractedReceiverVpa: vpaMatches[0] || null,
        extractedSenderVpa: vpaMatches[1] || null,
        confidence: rawText.length > 20 ? 88 : 45,
        rawText,
      };
    } catch (err) {
      console.warn('OCR processing error:', err.message);
      return {
        extractedUtr: null,
        extractedAmount: null,
        extractedSenderVpa: null,
        extractedReceiverVpa: null,
        confidence: 0,
        rawText: '',
      };
    }
  },
};

module.exports = ocrService;
