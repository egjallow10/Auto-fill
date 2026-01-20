const listDiv = document.getElementById('profileList');

// Function to redraw the list of saved people
function render() {
  chrome.storage.local.get("profiles", (data) => {
    const profiles = data.profiles || [];
    listDiv.innerHTML = ''; // Clear current list

    profiles.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'profile-card';
      card.innerHTML = `
        <strong>${p.profileName}</strong>
        <button class="fill-btn" data-index="${i}">Fill Form with this Info</button>
        <button class="delete-btn" data-index="${i}">Delete</button>
      `;
      listDiv.appendChild(card);
    });
  });
}

// Handle the "Save" button
document.getElementById('saveBtn').addEventListener('click', () => {
  const profile = {
    profileName: document.getElementById('p_name').value,
    lastName: document.getElementById('f_last').value,
    firstName: document.getElementById('f_first').value,
    email: document.getElementById('f_email').value,
    passport: document.getElementById('f_passport').value,
    dob: document.getElementById('f_dob').value,
    phone: document.getElementById('f_phone').value,
    nationality: document.getElementById('f_nat').value
  };

  chrome.storage.local.get("profiles", (data) => {
    const profiles = data.profiles || [];
    profiles.push(profile);
    chrome.storage.local.set({ profiles }, () => {
      render();
      // Clear inputs after saving
      document.querySelectorAll('input').forEach(input => input.value = '');
    });
  });
});

// Handle clicks inside the list (Fill and Delete buttons)
listDiv.addEventListener('click', (e) => {
  const index = e.target.getAttribute('data-index');
  if (index === null) return;

  if (e.target.classList.contains('fill-btn')) {
    // FILL LOGIC
    chrome.storage.local.get("profiles", (data) => {
      const profile = data.profiles[index];
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, profile);
        }
      });
    });
  } 
  
  else if (e.target.classList.contains('delete-btn')) {
    // DELETE LOGIC
    chrome.storage.local.get("profiles", (data) => {
      const profiles = data.profiles || [];
      profiles.splice(index, 1);
      chrome.storage.local.set({ profiles }, render);
    });
  }
});

// Initial load
render();
