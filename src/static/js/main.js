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
        fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        })
        .then(response => response.json())
        .then(data => {
            // Display the result in the popup
            popup.querySelector('.popup-content').textContent = data.result;
            
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
