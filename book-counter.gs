/**
 * Fear to Courage — e-book "copies purchased" counter (free, Google Apps Script)
 *
 * SETUP (about 3 minutes):
 *  1. Go to https://script.google.com → New project. Delete the sample code
 *     and paste this whole file in. Save.
 *  2. Deploy → New deployment → gear icon → "Web app".
 *       Execute as:    Me
 *       Who has access: Anyone
 *     Click Deploy, allow the permissions, and copy the "Web app URL"
 *     (it ends in /exec).
 *  3. In index.html, paste that URL into:
 *       const BOOK_COUNTER_URL = "https://script.google.com/macros/s/.../exec";
 *
 * The website shows  BOOK_SOLD_BASE (2000) + the number stored here.
 * Each successful Razorpay payment adds 1. The same payment ID is never
 * counted twice. To correct the number by hand, open Project Settings →
 * Script properties and edit "count".
 */

function doGet() {
  var count = Number(PropertiesService.getScriptProperties().getProperty('count') || 0);
  return ContentService.createTextOutput(JSON.stringify({ count: count }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = {};
    try { data = JSON.parse(e.postData.contents || '{}'); } catch (err) {}
    var id = String(data.paymentId || '');
    var props = PropertiesService.getScriptProperties();

    // Only real Razorpay payment IDs, and each one only once
    if (/^pay_[A-Za-z0-9]+$/.test(id) && !props.getProperty('p_' + id)) {
      var count = Number(props.getProperty('count') || 0) + 1;
      props.setProperty('count', String(count));
      props.setProperty('p_' + id, '1');
    }
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput('ok');
}
