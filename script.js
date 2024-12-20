let allPosts = []; // Variable globale pour stocker tous les posts
let visiblePosts = 6; // Nombre initial de posts visibles


// Fonction pour remplir la galerie avec tous les médias des posts contenant "Retour"
async function fillGallerie(posts) {
    const gallerieContainer = document.getElementById('gallerieContainer');

    // Filtrer les posts contenant "Retour" (insensible à la casse)
    const retourPosts = posts.filter(post => post.caption && post.caption.toLowerCase().includes("retour"));

    let gallerieContent = '';

    for (const post of retourPosts) {
        if (post.media_type === "CAROUSEL_ALBUM") {
            // Appeler l'API pour récupérer les médias d'un carrousel
            const albumMedia = await fetchAlbumMedia(post.id);
            albumMedia.forEach(media => {
                gallerieContent += `
                    <div class="card" style="width: 18rem;">
                        <img src="${media.media_url}" class="card-img-top" alt="Post image">
                    </div>
                `;
            });
        } else {
            // Si un seul média est présent (IMAGE ou VIDEO)
            gallerieContent += `
                <div class="card" style="width: 18rem;">
                    <img src="${post.media_url}" class="card-img-top" alt="Post image">
                </div>
            `;
        }
    }

    // Insérer le contenu dans la galerie
    gallerieContainer.innerHTML = gallerieContent;

    // Afficher un message si aucun post ne correspond
    if (retourPosts.length === 0) {
        gallerieContainer.innerHTML = `
            <p class="text-center">Aucun post contenant "Retour" trouvé.</p>
        `;
    }
}

// Fonction pour récupérer les médias d'un album
async function fetchAlbumMedia(mediaId) {
    try {
        const response = await fetch(`https://oenologieinsalyon.netlify.app/.netlify/functions/get-media-images?mediaId=${mediaId}`);
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération des médias de l'album :", error);
        return [];
    }
}

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

        // Remplir la gallerie avec les posts contenant "Retour"
        fillGallerie(allPosts);

    } catch (error) {
        console.error("Erreur lors du chargement des publications Instagram :", error);
    }
}
