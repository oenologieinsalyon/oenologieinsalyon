let galleriePosts = []; // Stocke les posts pour la galerie

// Fonction pour remplir la galerie avec les médias des posts
async function fillGallerie() {
    const gallerieContainer = document.getElementById('gallerieContainer');
    let gallerieContent = '';

    for (const post of galleriePosts) {
        if (post.media_type === "CAROUSEL_ALBUM") {
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

    gallerieContainer.innerHTML = gallerieContent;
}
