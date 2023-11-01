chrome.runtime.onMessage.addListener( function(request) {
    if (request.action !== "config") {
        return false;
    }

    _setupInterval( _getConfigFromData(request.data) );

    return false;
});

chrome.runtime.sendMessage({ action: "getConfig" }, (response) => {
    _setupInterval( _getConfigFromData(response) );
});

let intervalId = null;
function _setupInterval(config) {
    if (intervalId != null) {
        clearInterval(intervalId);
    }

    setInterval(() => {
        if (!config.enabled) {
            return;
        }

        // Stop checks if we are not on a video page
        const video = document.getElementsByClassName("video-stream html5-main-video")[0];
        if (!video) {
            return;
        }

        // Iterate through all companion slots (should be ONE or ZERO) and remove them
        // e.g. When you watch a video, you can find a little card above the suggestions
        const companionSlots = document.getElementsByClassName("style-scope ytd-companion-slot-renderer");
        for (const companionSlot of companionSlots) {
            companionSlot.remove();
        }

        // Click on the button to skip current ADs (it will work even if it's hidden until the end of a countdown)
        // e.g. Buttons like "Skip Ads >|" when an ad is playing over the video
        document.getElementsByClassName("ytp-ad-text ytp-ad-skip-button-text")[0]?.click();

        // If an ad is playing, set the playback rate to a high value and mute the video
        const ad = document.getElementsByClassName("video-ads ytp-ad-module")[0];
        if (ad && ad.children.length > 0 && document.getElementsByClassName("ytp-ad-text ytp-ad-preview-text")[0]) {
            video.playbackRate = config.ad.playbackRate;
            video.muted = config.ad.muted;
        }

        // Remove the header ad
        // The tag is here, but it's always empty when I check
        document.getElementById("masthead-ad")?.remove();

        // Remove ADs in slot rendered
        // e.g. On home screen the first video is often an AD. When you watch a video the first one of the suggestions is often an AD.
        const adSlotsRendered = document.getElementsByTagName("ytd-ad-slot-renderer");
        for (const slot of adSlotsRendered) {
            slot.remove();
        }


        /* ======= NOT VALIDATED =======
         *
         * Class Name below are not validated, they have been found on some Tampermonkey scripts while I started
         * the research to create this extension. I don't know if they are still valid/used on YouTube since I
         * didn't find information about them.
         *
         */
        const adCloseButtons = document.getElementsByClassName("ytp-ad-overlay-close-button");
        for (const button of adCloseButtons) {
            button.click();
        }
        const sideAds = document.getElementsByClassName("style-scope ytd-watch-next-secondary-results-renderer sparkles-light-cta GoogleActiveViewElement");
        for (const sideAd of sideAds) {
            sideAd.style.display = "none";
        }
        const sideAds_ = document.getElementsByClassName("style-scope ytd-item-section-renderer sparkles-light-cta");
        for (const sideAd of sideAds_) {
            sideAd.style.display = "none";
        }
        const adMessageContainer = document.getElementsByClassName("ytp-ad-message-container");
        for (const container of adMessageContainer) {
            container.style.display = "none";
        }
        const reelShelfRenderers = document.getElementsByTagName("ytd-reel-shelf-renderer");
        for (const reel of reelShelfRenderers) {
            reel.remove();
        }
    }, config.intervalCheck);
}

function _getConfigFromData(data) {
    return {
        enabled: data.enabled ?? false,
        intervalCheck: data.intervalCheck ?? 100,
        ad: {
            playbackRate: data.ad?.playbackRate ?? 16,
            muted: data.ad?.muted ?? true
        }
    };
}
