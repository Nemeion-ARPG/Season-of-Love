function rollCupidGift() {
    let totalPoints = 0;
    let selectedOptions = [];
    
    // Check which entry type is selected
    const artworkRadio = document.getElementById('artworkEntry');
    const literatureRadio = document.getElementById('literatureEntry');
    
    if (artworkRadio && artworkRadio.checked) {
        // Artwork options
        if (document.getElementById('headshot')?.checked) {
            totalPoints += 5;
            selectedOptions.push('Headshot (5 pts)');
        }
        if (document.getElementById('fullBody')?.checked) {
            totalPoints += 5;
            selectedOptions.push('Full-Body (5 pts)');
        }
        if (document.getElementById('characterShading')?.checked) {
            totalPoints += 5;
            selectedOptions.push('Character Shading (5 pts)');
        }
        if (document.getElementById('simpleBackground')?.checked) {
            totalPoints += 2;
            selectedOptions.push('Simple Background (2 pts)');
        }
        if (document.getElementById('complexBackground')?.checked) {
            totalPoints += 5;
            selectedOptions.push('Complex Background (5 pts)');
        }
        if (document.getElementById('shortStory')?.checked) {
            totalPoints += 5;
            selectedOptions.push('400+ Word Short Story (5 pts)');
        }
    } else if (literatureRadio && literatureRadio.checked) {
        // Literature options
        if (document.getElementById('poem')?.checked) {
            totalPoints += 5;
            selectedOptions.push('Poem (5 pts)');
        }
        if (document.getElementById('words400')?.checked) {
            totalPoints += 10;
            selectedOptions.push('400+ Words (10 pts)');
        }
        if (document.getElementById('words800')?.checked) {
            totalPoints += 15;
            selectedOptions.push('800+ Words (15 pts)');
        }
        if (document.getElementById('words1200')?.checked) {
            totalPoints += 20;
            selectedOptions.push('1,200+ Words (20 pts)');
        }
    }
    
    // Add unbiased effort score if provided
    let effortScore = 0;
    const effortInput = artworkRadio?.checked ? 
        document.getElementById('unbiasedEffortScore') : 
        document.getElementById('unbiasedEffortScoreLit');
        
    if (effortInput && effortInput.value.trim()) {
        effortScore = parseInt(effortInput.value.trim()) || 0;
        // Validate range 1-40
        if (effortScore >= 1 && effortScore <= 40) {
            totalPoints += effortScore;
            selectedOptions.push(`Unbiased Effort Score (${effortScore} pts)`);
        } else if (effortScore > 40) {
            // Cap at 40 if user enters higher
            totalPoints += 40;
            selectedOptions.push(`Unbiased Effort Score (40 pts - capped)`);
        } else if (effortScore < 1 && effortScore !== 0) {
            // Set to 1 if user enters less than 1
            totalPoints += 1;
            selectedOptions.push(`Unbiased Effort Score (1 pt - minimum)`);
        }
    }
    
    // Add additional characters bonus if selected
    let additionalChars = 0;
    const additionalInput = artworkRadio?.checked ? 
        document.getElementById('additionalCharacters') : 
        document.getElementById('additionalCharactersLit');
        
    if (additionalInput && additionalInput.value.trim() !== '') {
        additionalChars = parseInt(additionalInput.value.trim()) || 0;
        // Validate range 0-5
        if (additionalChars >= 0 && additionalChars <= 5) {
            if (additionalChars > 0) {
                const bonus = additionalChars * 1; // 1 point per additional character
                totalPoints += bonus;
                selectedOptions.push(`Additional Characters: ${additionalChars} (${bonus} pts)`);
            } else {
                selectedOptions.push(`Additional Characters: 0 (0 pts)`);
            }
        } else if (additionalChars > 5) {
            // Cap at 5 if user enters higher
            const bonus = 5 * 1;
            totalPoints += bonus;
            selectedOptions.push(`Additional Characters: 5 (${bonus} pts - capped)`);
        } else if (additionalChars < 0) {
            // Set to 0 if user enters less than 0
            selectedOptions.push(`Additional Characters: 0 (0 pts - minimum)`);
        }
    }
    
    // Add random bonus (1-20)
    const randomBonus = Math.floor(Math.random() * 20) + 1;
    totalPoints += randomBonus;
    selectedOptions.push(`Random Bonus (${randomBonus} pts)`);
    
    // Display results
    displayCupidResults(totalPoints, selectedOptions);
}

function displayCupidResults(totalPoints, selectedOptions) {
    const resultsDiv = document.getElementById('cupid-results');
    const itemsDiv = document.getElementById('cupid-items');
    
    if (!resultsDiv || !itemsDiv) return;
    
    let html = `<div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h4 style="color: #2c3e50; margin: 0 0 10px 0;">Total Points: ${totalPoints}</h4>
    </div>`;
    
    if (selectedOptions.length > 0) {
        html += `<div style="margin-top: 15px;">
            <h4 style="color: #2c3e50; margin-bottom: 10px;">Selected Options:</h4>
            <ul style="margin: 0; padding-left: 20px;">`;
        
        selectedOptions.forEach(option => {
            html += `<li style="margin-bottom: 5px; color: #34495e;">${option}</li>`;
        });
        
        html += `</ul></div>`;
    }
    
    itemsDiv.innerHTML = html;
    resultsDiv.classList.remove('hidden');
}