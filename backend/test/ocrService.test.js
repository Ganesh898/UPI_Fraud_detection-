const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractReceiptAmount, extractReceiptDateTime } = require('../src/services/ocrService');

test('receipt amount parser handles PhonePe amounts separated in a second OCR pass', () => {
  const primaryPass = `Received from
ANKIT KUMAR
XXXXXXXX5883
Banking Name © Ankit Kumar @
Transfer Details
PhonePe Transaction ID
T2610080051260014721214
Credited to
le] XXXXXX3924
UTR: 400005511557`;
  const amountPass = `Received from
ANKIT KUMAR 1
XXXXXXXX5883
Banking Name © Ankit Kumar @
Transfer Details
PhonePe Transaction ID
T2610080051260014721214
Credited to
le] XXXXXX3924 1
UTR: 400005511557`;

  assert.equal(extractReceiptAmount(primaryPass), null);
  assert.equal(extractReceiptAmount(amountPass), 1);
});

test('receipt amount parser reads outgoing PhonePe Transfer to receipt layout', () => {
  const primaryPass = `Transfer to
XXXXXXXX1234
Kotak Mahindra Bank
Banking Name : Mayank Kumar Yadav @
Transfer Details
PhonePe Transaction ID
T2610080351456756108233
Debited from
XXXXXXXX1537
UTR: 677923948707`;
  const amountPass = `Transfer to
XXXXXXXX1234 1
Kotak Mahindra Bank
Banking Name : Mayank Kumar Yadav @
Transfer Details ~
PhonePe Transaction ID
T2610080351456756108233 B
Debited from
XXXXXXXX1537 i
UTR: 677923948707 B`;

  assert.equal(extractReceiptAmount(primaryPass), null);
  assert.equal(extractReceiptAmount(amountPass), 1);
});

test('receipt date and time parser reads PhonePe transaction timestamp', () => {
  assert.deepEqual(
    extractReceiptDateTime('Transaction Successful\n12:51 am on 08 Oct 2026'),
    { date: '2026-10-08', time: '00:51' }
  );
});

test('receipt date parser rejects impossible calendar dates', () => {
  assert.deepEqual(extractReceiptDateTime('12:51 am on 31 Feb 2026'), { date: null, time: '00:51' });
});
