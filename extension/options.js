// Options page script
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  const settings = await chrome.storage.sync.get(['userId', 'apiUrl', 'autoRecord']);
  
  if (settings.userId) {
    document.getElementById('userId').value = settings.userId;
  }
  
  if (settings.apiUrl) {
    document.getElementById('apiUrl').value = settings.apiUrl;
  }
  
  if (settings.autoRecord) {
    document.getElementById('autoRecord').checked = settings.autoRecord;
  }
});

// Save settings
document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userId = document.getElementById('userId').value.trim();
  const apiUrl = document.getElementById('apiUrl').value.trim();
  const autoRecord = document.getElementById('autoRecord').checked;
  
  if (!userId) {
    showMessage('Please enter a User ID', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set({
      userId,
      apiUrl,
      autoRecord
    });
    
    showMessage('Settings saved successfully!', 'success');
  } catch (error) {
    showMessage('Failed to save settings: ' + error.message, 'error');
  }
});

// Test connection
document.getElementById('testConnection').addEventListener('click', async () => {
  const apiUrl = document.getElementById('apiUrl').value.trim();
  
  if (!apiUrl) {
    showMessage('Please enter an API URL first', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${apiUrl}/api/health`, {
      method: 'GET'
    });
    
    if (response.ok) {
      showMessage('Connection successful! Server is reachable.', 'success');
    } else {
      showMessage('Connection failed: Server returned ' + response.status, 'error');
    }
  } catch (error) {
    showMessage('Connection failed: ' + error.message, 'error');
  }
});

function showMessage(message, type) {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = message;
  statusMessage.className = 'status-message ' + type;
  statusMessage.style.display = 'block';
  
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 5000);
}

