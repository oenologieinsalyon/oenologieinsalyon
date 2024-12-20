let allPosts = []; // Variable globale pour stocker tous les posts
let visiblePosts = 5; // Nombre initial de posts visibles
let eventPosts = []; // Variable globale pour stocker les posts d'événements
let galleriePosts = []; // Variable globale pour stocker les posts pour la galerie
let concoursPosts = []; // Variable globale pour stocker les posts des concours


// Fonction pour remplir la galerie avec tous les médias des posts contenant "Retour"
async function fillGallerie() {
    const gallerieContainer = document.getElementById('gallerieContainer');

    let gallerieContent = '';

    for (const post of galleriePosts) {
        if (post.media_type === "CAROUSEL_ALBUM") {
            // Appeler l'API pour récupérer les médias d'un carrousel
            const albumMedia = await fetchAlbumMedia(post.id);
            albumMedia.forEach(media => {
                if (media.media_type === "IMAGE") {
                    gallerieContent += `
                        <div class="card">
                            <img src="${media.media_url}" class="card-img-top" alt="Post image">
                        </div>
                    `;
                } else if (media.media_type === "VIDEO") {
                    gallerieContent += `
                        <div class="card">
                            <video class="card-img-top" controls muted>
                                <source src="${media.media_url}" type="video/mp4">
                                Votre navigateur ne supporte pas la lecture des vidéos.
                            </video>
                        </div>
                    `;
                }
            });
        } else if (post.media_type === "IMAGE") {
            gallerieContent += `
                <div class="card">
                    <img src="${post.media_url}" class="card-img-top" alt="Post image">
                </div>
            `;
        } else if (post.media_type === "VIDEO") {
            gallerieContent += `
                <div class="card">
                    <video class="card-img-top" controls muted>
                        <source src="${post.media_url}" type="video/mp4">
                        Votre navigateur ne supporte pas la lecture des vidéos.
                    </video>
                </div>
            `;
        }
    }

    // Insérer le contenu dans la galerie
    gallerieContainer.innerHTML = gallerieContent;

    // Afficher un message si aucun post ne correspond
    if (galleriePosts.length === 0) {
        gallerieContainer.innerHTML = `
            <p class="text-center">Aucun post contenant "Retour" trouvé.</p>
        `;
    }
}


// Fonction pour remplir la section concours avec les posts filtrés
async function fillConcours() {
    const concoursContainer = document.getElementById('concoursContainer');

    let concoursContent = '';

    for (const post of concoursPosts) {
        if (post.media_type === "CAROUSEL_ALBUM") {
            // Appeler l'API pour récupérer les médias d'un carrousel
            const albumMedia = await fetchAlbumMedia(post.id);
            albumMedia.forEach(media => {
                if (media.media_type === "IMAGE") {
                    concoursContent += `
                        <div class="card">
                            <img src="${media.media_url}" class="card-img-top" alt="Post image">
                        </div>
                    `;
                } else if (media.media_type === "VIDEO") {
                    concoursContent += `
                        <div class="card">
                            <video class="card-img-top" controls muted>
                                <source src="${media.media_url}" type="video/mp4">
                                Votre navigateur ne supporte pas la lecture des vidéos.
                            </video>
                        </div>
                    `;
                }
            });
        } else if (post.media_type === "IMAGE") {
            concoursContent += `
                <div class="card">
                    <img src="${post.media_url}" class="card-img-top" alt="Post image">
                </div>
            `;
        } else if (post.media_type === "VIDEO") {
            concoursContent += `
                <div class="card">
                    <video class="card-img-top" controls muted>
                        <source src="${post.media_url}" type="video/mp4">
                        Votre navigateur ne supporte pas la lecture des vidéos.
                    </video>
                </div>
            `;
        }
    }

    // Insérer le contenu dans la section concours
    concoursContainer.innerHTML = concoursContent;

    // Afficher un message si aucun post ne correspond
    if (concoursPosts.length === 0) {
        concoursContainer.innerHTML = `
            <p class="text-center">Aucun post contenant "concours", "trophée" ou "classement" trouvé.</p>
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
    const loadMoreEventsContainer = document.getElementById('loadMoreEventsContainer');
    const loadMoreButton = document.createElement('button');
    loadMoreButton.classList.add('btn', 'btn-primary');
    loadMoreButton.textContent = 'Voir plus';
    
    loadMoreButton.onclick = function() {
        loadMorePosts(); // Cette fonction sera appelée pour charger plus de posts
    };

    loadMoreEventsContainer.appendChild(loadMoreButton);
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
    visiblePosts += 5; // Charger 5 posts supplémentaires
    const postsContainer = document.getElementById('postsContainer');
    displayPosts(eventPosts.slice(0, visiblePosts), postsContainer);

    // Si tous les posts ont été affichés, retirer le bouton "Voir plus"
    if (visiblePosts >= eventPosts.length) {
        document.querySelector('button.btn-primary').remove();
    }
}

// Fonction principale pour récupérer et afficher les posts
async function fetchInstagramPosts() {
    try {
        const response = await fetch('https://oenologieinsalyon.netlify.app/.netlify/functions/get-instagram-posts');
        allPosts = await response.json(); // Stocker tous les posts dans la variable globale allPosts

        // Filtrer les posts pour les événements, concours et galerie
        eventPosts = allPosts.filter(post => {
            const caption = post.caption ? post.caption.toLowerCase() : '';
            const keywords = ["Dégustation", "Hello à tous", "Masterclass", "propose", "Accord", "Salut à tous"];
            return (
                keywords.some(keyword => caption.includes(keyword.toLowerCase())) &&
                !caption.includes("retour") &&
                !caption.includes("concours") &&
                !caption.includes("trophée")
            );
        });

        galleriePosts = allPosts.filter(post => post.caption && post.caption.includes("Retour"));

        concoursPosts = allPosts.filter(post => {
            const caption = post.caption ? post.caption.toLowerCase() : '';
            return (
                (caption.toLowerCase().includes("concours") || caption.toLowerCase().includes("trophée") || caption.toLowerCase().includes("équipe"))
            );
        });

        const postsContainer = document.getElementById('postsContainer');

        // Afficher les premiers posts d'événements
        displayPosts(eventPosts.slice(0, visiblePosts), postsContainer);

        // Ajouter le bouton "Voir plus" si nécessaire
        if (eventPosts.length > visiblePosts) {
            addLoadMoreButton();
        }

        // Remplir la galerie avec les posts contenant "Retour"
        fillGallerie();

        // Remplir la section concours avec les posts des concours
        fillConcours();

    } catch (error) {
        console.error("Erreur lors du chargement des publications Instagram :", error);
    }
}
