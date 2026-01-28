// Royal Affair functionality

function rollRoyalAffair() {
    // Get input values
    const character = document.getElementById('royalCharacter').value.trim();
    const starter = document.getElementById('royalStarter').value.trim();
    const starterTier = document.getElementById('royalCategory').value;
    
    // Check if starter tier is selected
    if (!starterTier) {
        alert('Please select a starter tier before rolling!');
        return;
    }
    
    // Get persistence level
    const persistenceRadio = document.querySelector('input[name="persistence"]:checked');
    const persistenceLevel = persistenceRadio ? persistenceRadio.value : 'none';
    
    // Get effort bonus
    const effortBonus = document.getElementById('effortBonus').checked;
    
    // Define success rates for each starter tier
    const baseSuccessRates = {
        bronze: 0.6,    // 60%
        silver: 0.5,    // 50%
        gold: 0.4,      // 40%
        platinum: 0.3,  // 30%
        chroma: 0.2     // 20%
    };
    
    // Get base success rate for selected tier
    let successRate = baseSuccessRates[starterTier];
    
    // Apply persistence bonuses
    if (persistenceLevel === 'persistence1') {
        successRate += 0.1; // +10%
    } else if (persistenceLevel === 'persistence2') {
        successRate += 0.2; // +20%
    }
    
    // Apply effort bonus
    if (effortBonus) {
        successRate += 0.05; // +5%
    }
    
    // Cap success rate at 100%
    successRate = Math.min(successRate, 1.0);
    
    // Roll for success
    const roll = Math.random();
    const isSuccess = roll < successRate;
    
    // Display results
    displayRoyalResults(character, starter, starterTier, persistenceLevel, isSuccess, successRate);
}

function displayRoyalResults(character, starter, starterTier, persistenceLevel, isSuccess, successRate) {
    const resultsDiv = document.getElementById('royal-results');
    const itemsDiv = document.getElementById('royal-items');
    
    // Format starter tier name
    const tierName = starterTier.charAt(0).toUpperCase() + starterTier.slice(1);
    const successPercentage = Math.round(successRate * 100);
    
    let resultMessage = '';
    
    // Create the main result message
    if (character && starter) {
        resultMessage += `<strong>${character}</strong> attempted to woo <strong>${starter}</strong>!`;
    } else if (character) {
        resultMessage += `<strong>${character}</strong> attempted to woo someone special!`;
    } else if (starter) {
        resultMessage += `Someone attempted to woo <strong>${starter}</strong>!`;
    } else {
        resultMessage += `A romantic attempt was made!`;
    }
    
    // Add success or failure declaration
    if (isSuccess) {
        resultMessage += ` Their attempt was <b>successful!</b>`;
    } else {
        resultMessage += ` Their attempt unfortunately <b>failed!</b>`;
    }
    
    // Add random success or failure message from breeding.js
    let outcomeMessage = '';
    if (isSuccess && breedingMessages && breedingMessages.success) {
        const successMessages = breedingMessages.success;
        const randomIndex = Math.floor(Math.random() * successMessages.length);
        outcomeMessage = successMessages[randomIndex];
    } else if (!isSuccess && breedingMessages && breedingMessages.failure) {
        const failureMessages = breedingMessages.failure;
        const randomIndex = Math.floor(Math.random() * failureMessages.length);
        outcomeMessage = failureMessages[randomIndex];
        // Add Valentine Box reward for failed attempts
        outcomeMessage += ' <a href="#valentine-box" style="color: #d63384; text-decoration: none;">x1 Valentine Box</a>';
    } else {
        // Fallback messages if breeding.js isn't loaded
        if (isSuccess) {
            outcomeMessage = 'The wooing attempt was successful!';
        } else {
            outcomeMessage = 'The wooing attempt failed. As compensation for their efforts, they have received: <a href="#valentine-box" style="color: #d63384; text-decoration: none;">x1 Valentine Box</a>';
        }
    }
    
    resultMessage += `\n\n${outcomeMessage}`;
    
    // Add vault reminder for failed attempts
    if (!isSuccess) {
        resultMessage += `\n\n<b>Don't forget to redeem your rewards at the vault!</b>`;
    }
    
    // Display as HTML to support bold formatting
    const resultHTML = `
        <div class="prompt-item">
            <p style="white-space: pre-line;">${resultMessage}</p>
        </div>
        <div class="copy-section">
            <button class="copy-button" onclick="copyRoyalResults()">Copy Results</button>
        </div>
    `;
    
    itemsDiv.innerHTML = resultHTML;
    resultsDiv.classList.remove('hidden');
}

function copyRoyalResults() {
    const itemsDiv = document.getElementById('royal-items');
    
    // Clone the div to avoid modifying the original
    const clonedDiv = itemsDiv.cloneNode(true);
    
    // Remove the copy-section from the clone
    const copySection = clonedDiv.querySelector('.copy-section');
    if (copySection) {
        copySection.remove();
    }
    
    // Wrap the content in a proper HTML structure
    const htmlToCopy = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${clonedDiv.innerHTML}</body></html>`;
    const textToCopy = clonedDiv.innerText;
    
    // Try to use the newer API first
    if (navigator.clipboard && window.ClipboardItem) {
        const clipboardItem = new ClipboardItem({
            'text/html': new Blob([htmlToCopy], { type: 'text/html' }),
            'text/plain': new Blob([textToCopy], { type: 'text/plain' })
        });
        
        navigator.clipboard.write([clipboardItem]).then(() => {
            alert('Results copied to clipboard with formatting!');
        }).catch(err => {
            console.error('Failed to copy with formatting, trying fallback: ', err);
            fallbackRoyalCopy(clonedDiv);
        });
    } else {
        fallbackRoyalCopy(clonedDiv);
    }
}

function fallbackRoyalCopy(element) {
    // Create a temporary div with the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = element.innerHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Select the content
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    try {
        // Copy with formatting
        const success = document.execCommand('copy');
        if (success) {
            alert('Results copied to clipboard with formatting!');
        } else {
            alert('Failed to copy results. Please try selecting and copying manually.');
        }
    } catch (err) {
        console.error('Failed to copy: ', err);
        alert('Failed to copy results. Please try selecting and copying manually.');
    } finally {
        document.body.removeChild(tempDiv);
        selection.removeAllRanges();
    }
}