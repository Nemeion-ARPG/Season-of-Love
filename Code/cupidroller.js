function rollCupidCubs() {
    const cubTypeSelect = document.getElementById('cubType');
    const selectedType = cubTypeSelect.value;
    
    if (!selectedType) {
        alert('Please select a cub type first!');
        return;
    }
    
    let results = {
        gender: '',
        build: '',
        coat: '',
        markings: '',
        mutations: '',
        blessings: ''
    };
    
    // Get the appropriate cub data based on selection
    let cubData;
    switch(selectedType) {
        case 'base':
            cubData = baseCub;
            break;
        case 'bronze':
            cubData = bronzeCub;
            break;
        case 'silver':
            cubData = silverCub;
            break;
        case 'gold':
            cubData = goldCub;
            break;
        case 'platinum':
            cubData = platinumCub;
            break;
        case 'chroma':
            cubData = chromaCub;
            break;
        default:
            alert('Invalid cub type selected!');
            return;
    }
    
    // Roll for each attribute
    results.gender = rollWeightedItem(cubData[selectedType + 'cubgender']);
    results.build = rollWeightedItem(cubData[selectedType + 'cubbuild']);
    results.coat = rollWeightedItem(cubData[selectedType + 'cubcoat']);
    
    // Roll for multiple markings based on cub type
    let markingCount;
    switch(selectedType) {
        case 'base':
            markingCount = 2; // exactly 2
            break;
        case 'bronze':
            markingCount = Math.floor(Math.random() * 4) + 2; // 2-5
            break;
        case 'silver':
            markingCount = Math.floor(Math.random() * 4) + 3; // 3-6
            break;
        case 'gold':
            markingCount = Math.floor(Math.random() * 5) + 4; // 4-8
            break;
        case 'platinum':
            markingCount = Math.floor(Math.random() * 6) + 5; // 5-10
            break;
        case 'chroma':
            markingCount = Math.floor(Math.random() * 5) + 6; // 6-10
            break;
    }
    
    results.markings = rollMultipleMarkings(cubData[selectedType + 'cubmarkings'], markingCount);
    
    // Roll for mutations if this cub type has them
    if (cubData[selectedType + 'cubmutations']) {
        const firstMutation = rollWeightedItem(cubData[selectedType + 'cubmutations']);
        let mutations = [firstMutation];
        
        // Check for second mutation chance
        let secondMutationChance = 0;
        if (selectedType === 'platinum') {
            secondMutationChance = 0.30; // 30% chance
        } else if (selectedType === 'chroma') {
            secondMutationChance = 0.45; // 45% chance
        }
        
        if (secondMutationChance > 0 && Math.random() < secondMutationChance) {
            // Roll for a second mutation, ensuring it's different from the first
            const availableMutations = cubData[selectedType + 'cubmutations'].filter(mutation => mutation.name !== firstMutation);
            if (availableMutations.length > 0) {
                const secondMutation = rollWeightedItem(availableMutations);
                mutations.push(secondMutation);
            }
        }
        
        results.mutations = mutations;
    }
    
    // Roll for blessings if this cub type has them
    if (cubData[selectedType + 'cubblessings']) {
        results.blessings = rollWeightedItem(cubData[selectedType + 'cubblessings']);
    }

    if (typeof window.logSeasonOfLoveRoll === 'function') {
        window.logSeasonOfLoveRoll(
            "Cupid's Cub Roller",
            {
                cubType: selectedType,
                markingCount
            },
            {
                ...results,
                markings: Array.isArray(results.markings) ? results.markings : results.markings,
                mutations: Array.isArray(results.mutations) ? results.mutations : results.mutations
            }
        );
    }
    
    // Display results
    displayCubResults(selectedType, results);
}

function rollWeightedItem(itemArray) {
    if (!itemArray || itemArray.length === 0) return 'None';
    
    const totalWeight = itemArray.reduce((sum, item) => sum + item.weight, 0);
    const randomNum = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const item of itemArray) {
        currentWeight += item.weight;
        if (randomNum <= currentWeight) {
            return item.name;
        }
    }
    
    return itemArray[itemArray.length - 1].name; // fallback
}

