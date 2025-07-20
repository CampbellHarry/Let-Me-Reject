(() => {
    const rejectTexts = [
        "Reject", "Only necessary", "Decline", "Reject all", "Deny", "No thanks", "Disagree",
        "Refuse", "Opt out", "Do not accept", "Do not consent", "Disable", "Turn off", "Manage choices",
        "Continue without accepting", "Continue without consent", "Essential only", "Necessary only",
        "Reject cookies", "Use essential cookies only", "Customize settings"
    ];

    const selectors = [
        '[id*="cookie"]',
        '[class*="cookie"]',
        '[aria-label*="cookie"]',
        '[data-testid*="cookie"]',
        '[role="dialog"]',
        '[id*="consent"]',
        '[class*="consent"]',
        '[class*="gdpr"]',
        '[class*="privacy"]'
    ];

    function clickRejectButtons(container) {
        let clicked = false;
        const buttons = container.querySelectorAll("button, input[type='button'], a");
        buttons.forEach(btn => {
            const text = (btn.innerText || btn.value || "").toLowerCase().trim();
            if (
                btn.offsetParent !== null &&
                rejectTexts.some(t => text.includes(t.toLowerCase()))
            ) {
                try {
                    btn.click();
                    clicked = true;
                } catch (e) {}
            }
        });
        return clicked;
    }

    function removeConsentElements() {
        let handled = false;
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(container => {
                if (clickRejectButtons(container)) {
                    setTimeout(() => {
                        try {
                            container.remove();
                        } catch (e) {}
                    }, 1000);
                    handled = true;
                }
            });
        });

        if (handled) {
            const body = document.body;
            if (body) {
                body.style.setProperty('overflow', 'auto', 'important');
                body.classList.remove('nn-consent-applies', 'nn-consent-gdpr');
            }
        }

        return handled;
    }

    const intervalId = setInterval(() => {
        if (removeConsentElements()) {
            clearInterval(intervalId);
        }
    }, 300);

    const observer = new MutationObserver(() => removeConsentElements());
    observer.observe(document.documentElement, { childList: true, subtree: true });

    const patchSetAttribute = () => {
        const original = HTMLElement.prototype.setAttribute;
        HTMLElement.prototype.setAttribute = function (name, value) {
            if (name === 'class' && typeof value === 'string') {
                value = value.replace(/\bnn-consent-applies\b|\bnn-consent-gdpr\b/g, '');
            }
            return original.apply(this, arguments);
        };
    };

    patchSetAttribute();
})();
