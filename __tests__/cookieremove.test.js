const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const cookieScript = fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8');

describe('Cookie Banner Removal Script', () => {
  let browser;
  let page;

  const loadTestContent = async (html) => {
    await page.setContent(html);
    await page.evaluate(cookieScript);
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should click reject button and remove cookie banner', async () => {
    await loadTestContent(`
      <div id="cookie-banner">
        <button>Reject</button>
        <button>Accept</button>
      </div>
    `);
    const banner = await page.$('#cookie-banner');
    expect(banner).toBeNull();
  });

  test('should handle case-insensitive reject text', async () => {
    await loadTestContent(`
      <div class="cookie-consent">
        <button>REJECT ALL</button>
        <button>ACCEPT</button>
      </div>
    `);
    const banner = await page.$('.cookie-consent');
    expect(banner).toBeNull();
  });

  test('should click input type button with reject text', async () => {
    await loadTestContent(`
      <div id="cookie-notice">
        <input type="button" value="Decline">
        <input type="button" value="Accept">
      </div>
    `);
    const banner = await page.$('#cookie-notice');
    expect(banner).toBeNull();
  });

  test('should handle anchor tags with reject text', async () => {
    await loadTestContent(`
      <div class="consent-popup">
        <a href="#">Opt out</a>
        <a href="#">Accept</a>
      </div>
    `);
    const banner = await page.$('.consent-popup');
    expect(banner).toBeNull();
  });

  test('should remove banner without reject button but with cookie text', async () => {
    await loadTestContent(`
      <div id="cookie-message">
        <p>We use cookies to improve your experience.</p>
        <button>Accept</button>
      </div>
    `);
    const banner = await page.$('#cookie-message');
    expect(banner).toBeNull();
  });

  test('should reset body styles after removal', async () => {
    await loadTestContent(`
      <body style="overflow: hidden; position: fixed; margin-top: 100px;">
        <div id="cookie-banner">
          <button>Reject</button>
        </div>
      </body>
    `);
    const styles = await page.evaluate(() => {
      return {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        marginTop: document.body.style.marginTop
      };
    });
    expect(styles.overflow).toBe('auto');
    expect(styles.position).toBe('static');
    expect(styles.marginTop).toBe('0px');
  });

  test('should remove cookie-related body classes', async () => {
    await loadTestContent(`
      <body class="cookie-consent cookie-banner">
        <div id="cookie-popup">
          <button>Deny</button>
        </div>
      </body>
    `);
    const classes = await page.evaluate(() => document.body.className);
    expect(classes).not.toMatch(/cookie-consent|cookie-banner/);
  });

  test('should not remove non-cookie related elements', async () => {
    await loadTestContent(`
      <div id="non-cookie-banner">
        <button>Close</button>
      </div>
    `);
    const banner = await page.$('#non-cookie-banner');
    expect(banner).not.toBeNull();
  });

  test('should handle multiple cookie banners', async () => {
    await loadTestContent(`
      <div id="cookie-banner1">
        <button>Reject</button>
      </div>
      <div id="cookie-banner2">
        <button>Decline</button>
      </div>
    `);
    const b1 = await page.$('#cookie-banner1');
    const b2 = await page.$('#cookie-banner2');
    expect(b1).toBeNull();
    expect(b2).toBeNull();
  });

  test('should stop interval after successful removal', async () => {
    await loadTestContent(`
      <div id="cookie-banner">
        <button>Reject</button>
      </div>
    `);
    await page.setContent(`
      <div id="new-cookie-banner">
        <button>Accept</button>
      </div>
    `);
    const banner = await page.$('#new-cookie-banner');
    expect(banner).not.toBeNull();
  });

  test('should handle dynamic content loading', async () => {
    await page.setContent(`<div id="placeholder"></div>`);
    await page.evaluate(cookieScript);
    await page.evaluate(() => {
      setTimeout(() => {
        const el = document.createElement('div');
        el.id = 'cookie-banner';
        el.innerHTML = '<button>Reject</button>';
        document.getElementById('placeholder').appendChild(el);
      }, 500);
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    const banner = await page.$('#cookie-banner');
    expect(banner).toBeNull();
  });

  test('should handle buttons with aria-labels', async () => {
    await loadTestContent(`
      <div id="cookie-banner">
        <button aria-label="Reject cookies">X</button>
        <button aria-label="Accept cookies">✓</button>
      </div>
    `);
    const banner = await page.$('#cookie-banner');
    expect(banner).toBeNull();
  });

  test('should not throw errors on empty page', async () => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await loadTestContent('');
    expect(consoleErrors.length).toBe(0);
  });

  test('should handle partial text matches', async () => {
    await loadTestContent(`
      <div id="cookie-banner">
        <button>Manage cookie choices</button>
        <button>Accept all cookies</button>
      </div>
    `);
    const banner = await page.$('#cookie-banner');
    expect(banner).toBeNull();
  });
});