function rollMultipleMarkings(markingArray, count) {
    if (!markingArray || markingArray.length === 0) return ['None'];
    
    const selectedMarkings = [];
    const availableMarkings = [...markingArray]; // Create a copy to avoid modifying original
    let manicaeSelected = false; // Track if any Manicae variant has been selected
    
    for (let i = 0; i < count && availableMarkings.length > 0; i++) {
        // Roll for a marking
        const totalWeight = availableMarkings.reduce((sum, item) => sum + item.weight, 0);
        const randomNum = Math.random() * totalWeight;
        
        let currentWeight = 0;
        let selectedIndex = -1;
        
        for (let j = 0; j < availableMarkings.length; j++) {
            currentWeight += availableMarkings[j].weight;
            if (randomNum <= currentWeight) {
                selectedIndex = j;
                break;
            }
        }
        
        if (selectedIndex === -1) {
            selectedIndex = availableMarkings.length - 1; // fallback
        }
        
        const selectedMarking = availableMarkings[selectedIndex];
        
        // Check if this is a Manicae variant
        if (selectedMarking.name.startsWith('Manicae')) {
            if (manicaeSelected) {
                // Skip this roll if Manicae already selected, try again
                continue;
            } else {
                // Mark that Manicae has been selected and remove ALL Manicae variants
                manicaeSelected = true;
                selectedMarkings.push(selectedMarking.name);
                
                // Remove all Manicae variants from available markings
                for (let k = availableMarkings.length - 1; k >= 0; k--) {
                    if (availableMarkings[k].name.startsWith('Manicae')) {
                        availableMarkings.splice(k, 1);
                    }
                }
            }
        } else {
            // Add the selected marking and remove it from available options
            selectedMarkings.push(selectedMarking.name);
            availableMarkings.splice(selectedIndex, 1);
        }
    }
    
    return selectedMarkings;
}

function displayCubResults(cubType, results) {
    const resultsDiv = document.getElementById('cupid-cub-results');
    const itemsDiv = document.getElementById('cupid-cub-items');
    
    if (!resultsDiv || !itemsDiv) return;
    
    let html = `<div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h4 style="color: #2c3e50; margin: 0 0 15px 0;">https://www.deviantart.com/stash/0rp58fl7ig6</h4>        <div style="margin-bottom: 15px; font-style: italic; color: #2c3e50;">
            "Thank you, dear friend, for giving love to others this year. It always warms my heart to see our community giving back to one another!" Anthea is pleased by your efforts to spread love to others! As a reward for your kind gesture, the Caesar's wife has gifted you with the following cub!
        </div><br>
        <div style="margin-bottom: 15px; color: #2c3e50;">
            <strong>Breeder:</strong> Season of Love 2026
        </div>      <br>  <div>
            <div><strong>1)</strong> ${results.gender} Cub</div>
            <div><strong>B:</strong> ${results.build} Build</div>
            <div><strong>C:</strong> ${results.coat} Coat</div>
            <div><strong>[Hereditary Markings]:</strong> ${Array.isArray(results.markings) ? results.markings.join(', ') : results.markings}</div>`;
    
    if (results.mutations && results.mutations !== 'None') {
        const mutationsDisplay = Array.isArray(results.mutations) ? results.mutations.join(', ') : results.mutations;
        html += `<div><strong>[Mutations]:</strong> ${mutationsDisplay}</div>`;
    }
    
    if (results.blessings && results.blessings !== 'None') {
        html += `<div><strong>[Gifts]:</strong> ${results.blessings}</div>`;
    }
    
    html += `<br><div style="margin-top: 15px;"><strong>Please keep this comment as proof of ownership of your cub. A lineage will be provided upon upload.</strong></div>`;
    
    html += `</div>
        <div class="copy-section">
            <button class="copy-button" onclick="copyCubResults()">Copy Results</button>
        </div>
    </div>`;
    
    itemsDiv.innerHTML = html;
    resultsDiv.classList.remove('hidden');
}

function copyCubResults() {
    const itemsDiv = document.getElementById('cupid-cub-items');
    
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
            fallbackCubCopy(clonedDiv);
        });
    } else {
        fallbackCubCopy(clonedDiv);
    }
}

function fallbackCubCopy(element) {
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
