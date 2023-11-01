chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    switch (request.action) {
        case "updateConfig":
            chrome.storage.sync.set({ "extension_enable": request.data.enabled ?? true });

            const config = { enabled: request.data.enabled ?? true };
            chrome.runtime.sendMessage({ action: "config", data: config });
            sendConfigToTabs(config);

            sendResponse({ success: true });
            return false;
        case "getConfig":
            chrome.storage.sync.get("extension_enable", (data) => {
                sendResponse({ enabled: data.extension_enable ?? true });
            });

            return true;
    }

    sendResponse({ success: false });
    return false;
});

const sendConfigToTabs = function (config) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, { action: "config", data: config })
                .catch( _ => null );
        }
    });
};
