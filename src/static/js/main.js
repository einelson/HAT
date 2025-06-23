document.addEventListener('DOMContentLoaded', function() {
    const customMenu = document.getElementById('custom-menu');
    const sidePanelContainer = document.querySelector('.side-panel-container');
    const sidePanelContent = document.querySelector('.side-panel-content');
    const researchTabs = document.querySelector('.research-tabs');
    const minimizedTabs = document.querySelector('.minimized-tabs');
    const container = document.querySelector('.container');
    
    let selectedText = '';
    let selectionCoords = { x: 0, y: 0 };
    let researchCounter = 0;
    let activePanelId = null;
    let researchPanels = {};
    
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
    
    // Side panel control functions
    function setupSidePanelControls() {
        // Close button
        document.querySelector('.side-panel-close').addEventListener('click', function() {
            closeSidePanel();
        });
        
        // Minimize button
        document.querySelector('.side-panel-minimize').addEventListener('click', function() {
            minimizeSidePanel();
        });
    }
    
    function openSidePanel() {
        sidePanelContainer.classList.add('open');
        container.classList.add('with-side-panel');
        document.querySelector('.side-panel-minimized').style.display = 'none';
    }
    
    function closeSidePanel() {
        sidePanelContainer.classList.remove('open');
        container.classList.remove('with-side-panel');
    }
    
    function minimizeSidePanel() {
        sidePanelContainer.classList.remove('open');
        container.classList.remove('with-side-panel');
        document.querySelector('.side-panel-minimized').style.display = 'block';
    }
    
    function createResearchPanel(id, title, content) {
        // Create a research panel with a unique ID
        researchPanels[id] = {
            id: id,
            title: title,
            content: content
        };
        
        // Create the tab
        addResearchTab(id, title);
        
        // Add minimized tab
        addMinimizedTab(id, title);
        
        // Show the panel
        openSidePanel();
        activatePanel(id);
    }
    
    function addResearchTab(id, title) {
        const tab = document.createElement('div');
        tab.className = 'research-tab';
        tab.dataset.panelId = id;
        tab.innerHTML = `
            ${title} 
            <span class="research-tab-close" data-panel-id="${id}">×</span>
        `;
        
        tab.addEventListener('click', function(e) {
            if (!e.target.classList.contains('research-tab-close')) {
                activatePanel(id);
            }
        });
        
        tab.querySelector('.research-tab-close').addEventListener('click', function(e) {
            e.stopPropagation();
            removePanel(id);
        });
        
        researchTabs.appendChild(tab);
    }
    
    function addMinimizedTab(id, title) {
        const minTab = document.createElement('div');
        minTab.className = 'minimized-tab';
        minTab.dataset.panelId = id;
        minTab.textContent = title;
        
        minTab.addEventListener('click', function() {
            openSidePanel();
            activatePanel(id);
        });
        
        minimizedTabs.appendChild(minTab);
    }
    
    function activatePanel(id) {
        // Remove active class from all tabs
        document.querySelectorAll('.research-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to selected tab
        const tab = document.querySelector(`.research-tab[data-panel-id="${id}"]`);
        if (tab) tab.classList.add('active');
        
        // Display the content
        sidePanelContent.innerHTML = researchPanels[id].content;
        activePanelId = id;
    }
    
    function removePanel(id) {
        // Remove tab
        const tab = document.querySelector(`.research-tab[data-panel-id="${id}"]`);
        if (tab) tab.remove();
        
        // Remove minimized tab
        const minTab = document.querySelector(`.minimized-tab[data-panel-id="${id}"]`);
        if (minTab) minTab.remove();
        
        // Remove from panels object
        delete researchPanels[id];
        
        // If this was the active panel, show another one or close if none left
        if (activePanelId === id) {
            const remainingPanelIds = Object.keys(researchPanels);
            if (remainingPanelIds.length > 0) {
                activatePanel(remainingPanelIds[0]);
            } else {
                closeSidePanel();
            }
        }    }

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
        
        // For research endpoint, use side panel instead of popup
        if (endpoint === 'research') {
            // Show loading in side panel if it's not already open
            if (!sidePanelContainer.classList.contains('open')) {
                openSidePanel();
            }
            
            // Create a temporary panel for loading
            const tempId = 'loading-' + Date.now();
            const shortText = text.length > 20 ? text.substring(0, 20) + '...' : text;
            createResearchPanel(tempId, 'Loading...', '<div class="loading-spinner"></div>');
            
            fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            })
            .then(response => response.json())
            .then(data => {
                // Create a proper research panel with the results
                researchCounter++;
                const panelId = 'research-' + researchCounter;
                const panelTitle = shortText;
                
                // Remove the temporary loading panel
                removePanel(tempId);
                
                // Create the actual panel with content
                createResearchPanel(panelId, panelTitle, data.result);
            })
            .catch(error => {
                console.error('Error:', error);
                // Update the loading panel with error message
                sidePanelContent.innerHTML = `<p>Error: ${error.message}</p>`;
            });
            
            // Hide the menu
            customMenu.style.display = 'none';
        } else {
            // For other endpoints, use the popup as before
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
            .then(response => response.json())            .then(data => {
                // Apply the response data directly as HTML
                popup.querySelector('.popup-content').innerHTML = data.result;
                popup.querySelector('.popup-content').classList.add('html-content');
                
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
    }

    // Handle menu item actions
    document.getElementById('action-explain').addEventListener('click', function(e) {
        e.preventDefault();
        callPythonFunction('explain', selectedText);
    });

    document.getElementById('action-summarize').addEventListener('click', function(e) {
        e.preventDefault();
        callPythonFunction('summarize', selectedText);
    });      document.getElementById('action-define').addEventListener('click', function(e) {
        e.preventDefault();
        callPythonFunction('define', selectedText);
    });

    document.getElementById('action-research').addEventListener('click', function(e) {
        e.preventDefault();
        callPythonFunction('research', selectedText);
    });
    
    // Initialize side panel controls
    setupSidePanelControls();
    
    // Initially hide the minimized tabs container
    document.querySelector('.side-panel-minimized').style.display = 'none';
});
