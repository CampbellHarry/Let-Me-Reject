(() => {
    const rejectTexts = [
        "reject", "only necessary", "decline", "reject all", "deny", "no thanks", "disagree",
        "refuse", "opt out", "do not accept", "do not consent", "disable", "turn off", "manage choices",
        "continue without accepting", "continue without consent", "essential only", "necessary only", "reject cookies"
    ];
    const selectors = [
        '[id*="cookie"]',
        '[class*="cookie"]',
        '[aria-label*="cookie"]',
        '[data-testid*="cookie"]',
        '[role="dialog"]',
        '[id*="consent"]',
        '[class*="consent"]'
    ];

    function isElementVisible(el) {
        if (!el) return false;

        while (el) {
            const style = window.getComputedStyle(el);
            if (
                style.display === 'none' ||
                style.visibility === 'hidden' ||
                parseFloat(style.opacity) === 0
            ) {
                return false;
            }
            el = el.parentElement;
        }

        return true;
    }
    function removeCookieElements() {
    let found = false;

    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(container => {
        let rejectFound = false;

        container.querySelectorAll("button, input[type='button'], a").forEach(el => {
            const text = (
            el.getAttribute('aria-label') ||
            el.innerText ||
            el.value ||
            ''
            ).toLowerCase().trim();

            if (
            rejectTexts.some(t => text.includes(t)) &&
            isElementVisible(el) &&
            isElementVisible(container)
            ) {
            try {
                el.click();
                container.remove();
                rejectFound = true;
                found = true;
            } catch {}
            }
        });

        // Remove container if no reject button but contains 'cookie' text and is visible
        if (!rejectFound && container.innerText?.toLowerCase().includes('cookie') && isElementVisible(container)) {
            try {
            container.remove();
            found = true;
            } catch {}
        }
        });
    });

    if (found) {
        const style = document.body.style;
        style.setProperty('overflow', 'auto', 'important');
        style.setProperty('position', 'static', 'important');
        style.setProperty('margin-top', '0px', 'important');
        style.setProperty('top', '0px', 'important');
        style.setProperty('left', '0px', 'important');
        style.setProperty('right', '0px', 'important');

        const cookieClasses = ['cookie-consent', 'cookie-banner', 'cookie-notice', 'cookie-popup'];
        document.body.className = document.body.className
        .split(/\s+/)
        .filter(cls => !cookieClasses.includes(cls.toLowerCase()))
        .join(' ');
    }

    return found;
    }

  removeCookieElements();

  const observer = new MutationObserver(() => removeCookieElements());
  observer.observe(document.body, { childList: true, subtree: true });
})();