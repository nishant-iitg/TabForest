// Get and display the current values
chrome.storage.local.get(['totalTabs', 'treesPlanted'], function(result) {
    const tabs = parseInt(result.totalTabs) || 0;
    const trees = parseInt(result.treesPlanted) || 0;
    
    document.getElementById('popupTabsCount').textContent = tabs;
    document.getElementById('popupTreesPlanted').textContent = trees;
});
