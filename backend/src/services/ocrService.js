const fs = require('fs');

const extractTrailingAmounts = (section) => (section || '')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .map((line) => line.match(/(?:^|\s)([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*$/)?.[1])
  .filter(Boolean)
  .map((value) => value.replace(/,/g, ''));

const extractReceiptAmount = (rawText) => {
  const currencyAmount = rawText.match(/(?:₹|INR|Rs\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (currencyAmount) return parseFloat(currencyAmount[1].replace(/,/g, ''));

  const transactionType = rawText.match(/\b(received\s+from|paid\s+to)\b/i)?.[1]?.toLowerCase();
  if (transactionType) {
    const partySection = rawText.match(
      new RegExp(`\\b${transactionType.replace(/\s+/g, '\\s+')}\\b([\\s\\S]{0,240}?)(?=\\btransfer\\s+details\\b)`, 'i')
    )?.[1];
    const accountLabel = transactionType === 'received from' ? 'credited to' : 'debited from';
    const accountSection = rawText.match(
      new RegExp(`\\b${accountLabel}\\b([\\s\\S]{0,180}?)(?=\\bUTR\\b|$)`, 'i')
    )?.[1];
    const partyAmounts = extractTrailingAmounts(partySection);
    const accountAmounts = extractTrailingAmounts(accountSection);
    const partyAmount = partyAmounts[partyAmounts.length - 1];
    const accountAmount = accountAmounts[accountAmounts.length - 1];

    if (partyAmount && accountAmount) {
      const normalizedParty = partyAmount.replace(/\./g, '');
      const normalizedAccount = accountAmount.replace(/\./g, '');
      if (normalizedParty === normalizedAccount) return parseFloat(partyAmount);
      if (normalizedAccount.length === normalizedParty.length + 1 && normalizedAccount.slice(1) === normalizedParty) {
        return parseFloat(partyAmount);
      }
      if (normalizedParty.length === normalizedAccount.length + 1 && normalizedParty.slice(1) === normalizedAccount) {
        return parseFloat(accountAmount);
      }
      return parseFloat(accountAmount);
    }

    if (accountAmount || partyAmount) return parseFloat(accountAmount || partyAmount);
  }

  const amountMatch = rawText.match(/(?:₹|INR|Rs\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  return amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;
};

/**
 * OCR Receipt Inspector Service
 * Extracts UPI payment receipt fields with regex heuristics and OCR fallback
 */
const ocrService = {
  extractReceiptData: async (filePath) => {
    if (!filePath || !fs.existsSync(filePath)) {
      const error = new Error('Uploaded receipt image could not be found.');
      error.statusCode = 400;
      throw error;
    }

    let worker;
    let rawText;
    let confidence = 0;
    try {
      const { createWorker } = require('tesseract.js');
      worker = await createWorker('eng');
      await worker.setParameters({ tessedit_pageseg_mode: '3' });
      const result = await worker.recognize(filePath);
      rawText = result.data.text || '';
      confidence = result.data.confidence || 0;
    } catch (err) {
      const error = new Error(`OCR could not process this image: ${err.message}`);
      error.statusCode = 503;
      throw error;
    } finally {
      if (worker) await worker.terminate();
    }

    const utrMatch = rawText.match(/(?:UPI\s*(?:Ref(?:erence)?|ID)|UTR|Ref(?:erence)?\s*(?:No|ID)?)[\s:#-]*([0-9]{8,16})/i) ||
      rawText.match(/\b([0-9]{12})\b/) ||
      rawText.match(/\b([0-9]{8,11})\b/);
    const vpaMatches = rawText.match(/[a-zA-Z0-9.\-_]{2,100}@[a-zA-Z]{2,30}/g) || [];
    const lines = rawText.split(/\r?\n/);
    const findVpaOnLabelledLine = (pattern) => {
      const line = lines.find((text) => pattern.test(text));
      return line?.match(/[a-zA-Z0-9.\-_]{2,100}@[a-zA-Z]{2,30}/)?.[0] || null;
    };
    const receiverVpa = findVpaOnLabelledLine(/\b(?:to|paid\s+to|credited\s+to|recipient)\b/i);
    const senderVpa = findVpaOnLabelledLine(/\b(?:from|paid\s+by|sent\s+by|sender)\b/i);

    return {
      extractedUtr: utrMatch ? utrMatch[1] : null,
      extractedAmount: extractReceiptAmount(rawText),
      extractedReceiverVpa: receiverVpa || vpaMatches[0] || null,
      extractedSenderVpa: senderVpa || vpaMatches[1] || null,
      confidence,
      rawText,
    };
  },
};

module.exports = ocrService;
