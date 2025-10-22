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

// Load existing votes from server
async function loadVotes() {
    try {
        const response = await fetch('/.netlify/functions/vote');
        if (response.ok) {
            const votes = await response.json();
            updateVoteCounts(votes);
            return votes;
        }
    } catch (error) {
        console.error('Error cargando votos:', error);
    }
    return {};
}

// Update vote counts display
function updateVoteCounts(votes) {
    Object.keys(voteCounts).forEach(theme => {
        voteCounts[theme].textContent = votes[theme] || 0;
    });
}

// Handle form submission
votingForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const selectedTheme = document.querySelector('input[name="theme"]:checked');

    if (!selectedTheme) {
        alert('Por favor, selecciona una opción antes de votar.');
        return;
    }

    const theme = selectedTheme.value;

    // Disable button during submission
    voteBtn.disabled = true;
    voteBtn.textContent = 'Enviando...';

    try {
        const response = await fetch('/.netlify/functions/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme })
        });

        if (response.ok) {
            const votes = await response.json();
            updateVoteCounts(votes);

            // Show confirmation message
            confirmation.classList.remove('hidden');

            // Reset form
            votingForm.reset();

            // Hide confirmation after 3 seconds
            setTimeout(() => {
                confirmation.classList.add('hidden');
            }, 3000);
        } else {
            const error = await response.json();
            alert('Error al enviar el voto: ' + (error.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error enviando voto:', error);
        alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
        // Re-enable button
        voteBtn.disabled = false;
        voteBtn.textContent = 'Votar';
    }
});

// Load votes on page load
document.addEventListener('DOMContentLoaded', loadVotes);