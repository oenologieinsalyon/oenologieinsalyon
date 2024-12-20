let visibleEvents = 5; // Nombre initial d'événements visibles
let eventPosts = []; // Stocke les posts d'événements

// Fonction pour afficher les posts événements
function displayPosts(posts, container) {
    container.innerHTML = posts.map(post => `
        <div class="card" onclick="window.open('${post.permalink}', '_blank')">
            <img src="${post.media_url}" class="card-img-top" alt="Instagram post">
            <div class="card-body">
                <p class="card-text truncate">${post.caption}</p>
            </div>
        </div>
    `).join('');
}

// Fonction pour charger plus d'événements
function loadMoreEvents() {
    visibleEvents += 5; // Charger 5 événements supplémentaires
    displayPosts(eventPosts.slice(0, visibleEvents), document.getElementById('postsContainer'));

    // Si tous les événements ont été affichés, retirer le bouton "Voir plus"
    if (visibleEvents >= eventPosts.length) {
        document.querySelector('#loadMoreEventsContainer button').remove();
    }
}
