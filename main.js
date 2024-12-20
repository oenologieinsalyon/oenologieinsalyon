// Fonction pour ajouter le bouton "Voir plus"
function addLoadMoreButton(containerId, loadMoreFunction) {
    const loadMoreContainer = document.getElementById(containerId);
    const loadMoreButton = document.createElement('button');
    loadMoreButton.classList.add('btn', 'btn-primary');
    loadMoreButton.textContent = 'Voir plus';

    loadMoreButton.onclick = loadMoreFunction;

    loadMoreContainer.appendChild(loadMoreButton);
}

// Fonction pour récupérer les médias d'un album
async function fetchAlbumMedia(mediaId) {
    try {
        const response = await fetch(`https://oenologieinsalyon.netlify.app/.netlify/functions/get-media-images?mediaId=${mediaId}`);
        return await response.json();
    } catch (error) {
        console.error("Erreur lors du chargement des médias de l'album :", error);
        return [];
    }
}

// Fonction d'initialisation
document.addEventListener("DOMContentLoaded", function() {
    fetchInstagramPosts(); // Charge les posts dès que la page est prête
});
