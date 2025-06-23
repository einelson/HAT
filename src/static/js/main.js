document.addEventListener('DOMContentLoaded', function() {
    const customMenu = document.getElementById('custom-menu');
    let selectedText = '';
    let selectionCoords = { x: 0, y: 0 };
    
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'text-popup';
    popup.innerHTML = `
        <div class="popup-content"></div>
        <button class="close-popup">×</button>
    `;
    document.body.appendChild(popup);
    
    // Close popup handler
    popup.querySelector('.close-popup').addEventListener('click', function() {
        popup.style.display = 'none';
    });

    // Prevent the default context menu on the page
    document.addEventListener('contextmenu', function(e) {
        const selection = window.getSelection();
        selectedText = selection.toString().trim();
        
        // Only show custom menu if text is selected
        if (selectedText) {
            e.preventDefault();
            
            // Store selection coordinates for popup positioning
            selectionCoords.x = e.pageX;
            selectionCoords.y = e.pageY;
            
            // Position the menu at the mouse pointer
            customMenu.style.left = `${e.pageX}px`;
            customMenu.style.top = `${e.pageY}px`;
            customMenu.style.display = 'block';
        }
    });

    // Hide menu when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!customMenu.contains(e.target) && !popup.contains(e.target)) {
            customMenu.style.display = 'none';
        }
    });

    // Function to make API requests
    function callPythonFunction(endpoint, text) {
        // Add spinner styles if not already present
        if (!document.getElementById('spinner-styles')) {
            const spinnerStyle = document.createElement('style');
            spinnerStyle.id = 'spinner-styles';
            spinnerStyle.textContent = `
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    margin: 20px auto;
                    border: 4px solid rgba(0, 0, 0, 0.1);
                    border-radius: 50%;
                    border-top: 4px solid #3498db;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(spinnerStyle);
        }
        
        // Show loading spinner before fetching
        popup.querySelector('.popup-content').innerHTML = '<div class="loading-spinner"></div>';
        popup.style.left = `${selectionCoords.x + 10}px`;
        popup.style.top = `${selectionCoords.y - 10}px`;
        popup.style.display = 'block';
        
        // Hide the menu immediately
        customMenu.style.display = 'none';
        
        fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        })
        .then(response => response.json())
        .then(data => {
            // Skip markdown processing and directly render HTML
            
            // Apply the response data directly as HTML
            popup.querySelector('.popup-content').innerHTML = data.result;
            popup.querySelector('.popup-content').classList.add('html-content');
            
            // Add CSS for better HTML content display
            const style = document.createElement('style');
            style.textContent = `
                .html-content {
                    font-family: Arial, sans-serif;
                    line-height: 1.4;
                }
                .html-content p { 
                    margin: 0.5em 0; 
                }
                .html-content ul, .html-content ol { 
                    margin: 0.5em 0; 
                    padding-left: 2em; 
                }
                .html-content li { 
                    margin: 0.2em 0; 
                }
                .html-content h1, .html-content h2, .html-content h3 {
                    margin-top: 0.7em;
                    margin-bottom: 0.5em;
                }
            `;
            popup.querySelector('.popup-content').appendChild(style);
            
            // Position and show popup next to the selection
            popup.style.left = `${selectionCoords.x + 10}px`;
            popup.style.top = `${selectionCoords.y - 10}px`;
            popup.style.display = 'block';
            
            // Hide the menu
            customMenu.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Handle menu item actions
    document.getElementById('action-explain').addEventListener('click', function(e) {
        e.preventDefault();
        callPythonFunction('explain', selectedText);
    });

    document.getElementById('action-summarize').addEventListener('click', function(e) {
        e.preventDefault();
        callPythonFunction('summarize', selectedText);
    });
    
    document.getElementById('action-define').addEventListener('click', function(e) {
        e.preventDefault();
        callPythonFunction('define', selectedText);
    });

    document.getElementById('action-research').addEventListener('click', function(e) {
        e.preventDefault();
        callPythonFunction('research', selectedText);
    });
});
