// Compassion Prompts functionality

function rollCompassionPrompt() {
    // Check if a prompt is selected
    const promptSelect = document.getElementById('promptSelect');
    const selectedPrompt = promptSelect.value;
    
    if (!selectedPrompt) {
        alert('Please select a compassion prompt before rolling!');
        return;
    }
    
    // Get character names and player names from input boxes
    const char1 = document.getElementById('char1').value.trim();
    const char2 = document.getElementById('char2').value.trim();
    const char3 = document.getElementById('char3').value.trim();
    const player1 = document.getElementById('player1').value.trim();
    const player2 = document.getElementById('player2').value.trim();
    const player3 = document.getElementById('player3').value.trim();
    
    const characters = [
        { char: char1, player: player1 },
        { char: char2, player: player2 },
        { char: char3, player: player3 }
    ].filter(entry => entry.char !== '');
    
    const characterNames = characters.map(entry => entry.char);
    
    // Get the actual prompt text from prompts.js
    let promptText = '';
    if (compassionPrompts && compassionPrompts[selectedPrompt] && compassionPrompts[selectedPrompt].length > 0) {
        promptText = compassionPrompts[selectedPrompt][0]; // Get the first (and likely only) prompt
    } else {
        promptText = 'Prompt text not found.';
    }
    
    // Check if effort loot is enabled
    const effortLootEnabled = document.getElementById('effortLootCheck').checked;
    const lootSource = effortLootEnabled ? itemData.effortloot : itemData.loot;
    
    // Roll separate rewards for each character
    const characterRewards = [];
    if (characters.length > 0) {
        characters.forEach(character => {
            // Roll for currency items (1-10, weighted toward 1-5)
            const currencyCount = rollWeightedCurrency();
            const currencyItems = rollItems(itemData.currency, currencyCount);
            
            // Roll for loot items (1-4) from selected source
            const lootCount = Math.floor(Math.random() * 4) + 1;
            const lootItems = rollItems(lootSource, lootCount);
            
            characterRewards.push({
                name: character.char,
                player: character.player,
                currencyItems: currencyItems,
                lootItems: lootItems
            });
        });
    } else {
        // If no characters, roll once for general rewards
        const currencyCount = rollWeightedCurrency();
        const currencyItems = rollItems(itemData.currency, currencyCount);
        
        const lootCount = Math.floor(Math.random() * 4) + 1;
        const lootItems = rollItems(lootSource, lootCount);
        
        characterRewards.push({
            name: '',
            currencyItems: currencyItems,
            lootItems: lootItems
        });
    }
    
    // Display results
    displayCompassionResults(promptText, characterRewards);
}

function rollItems(itemArray, count) {
    const rolledItems = [];
    
    for (let i = 0; i < count; i++) {
        if (itemArray && itemArray.length > 0) {
            const randomIndex = Math.floor(Math.random() * itemArray.length);
            const item = itemArray[randomIndex];
            rolledItems.push({
                name: item.name,
                link: item.link || '#'
            });
        }
    }
    
    return rolledItems;
}

function rollWeightedCurrency() {
    // Weighted roll that favors 1-5 over 6-10
    // 70% chance for 1-5, 30% chance for 6-10
    const random = Math.random();
    
    if (random < 0.7) {
        // Roll 1-5
        return Math.floor(Math.random() * 5) + 1;
    } else {
        // Roll 6-10
        return Math.floor(Math.random() * 5) + 6;
    }
}

function displayCompassionResults(promptText, characterRewards) {
    const resultsDiv = document.getElementById('compassion-results');
    const itemsDiv = document.getElementById('compassion-items');
    
    let resultHTML = '';
    
    // Add character names in bold if any are provided
    const characterNames = characterRewards.map(reward => reward.name).filter(name => name !== '');
    if (characterNames.length > 0) {
        const characterText = characterNames.join(' & ');
        resultHTML += `
            <div class="prompt-item">
                <p><strong>${characterText}</strong> ${promptText}</p><br>
            </div>
        `;
    } else {
        resultHTML += `
            <div class="prompt-item">
                <p>${promptText}</p><br>
            </div>
        `;
    }
    
    // Display rewards for each character
    characterRewards.forEach(characterReward => {
        const allItems = [...characterReward.currencyItems, ...characterReward.lootItems];
        
        if (allItems.length > 0) {
            // Count item quantities
            const itemCounts = {};
            allItems.forEach(item => {
                const key = item.name;
                if (itemCounts[key]) {
                    itemCounts[key].count++;
                } else {
                    itemCounts[key] = {
                        count: 1,
                        link: item.link
                    };
                }
            });
            
            // Add character-specific rewards section
            if (characterReward.name) {
                let displayName = characterReward.name;
                if (characterReward.player) {
                    displayName += ` ( ${characterReward.player} )`;
                }
                resultHTML += `
                    <div class="rewards-section">
                        <h4>${displayName}'s earned:</h4>
                        <ul>
                `;
            } else {
                resultHTML += `
                    <div class="rewards-section">
                        <h4>Rewards:</h4>
                        <ul>
                `;
            }
            
            // Display items with quantities
            Object.keys(itemCounts).forEach(itemName => {
                const item = itemCounts[itemName];
                const quantityText = item.count > 1 ? `x${item.count} ` : '';
                
                if (item.link && item.link !== '#') {
                    resultHTML += `<li><a href="${item.link}" target="_blank">${quantityText}${itemName}</a></li>`;
                } else {
                    resultHTML += `<li>${quantityText}${itemName}</li>`;
                }
            });
            
            resultHTML += `
                    </ul>
                </div>
            `;
        }
    });
    
    // Add vault reminder message
    resultHTML += `
        <div class="vault-reminder">
            <p><strong>Don't forget to redeem your rewards at the vault!</strong></p>
        </div>
    `;
    
    // Add copy functionality
    resultHTML += `
        <div class="copy-section">
            <button class="copy-button" onclick="copyCompassionResults()">Copy Results</button>
        </div>
    `;
    
    itemsDiv.innerHTML = resultHTML;
    resultsDiv.classList.remove('hidden');
}

function copyCompassionResults() {
    const itemsDiv = document.getElementById('compassion-items');
    
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
            fallbackCopy(clonedDiv);
        });
    } else {
        fallbackCopy(clonedDiv);
    }
}

function fallbackCopy(element) {
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
