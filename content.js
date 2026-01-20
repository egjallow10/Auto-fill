console.log("Autofill Content Script Loaded!");

chrome.runtime.onMessage.addListener((profile, sender, sendResponse) => {
  const inputs = document.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    // 1. Get the text from the label or surrounding area
    const labelText = findLabelText(input).toLowerCase();
    
    // 2. Get other attributes (in case the label is hard to find)
    const placeholder = input.getAttribute('placeholder')?.toLowerCase() || "";
    const nameAttr = input.getAttribute('name')?.toLowerCase() || "";
    const idAttr = input.id.toLowerCase();

    // Combine all identifiers to check against keywords
    const searchString = `${labelText} ${placeholder} ${nameAttr} ${idAttr}`;

    // --- MATCHING LOGIC ---

    // Passport Number
    if (searchString.includes("passport")) {
      input.value = profile.passport;
    }
    // Last Name
    else if (searchString.includes("last name") || searchString.includes("family name")) {
      input.value = profile.lastName;
    }
    // First Name
    else if (searchString.includes("first name") || searchString.includes("given name")) {
      input.value = profile.firstName;
    }
    // Email (but not the repeat one)
    else if (searchString.includes("email") && !searchString.includes("repeat") && !searchString.includes("confirm")) {
      input.value = profile.email;
    }
    // Repeat Email
    else if (searchString.includes("repeat email") || searchString.includes("confirm email")) {
      input.value = profile.email;
    }
    // Date of Birth
    else if (searchString.includes("birth") || searchString.includes("dob")) {
      input.value = profile.dob;
    }
    // Phone
    else if (searchString.includes("phone") || searchString.includes("mobile") || searchString.includes("tel")) {
      input.value = profile.phone;
    }
    // Nationality
    else if (searchString.includes("nationality")) {
      input.value = profile.nationality;
    }

    // Trigger events so the website saves the data
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  });

  sendResponse({status: "done"});
});

// Improved function to find the label text for an input
function findLabelText(input) {
  // Strategy 1: Look for <label for="ID">
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.innerText;
  }

  // Strategy 2: Look at the parent element's text (common in table-based forms)
  let parentText = input.parentElement ? input.parentElement.innerText : "";
  
  // Strategy 3: Look at the text of the cell to the left (if it's a table)
  let tableCellText = "";
  const td = input.closest('td');
  if (td && td.previousElementSibling) {
    tableCellText = td.previousElementSibling.innerText;
  }

  return `${parentText} ${tableCellText}`;
}
