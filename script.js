// Get DOM elements
const votingForm = document.getElementById('voting-form');
const voteBtn = document.getElementById('vote-btn');
const confirmation = document.getElementById('confirmation');
const voteCounts = {
    'La purga': document.getElementById('count-purga'),
    'F1': document.getElementById('count-f1'),
    'Hombres de negro': document.getElementById('count-hombres-negro'),
    'Oxxo': document.getElementById('count-oxxo'),
    'Minecraft': document.getElementById('count-minecraft')
};

// Load existing votes from localStorage
function loadVotes() {
    const storedVotes = JSON.parse(localStorage.getItem('halloweenVotes')) || {};
    Object.keys(voteCounts).forEach(theme => {
        const count = storedVotes[theme] || 0;
        voteCounts[theme].textContent = count;
    });
    return storedVotes;
}

// Save votes to localStorage
function saveVotes(votes) {
    localStorage.setItem('halloweenVotes', JSON.stringify(votes));
}

// Update vote counts display
function updateVoteCounts(votes) {
    Object.keys(voteCounts).forEach(theme => {
        voteCounts[theme].textContent = votes[theme] || 0;
    });
}

// Handle form submission
votingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const selectedTheme = document.querySelector('input[name="theme"]:checked');
    
    if (!selectedTheme) {
        alert('Por favor, selecciona una opción antes de votar.');
        return;
    }
    
    const theme = selectedTheme.value;
    const votes = loadVotes();
    
    // Increment vote count
    votes[theme] = (votes[theme] || 0) + 1;
    
    // Save and update display
    saveVotes(votes);
    updateVoteCounts(votes);
    
    // Show confirmation message
    confirmation.classList.remove('hidden');
    
    // Reset form
    votingForm.reset();
    
    // Hide confirmation after 3 seconds
    setTimeout(() => {
        confirmation.classList.add('hidden');
    }, 3000);
});

// Load votes on page load
document.addEventListener('DOMContentLoaded', loadVotes);