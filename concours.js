let concoursPosts = []; // Stocke les posts de concours

// Fonction pour remplir la section concours avec les posts filtrés
async function fillConcours() {
    const concoursContainer = document.getElementById('concoursContainer');
    let concoursContent = '';

    for (const post of concoursPosts) {
        if (post.media_type === "CAROUSEL_ALBUM") {
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

    concoursContainer.innerHTML = concoursContent;
}
