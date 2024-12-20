async function fetchInstagramPosts() {
    try {
        // Appel à la fonction Netlify qui récupère les posts Instagram
        const response = await fetch('https://oenologieinsalyon.netlify.app/.netlify/functions/get-instagram-posts');
        const posts = await response.json();

        // Affichage des publications Instagram dans le DOM
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = posts.map(post => `
            <div class="col-md-4">
                <div class="card">
                    <img src="${post.media_url}" class="card-img-top" alt="Instagram post">
                    <div class="card-body">
                        <p class="card-text">${post.caption}</p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Erreur lors du chargement des publications Instagram:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    fetchInstagramPosts();
});
