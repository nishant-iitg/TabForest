// Track which tabs have received messages
const tabMessageSent = new Map();
const tabUpdateListeners = new Map();

// Sample ads data (in a real implementation, this would come from an ad server)
const ads = [
    {
        image: 'icons/ad1.png',
        title: 'Plant Trees with Every Tab',
        url: 'https://example.com/plant-trees'
    },
    {
        image: 'icons/ad2.png',
        title: 'Join the Green Revolution',
        url: 'https://example.com/green-revolution'
    }
];

// Create a unique listener for this tab
function tabListener(tabId, changeInfo, updatedTab) {
    if (changeInfo.status === 'complete') {
        // Get current values from storage
        chrome.storage.local.get(['totalTabs', 'treesPlanted', 'fundsCollected', 'totalTrees'], (result) => {
            const currentTabs = parseInt(result.totalTabs) || 0;
            const currentTrees = parseInt(result.treesPlanted) || 0;
            const currentFunds = parseInt(result.fundsCollected) || 0;
            const currentTotalTrees = parseInt(result.totalTrees) || 0;
            
            // Increment counters
            const newTabs = currentTabs + 1;
            const newTrees = Math.floor(newTabs / 100); // 100 tabs = 1 tree
            const newFunds = currentFunds + 1; // 1 cent per tab
            const newTotalTrees = currentTotalTrees + (newTrees - currentTrees);
            
            // Save new values to storage
            chrome.storage.local.set({
                totalTabs: newTabs,
                treesPlanted: newTrees,
                fundsCollected: newFunds,
                totalTrees: newTotalTrees
            }, () => {
                console.log('Saved to storage:', { 
                    totalTabs: newTabs, 
                    treesPlanted: newTrees,
                    fundsCollected: newFunds,
                    totalTrees: newTotalTrees
                });
                
                // Send counter update message
                chrome.tabs.sendMessage(tabId, {
                    action: 'updateCounter',
                    totalTabs: newTabs,
                    treesPlanted: newTrees,
                    fundsCollected: newFunds,
                    totalTrees: newTotalTrees,
                    newTree: newTrees > currentTrees
                }).catch(error => {
                    console.error('Error sending counter message:', error);
                    console.error('Error details:', error.stack);
                    // Don't retry counter message, it's not critical
                });

                // Send ad message if not sent before
                if (!tabMessageSent.get(tabId)) {
                    const ad = ads[Math.floor(Math.random() * ads.length)];
                    chrome.tabs.sendMessage(tabId, {
                        action: 'displayAd',
                        adData: ad
                    }).catch(error => {
                        console.error('Error sending ad message:', error);
                        console.error('Error details:', error.stack);
                        // Don't retry ad message, it's not critical
                    });
                    tabMessageSent.set(tabId, true);
                }
            });
        });
    }
}

// Listen for new tabs
chrome.tabs.onCreated.addListener((tab) => {
    console.log('New tab created:', tab.id, tab.url);
    
    // Add the tab listener
    chrome.tabs.onUpdated.addListener(tabListener);
    
    // Store the listener for cleanup
    tabUpdateListeners.set(tab.id, tabListener);
});

// Clean up listeners when tabs are removed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    // Only clean up the listeners, don't modify the counter
    const listener = tabUpdateListeners.get(tabId);
    if (listener) {
        chrome.tabs.onUpdated.removeListener(listener);
        tabUpdateListeners.delete(tabId);
    }
});