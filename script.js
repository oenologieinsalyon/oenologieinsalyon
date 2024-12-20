let allPosts = []; // Variable globale pour stocker tous les posts
let visiblePosts = 6; // Nombre initial de posts visibles

// Ajouter un bouton "Voir plus"
function addLoadMoreButton() {
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const loadMoreButton = document.createElement('button');
    loadMoreButton.classList.add('btn', 'btn-primary');
    loadMoreButton.textContent = 'Voir plus';
    
    loadMoreButton.onclick = function() {
        loadMorePosts(); // Cette fonction sera appelée pour charger plus de posts
    };

    loadMoreContainer.appendChild(loadMoreButton);
}

// Fonction pour afficher les posts
function displayPosts(posts, postsContainer) {
    postsContainer.innerHTML = posts.map(post => `
        <div class="card" onclick="window.open('${post.permalink}', '_blank')">
            <img src="${post.media_url}" class="card-img-top" alt="Instagram post">
            <div class="card-body">
                <p class="card-text truncate">${post.caption}</p>
            </div>
        </div>
    `).join('');
}

// Fonction pour charger plus de posts
function loadMorePosts() {
    visiblePosts += 6; // Charger 6 posts supplémentaires
    const postsContainer = document.getElementById('postsContainer');
    displayPosts(allPosts.slice(0, visiblePosts), postsContainer);

    // Si tous les posts ont été affichés, retirer le bouton "Voir plus"
    if (visiblePosts >= allPosts.length) {
        document.querySelector('button.btn-primary').remove();
    }
}

// Fonction principale pour récupérer et afficher les posts
async function fetchInstagramPosts() {
    try {
        const response = await fetch('https://oenologieinsalyon.netlify.app/.netlify/functions/get-instagram-posts');
        allPosts = await response.json(); // Stocker tous les posts dans la variable globale allPosts

        const postsContainer = document.getElementById('postsContainer');

        // Afficher les premiers posts
        displayPosts(allPosts.slice(0, visiblePosts), postsContainer);

        // Ajouter le bouton "Voir plus" si nécessaire
        if (allPosts.length > visiblePosts) {
            addLoadMoreButton();
        }
    } catch (error) {
        console.error("Erreur lors du chargement des publications Instagram :", error);
    }
}
