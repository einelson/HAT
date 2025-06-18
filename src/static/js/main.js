document.addEventListener('DOMContentLoaded', function() {
    const customMenu = document.getElementById('custom-menu');
    let selectedText = '';

    // Prevent the default context menu on the page
    document.addEventListener('contextmenu', function(e) {
        const selection = window.getSelection();
        selectedText = selection.toString().trim();
        
        // Only show custom menu if text is selected
        if (selectedText) {
            e.preventDefault();
            
            // Position the menu at the mouse pointer
            customMenu.style.left = `${e.pageX}px`;
            customMenu.style.top = `${e.pageY}px`;
            customMenu.style.display = 'block';
        }
    });

    // Hide menu when clicking elsewhere
    document.addEventListener('click', function() {
        customMenu.style.display = 'none';
    });

    // Handle menu item actions
    document.getElementById('action-explain').addEventListener('click', function(e) {
        e.preventDefault();
        alert(`Explain: "${selectedText}"`);
        // Implement your explanation functionality here
    });

    document.getElementById('action-summarize').addEventListener('click', function(e) {
        e.preventDefault();
        alert(`Summarize: "${selectedText}"`);
        // Implement your summarization functionality here
    });

    document.getElementById('action-research').addEventListener('click', function(e) {
        e.preventDefault();
        window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedText)}`, '_blank');
        // This action opens a search for the selected text, which is a basic research function
    });
});
