let allPosts = []; // Variable globale pour stocker tous les posts
let visiblePosts = 5; // Nombre initial de posts visibles
let visibleGalleriePosts = 6; // Nombre initial de posts visibles dans la galerie
let visibleConcoursPosts = 6; // Nombre initial de posts visibles dans la section concours
let eventPosts = []; // Variable globale pour stocker les posts d'événements
let galleriePosts = []; // Variable globale pour stocker les posts pour la galerie
let concoursPosts = []; // Variable globale pour stocker les posts des concours



async function fillEvents() {
    const eventsContainer = document.getElementById('eventsContainer');

    let eventsContent = '';

    for (const post of eventPosts.slice(0, visiblePosts)) {
        eventsContent += `<div class="card" onclick="window.open('${post.permalink}', '_blank')">
            <img src="${post.media_url}" class="card-img-top" alt="Instagram event">
            <div class="card-body">
                <p class="card-text truncate">${post.caption}</p>
            </div>
        </div>`;
    }

    eventsContainer.innerHTML = eventsContent;

    if (eventPosts.length === 0) {
        eventsContainer.innerHTML = `<p class="text-center">Aucun événement trouvé.</p>`;
    }
}

async function getAllMediaFromPosts(posts) {
    const allMedia = [];

    for (const post of posts) {
        if (post.media_type === "CAROUSEL_ALBUM") {
            // Récupérer tous les médias d'un album
            const albumMedia = await fetchAlbumMedia(post.id);
            allMedia.push(...albumMedia);
        } else {
            // Ajouter directement les posts individuels
            allMedia.push(post);
        }
    }

    return allMedia;
}

async function fillCarousel(carouselId, posts) {
    const carouselTrack = document.getElementById(carouselId);

    // Récupère tous les médias
    const allMedia = await getAllMediaFromPosts(posts);

    allMedia.forEach(media => {
        carouselTrack.appendChild(generateMediaCard(media));
    });

    setupCarouselControls(carouselId); // Initialise les boutons
}

function setupCarouselControls(carouselId, currentIndex = 0) {
    const track = document.getElementById(carouselId);
    const prevBtn = document.querySelector(".carousel-control-prev[data-bs-target='#" + carouselId + "']");
    const nextBtn = document.querySelector(".carousel-control-next[data-bs-target='#" + carouselId + "']");
    let itemWidth = track.children[currentIndex].offsetWidth;

    function updateCarousel(track, currentIndex) {
        // Largeur d'un élément (sera ajustée dynamiquement)
        let itemWidth = track.children[currentIndex].offsetWidth;
        track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }

    prevBtn.addEventListener("click", () => {
        currentIndex = Math.max(currentIndex - 1, 0);
        updateCarousel(track, currentIndex);
    });

    nextBtn.addEventListener("click", () => {
        const maxIndex = track.children.length - Math.floor(track.offsetWidth / itemWidth);
        currentIndex = Math.min(currentIndex + 1, maxIndex);
        updateCarousel(track, currentIndex);
    });

    // Recalculer la largeur des items si la fenêtre change de taille
    window.addEventListener("resize", () => {
        updateCarousel(track, currentIndex);
    });
}


// Fonction pour générer un élément de carte (image ou vidéo)
function generateMediaCard(media) {
    let card = '';
    if (media.media_type === "IMAGE") {
        card = `<img src="${media.media_url}" class="p-1 overflow-hidden" alt="Image">`;
    } else if (media.media_type === "VIDEO") {
        card = `
            <video class="p-1 overflow-hidden" controls muted>
                <source src="${media.media_url}" type="video/mp4">
                Votre navigateur ne supporte pas la lecture des vidéos.
            </video>`;
    }

    // Convertir le string HTML en élément DOM pour attacher les événements
    const template = document.createElement('template');
    template.innerHTML = card.trim(); // trim() pour éviter des espaces indésirables
    const element = template.content.firstChild;

    // Ajouter un gestionnaire de clic pour afficher dans la modal
    element.addEventListener('click', function () {
        displayInModal(media);
    });

    return element;
}

function displayInModal(media) {
    console.log(media);
    const modalContent = document.getElementById('modalContent');
    const mediaModal = new bootstrap.Modal(document.getElementById('mediaModal'));

    // Nettoyer le contenu précédent
    modalContent.innerHTML = '';

    if (media.media_type === "IMAGE") {
        const img = document.createElement('img');
        img.src = media.media_url;
        img.alt = "Aperçu";
        img.classList.add('img-fluid');
        modalContent.appendChild(img);
    } else if (media.media_type === "VIDEO") {
        const video = document.createElement('video');
        video.src = media.media_url;
        video.controls = true;
        video.autoplay = true;
        video.classList.add('w-100');
        modalContent.appendChild(video);
    }

    mediaModal.show();
}


// Fonction pour récupérer les médias d'un album via son mediaId
async function fetchAlbumMedia(mediaId) {
    try {
        const response = await fetch(`https://oenologieinsalyon.netlify.app/.netlify/functions/get-media-images?mediaId=${mediaId}`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();

        // Vérifiez si `data` est un tableau et contient les médias attendus
        if (Array.isArray(data)) {
            return data.map(media => ({
                media_type: media.media_type,
                media_url: media.media_url,
            }));
        }

        console.error("Le format des données récupérées n'est pas valide :", data);
        return [];
    } catch (error) {
        console.error("Erreur lors de la récupération des médias de l'album :", error);
        return [];
    }
}

// Ajouter un bouton "Voir plus"
function addLoadMoreEventsButton() {
    const loadMoreEventsContainer = document.getElementById('loadMoreEventsContainer');
    const loadMoreButton = document.createElement('button');
    loadMoreButton.classList.add('btn', 'btn-primary');
    loadMoreButton.textContent = 'Voir plus';

    loadMoreButton.onclick = function () {
        loadMoreEvents(); // Cette fonction sera appelée pour charger plus de events
    };

    loadMoreEventsContainer.appendChild(loadMoreButton);
}

// Fonction pour charger plus de posts
function loadMoreEvents() {
    visiblePosts += 5; // Charger 5 posts supplémentaires
    fillEvents(); // Remplir les posts

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


        // Afficher les premiers posts d'événements
        fillEvents();

        // Ajouter le bouton "Voir plus" si nécessaire
        if (eventPosts.length > visiblePosts) {
            addLoadMoreEventsButton();
        }

        // Remplir les carrousels
        fillCarousel('gallerieTrack', galleriePosts);
        fillCarousel('concoursTrack', concoursPosts);

    } catch (error) {
        console.error("Erreur lors du chargement des publications Instagram :", error);
    }
}
