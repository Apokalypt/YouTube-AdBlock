// Translate DOM page
const I18N_KEY = "data-key-i18n";
for (const element of document.querySelectorAll(`[${I18N_KEY}]`)) {
    const key = element.getAttribute(I18N_KEY);

    if (element.innerHTML === element.innerText) {
        element.innerHTML = chrome.i18n.getMessage(key);
    } else {
        // Handle specific case for <label> tag where there is HTML + text
        const iter = document.createNodeIterator(element, NodeFilter.SHOW_TEXT);
        let node = iter.nextNode();
        let hasFound = false;

        while (node && !hasFound) {
            if (!node.textContent.trim()) {
                node = iter.nextNode();
                continue;
            }

            node.textContent = chrome.i18n.getMessage(key);
            hasFound = true;
        }
    }
}

const switchExtensionEnable = document.getElementById("switch_extension_enable");
switchExtensionEnable.addEventListener("change", function() {
    chrome.runtime.sendMessage({ action: "updateConfig", data: { enabled: this.checked } });
});

chrome.runtime.sendMessage({ action: "getConfig" }, (response) => {
    switchExtensionEnable.checked = response.enabled ?? false;
});
chrome.runtime.onMessage.addListener( function(request) {
    if (request.action !== "config") {
        return;
    }

    const enabled = request.data.enabled ?? true;
    if (switchExtensionEnable.checked !== enabled) {
        const onSwitchChange = switchExtensionEnable.onchange;

        // Disable events to avoid infinite loop
        switchExtensionEnable.removeEventListener("change", onSwitchChange);
        switchExtensionEnable.checked = enabled;
        switchExtensionEnable.addEventListener("change", onSwitchChange);
    }
});
