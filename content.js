(() => {
    const rejectTexts = [
        "Reject", "Only necessary", "Decline", "Reject all", "Deny", "No thanks", "Disagree",
        "Refuse", "Opt out", "Do not accept", "Do not consent", "Disable", "Turn off", "Manage choices",
        "Continue without accepting", "Continue without consent", "Essential only", "Necessary only", "Reject cookies"
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

    function removeCookieElements() {
        let found = false;
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(container => {
                let rejectFound = false;
                container.querySelectorAll("button, input[type='button'], a").forEach(el => {
                    if (
                        (el.offsetParent !== null) &&
                        (
                            rejectTexts.some(t => el.innerText?.toLowerCase().includes(t.toLowerCase())) ||
                            rejectTexts.some(t => el.value?.toLowerCase().includes(t.toLowerCase()))
                        )
                    ) {
                        el.click();
                        rejectFound = true;
                        found = true;
                    }
                });
                if (rejectFound) {
                    container.remove();
                }
                // if there is no reject button check to see if it's a cookie banner
                if (!rejectFound && container.offsetParent !== null) {
                    const isCookieBanner = selectors.some(s => container.matches(s));
                    if (isCookieBanner) {
                        container.remove();
                        found = true;
                    }
                }
            });
        });

        if (found) {
            document.body.style.setProperty('overflow', 'auto', 'important');
            document.body.style.setProperty('position', 'static', 'important');
            document.body.style.setProperty('margin-top', '0px', 'important');
            document.body.style.setProperty('top', '0px', 'important');
            document.body.style.setProperty('left', '0px', 'important');
            document.body.style.setProperty('right', '0px', 'important');
            document.body.classList.remove('cookie-consent', 'cookie-banner', 'cookie-notice', 'cookie-popup');
        }

        return found;
    }

    const intervalId = setInterval(() => {
        if (removeCookieElements()) {
            clearInterval(intervalId);
        }
    }, 200);
})();
