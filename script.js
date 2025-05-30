let allPosts = [];
let visiblePosts = 6;
let visiblegaleriePosts = 8;
let visibleConcoursPosts = 6;
let eventPosts = [];
let galeriePosts = [];
let concoursPosts = [];
const albumMediaCache = {};

function hideLoader(loaderId) {
    const loader = document.getElementById(loaderId);
    if (loader) {
        loader.style.display = 'none';
    }
}

async function fillEvents() {
    const eventsContainer = document.getElementById('eventsContainer');
    eventsContainer.innerHTML = ''; // Vider le conteneur
    const fragment = document.createDocumentFragment();
    const newItems = [];

    for (const post of eventPosts.slice(0, visiblePosts)) {
        const card = document.createElement('div');
        card.className = "max-w-sm bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer new-item";
        card.onclick = () => window.open(post.permalink, '_blank');

        card.innerHTML = `
            <img src="${post.media_url}" class="w-full object-cover" alt="Instagram event">
            <div class="p-4">
                <p class="text-gray-700 line-clamp-3 text-left">${post.caption || 'Aucun texte disponible'}</p>
            </div>`;

        fragment.appendChild(card);
        newItems.push(card);
    }

    eventsContainer.appendChild(fragment);

    if (eventPosts.length === 0) {
        eventsContainer.innerHTML = `<p class="text-center text-gray-600">Aucun événement trouvé.</p>`;
    }

    hideLoader('instagramEventLoader');

    // Animation des éléments initiaux (comme dans loadMoreEvents)
    setTimeout(() => {
        newItems.forEach(item => item.classList.add('animate'));
    }, 50);

    return waitForImagesLoaded(eventsContainer);
}

function waitForImagesLoaded(container) {
    return new Promise((resolve) => {
        const images = container.querySelectorAll('img');

        if (images.length === 0) {
            resolve();
            return;
        }

        const imagePromises = Array.from(images).map(img => {
            return new Promise(imageResolve => {
                if (img.complete) {
                    imageResolve();
                } else {
                    img.onload = imageResolve;
                    img.onerror = imageResolve;
                }
            });
        });

        Promise.all(imagePromises).then(resolve);

        setTimeout(resolve, 5000);
    });
}

function loadMoreEvents() {

    setTimeout(() => {
        visiblePosts += 6;
        fillEvents();

        if (visiblePosts >= eventPosts.length) {
            document.getElementById('loadMoreEventsContainer').innerHTML = '';
        } else {
            addLoadMoreEventsButton();
        }
    }, 800);
}

async function fetchInstagramPosts() {
    try {
        const cachedData = localStorage.getItem('instagramCache');
        const cacheTimestamp = localStorage.getItem('instagramCacheTimestamp');
        const now = Date.now();
        const cacheAge = now - (cacheTimestamp || 0);
        const cacheValid = cacheTimestamp && cacheAge < 3600000;

        if (cachedData && cacheValid) {
            allPosts = JSON.parse(cachedData);
        } else {
            const response = await fetch('https://oenologieinsalyon.netlify.app/.netlify/functions/get-instagram-posts');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Les données récupérées ne sont pas un tableau");
            }

            allPosts = data;

            localStorage.setItem('instagramCache', JSON.stringify(allPosts));
            localStorage.setItem('instagramCacheTimestamp', now.toString());
        }

        processInstagramPosts();

        await Promise.all([
            loadEventsSection(),
            loadGallerySection(),
            loadContestsSection()
        ]);

    } catch (error) {
        document.getElementById('eventsContainer').innerHTML = `<p class="text-center">Erreur lors de la récupération des posts.</p>`;
    }
}

function processInstagramPosts() {
    eventPosts = [];
    galeriePosts = [];
    concoursPosts = [];

    allPosts.forEach(post => {
        const caption = post.caption ? post.caption.toLowerCase() : '';

        const eventKeywords = ["dégustation", "hello à tous", "masterclass", "propose", "accord", "salut à tous"];
        const isEvent = eventKeywords.some(keyword => caption.includes(keyword.toLowerCase())) &&
            !caption.includes("retour") &&
            !caption.includes("concours") &&
            !caption.includes("trophée");

        const isGallery = caption.includes("retour");

        const isContest = (caption.includes("concours") ||
            caption.includes("trophée") ||
            caption.includes("équipe")) &&
            !caption.includes("ag ");

        if (isEvent) eventPosts.push(post);
        if (isGallery) galeriePosts.push(post);
        if (isContest) concoursPosts.push(post);
    });
}

function addLoadMoreGalleryButton() {
    const loadMoreContainer = document.getElementById('loadMoreGallerieContainer');
    loadMoreContainer.innerHTML = `
        <button class="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition mt-8" onclick="loadMoreGallery()">
            Voir plus
        </button>`;
}

function loadMoreGallery() {
    try {
        visiblegaleriePosts += 4;
        fillCarousel('galerieTrack', galeriePosts, visiblegaleriePosts);

        if (visiblegaleriePosts >= galeriePosts.length) {
            document.getElementById('loadMoreGallerieContainer').innerHTML = '';
        } else {
            addLoadMoreGalleryButton();
        }
    } catch (error) {
        addLoadMoreGalleryButton();
    }
}

function addLoadMoreContestButton() {
    const loadMoreContainer = document.getElementById('loadMoreConcoursContainer');
    loadMoreContainer.innerHTML = `
        <button class="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition mt-8" onclick="loadMoreContest()">
            Voir plus
        </button>`;
}

function loadMoreContest() {
    try {
        visibleConcoursPosts += 3;
        fillCarousel('concoursTrack', concoursPosts, visibleConcoursPosts);

        if (visibleConcoursPosts >= concoursPosts.length) {
            document.getElementById('loadMoreConcoursContainer').innerHTML = '';
        } else {
            addLoadMoreContestButton();
        }
    } catch (error) {
        addLoadMoreContestButton();
    }
}


async function fillCarousel(carouselId, posts, visibleCount) {
    const carouselTrack = document.getElementById(carouselId);

    if (!carouselTrack || !posts || posts.length === 0) {
        return;
    }

    try {
        const allMedia = await getAllMediaFromPosts(posts);
        carouselTrack.innerHTML = '';
        const visibleMedia = allMedia.slice(0, visibleCount);
        const newItems = []; // Pour animer les éléments initiaux

        // Utiliser la même méthode que loadMoreGallery/Contest
        for (const media of visibleMedia) {
            try {
                const card = generateMediaCard(media);
                card.classList.add('new-item'); // Même classe que dans loadMore
                carouselTrack.appendChild(card);
                newItems.push(card);
            } catch (error) { }
        }

        if (carouselId === 'galerieTrack') {
            hideLoader('instagramGalleryLoader');
        } else if (carouselId === 'concoursTrack') {
            hideLoader('instagramContestLoader');
        }

        // Animation identique à celle des fonctions loadMore
        setTimeout(() => {
            newItems.forEach(item => item.classList.add('animate'));
        }, 50);

        await waitForImagesLoaded(carouselTrack);

        if (carouselId === 'galerieTrack') {
            if (allMedia.length > visiblegaleriePosts) {
                addLoadMoreGalleryButton();
            }
        } else if (carouselId === 'concoursTrack') {
            if (allMedia.length > visibleConcoursPosts) {
                addLoadMoreContestButton();
            }
        }

        return;
    } catch (error) { }
}

async function loadMoreGallery() {
    try {
        const allMedia = await getAllMediaFromPosts(galeriePosts);

        const startIndex = visiblegaleriePosts;
        visiblegaleriePosts += 4;
        const endIndex = Math.min(visiblegaleriePosts, allMedia.length);

        const newMedia = allMedia.slice(startIndex, endIndex);
        const carouselTrack = document.getElementById('galerieTrack');
        const newItems = [];

        for (const media of newMedia) {
            try {
                const card = generateMediaCard(media);
                card.classList.add('new-item');
                carouselTrack.appendChild(card);
                newItems.push(card);
            } catch (error) { }
        }

        setTimeout(() => {
            newItems.forEach(item => item.classList.add('animate'));
        }, 50);

        const loadedPromises = Array.from(newMedia).map((media, index) => {
            return new Promise((resolve) => {
                const mediaElement = carouselTrack.children[startIndex + index].querySelector('img, video');
                if (!mediaElement) {
                    resolve();
                    return;
                }

                if (mediaElement.complete || mediaElement.readyState >= 2) {
                    resolve();
                } else {
                    mediaElement.onload = mediaElement.onloadeddata = resolve;
                    mediaElement.onerror = resolve;
                }

                setTimeout(resolve, 5000);
            });
        });

        await Promise.all(loadedPromises);

        if (visiblegaleriePosts >= allMedia.length) {
            document.getElementById('loadMoreGallerieContainer').innerHTML = '';
        } else {
            addLoadMoreGalleryButton();
        }
    } catch (error) {
        addLoadMoreGalleryButton();
    }
}

async function loadMoreContest() {
    try {
        const allMedia = await getAllMediaFromPosts(concoursPosts);

        const startIndex = visibleConcoursPosts;
        visibleConcoursPosts += 3;
        const endIndex = Math.min(visibleConcoursPosts, allMedia.length);

        const newMedia = allMedia.slice(startIndex, endIndex);
        const carouselTrack = document.getElementById('concoursTrack');
        const newItems = [];

        for (const media of newMedia) {
            try {
                const card = generateMediaCard(media);
                card.classList.add('new-item');
                carouselTrack.appendChild(card);
                newItems.push(card);
            } catch (error) { }
        }

        setTimeout(() => {
            newItems.forEach(item => item.classList.add('animate'));
        }, 50);

        setTimeout(() => {
            if (visibleConcoursPosts >= allMedia.length) {
                document.getElementById('loadMoreConcoursContainer').innerHTML = '';
            } else {
                addLoadMoreContestButton();
            }
        }, 800);
    } catch (error) {
        addLoadMoreContestButton();
    }
}

async function loadMoreEvents() {
    try {
        const startIndex = visiblePosts;
        visiblePosts += 3;
        const endIndex = Math.min(visiblePosts, eventPosts.length);

        const newPosts = eventPosts.slice(startIndex, endIndex);
        const eventsContainer = document.getElementById('eventsContainer');
        const fragment = document.createDocumentFragment();
        const newItems = [];

        for (const post of newPosts) {
            const card = document.createElement('div');
            card.className = "max-w-sm bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer new-item";
            card.onclick = () => window.open(post.permalink, '_blank');

            card.innerHTML = `
                <img src="${post.media_url}" class="w-full object-cover" alt="Instagram event">
                <div class="p-4">
                    <p class="text-gray-700 line-clamp-3 text-left">${post.caption || 'Aucun texte disponible'}</p>
                </div>`;

            fragment.appendChild(card);
            newItems.push(card);
        }

        eventsContainer.appendChild(fragment);


        setTimeout(() => {
            newItems.forEach(item => item.classList.add('animate'));
        }, 50);

        if (visiblePosts >= eventPosts.length) {
            document.getElementById('loadMoreEventsContainer').innerHTML = '';
        } else {
            addLoadMoreEventsButton();
        }
    } catch (error) {
        addLoadMoreEventsButton();
    }
}

async function fetchAlbumMedia(mediaId) {
    try {
        const response = await fetch(`https://oenologieinsalyon.netlify.app/.netlify/functions/get-media-images?mediaId=${mediaId}`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            return data.map(media => ({
                media_type: media.media_type,
                media_url: media.media_url,
            }));
        }
        return [];
    } catch (error) {
        return [];
    }
}

function addLoadMoreEventsButton() {
    const loadMoreEventsContainer = document.getElementById('loadMoreEventsContainer');
    loadMoreEventsContainer.innerHTML = `
        <button class="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition mt-8" onclick="loadMoreEvents()">
            Voir plus
        </button>`;
}

function generateMediaCard(media) {
    if (!media || !media.media_type || !media.media_url) {
        return document.createElement('div');
    }

    const wrapper = document.createElement('div');

    if (media.media_type === "IMAGE") {
        wrapper.className = "relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:opacity-90 hover:scale-[1.01]";

        const img = document.createElement('img');
        img.className = "w-full h-auto object-cover aspect-square";
        img.alt = "Image du Club d'œnologie";

        const placeholder = document.createElement('div');
        placeholder.className = "absolute inset-0 bg-gray-200 animate-pulse lazy-placeholder";

        wrapper.appendChild(img);
        wrapper.appendChild(placeholder);

        if (img.complete) {
            placeholder.style.display = 'none';
        }

        img.onload = () => placeholder.style.display = 'none';
        img.onerror = () => placeholder.style.display = 'none';
        img.src = media.media_url;

    } else if (media.media_type === "VIDEO") {
        wrapper.className = "relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:opacity-90 hover:scale-[1.01]";

        const video = document.createElement('video');
        video.className = "w-full h-auto object-cover aspect-square";
        video.controls = true;
        video.muted = true;
        video.preload = "auto";

        const source = document.createElement('source');
        source.type = "video/mp4";
        source.src = media.media_url;
        video.appendChild(source);

        const placeholder = document.createElement('div');
        placeholder.className = "absolute inset-0 bg-gray-200 animate-pulse lazy-placeholder";

        wrapper.appendChild(video);
        wrapper.appendChild(placeholder);

        video.onloadeddata = () => placeholder.style.display = 'none';
        video.onerror = () => placeholder.style.display = 'none';

        setTimeout(() => placeholder.style.display = 'none', 2000);
    }

    wrapper.addEventListener('click', function () {
        displayInLightbox(media);
    });

    return wrapper;
}

fetchInstagramPosts().then(() => {
    setupLazyLoading();
});

function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    const lazyVideos = document.querySelectorAll('video source[data-src]');

    if ('IntersectionObserver' in window && (lazyImages.length > 0 || lazyVideos.length > 0)) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;

                    const cleanupPlaceholder = () => {
                        img.classList.add('loaded');
                        const placeholder = img.parentNode.querySelector('.lazy-placeholder');
                        if (placeholder) placeholder.style.display = 'none';
                    };

                    if (img.complete) {
                        cleanupPlaceholder();
                    } else {
                        img.onload = cleanupPlaceholder;
                        img.onerror = cleanupPlaceholder;
                    }

                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));

        if (lazyVideos.length > 0) {
            const videoObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const source = entry.target;
                        source.src = source.dataset.src;
                        source.parentNode.load();

                        const cleanupPlaceholder = () => {
                            const placeholder = source.parentNode.parentNode.querySelector('.lazy-placeholder');
                            if (placeholder) placeholder.style.display = 'none';
                        };

                        source.parentNode.onloadeddata = cleanupPlaceholder;
                        source.parentNode.onerror = cleanupPlaceholder;

                        setTimeout(cleanupPlaceholder, 2000);

                        observer.unobserve(source);
                    }
                });
            });

            lazyVideos.forEach(video => videoObserver.observe(video));
        }
    } else {
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            const placeholder = img.parentNode.querySelector('.lazy-placeholder');
            if (placeholder) setTimeout(() => placeholder.style.display = 'none', 500);
        });

        lazyVideos.forEach(video => {
            video.src = video.dataset.src;
            video.parentNode.load();
            const placeholder = video.parentNode.parentNode.querySelector('.lazy-placeholder');
            if (placeholder) setTimeout(() => placeholder.style.display = 'none', 1000);
        });
    }
}

function displayInLightbox(media) {
    const oldLightbox = document.querySelector('.lightbox');
    if (oldLightbox) {
        oldLightbox.remove();
    }

    const lightbox = document.createElement('div');
    lightbox.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';

    let content = '';
    if (media.media_type === "IMAGE") {
        content = `<img src="${media.media_url}" class="max-w-[90%] max-h-[90vh] rounded-lg shadow-lg" alt="Aperçu">`;
    } else if (media.media_type === "VIDEO") {
        content = `
            <video src="${media.media_url}" class="max-w-[90%] max-h-[90vh] rounded-lg shadow-lg" controls autoplay></video>`;
    }

    lightbox.innerHTML = `
        ${content}
        <button class="absolute top-5 right-5 text-white text-3xl font-bold" onclick="this.parentElement.remove()">&times;</button>`;

    document.body.appendChild(lightbox);

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            lightbox.remove();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            lightbox.remove();
        }
    }, { once: true });
}

async function getAllMediaFromPosts(posts) {
    if (!posts || !Array.isArray(posts)) {
        return [];
    }

    let allMedia = [];
    let albumPromises = [];

    try {
        for (const post of posts) {
            if (!post) continue;

            if (post.media_type === "CAROUSEL_ALBUM") {
                if (!albumMediaCache[post.id]) {
                    albumPromises.push(
                        fetchAlbumMedia(post.id).then(media => {
                            albumMediaCache[post.id] = media || [];
                            return albumMediaCache[post.id];
                        })
                    );
                }
            } else if (post.media_type === "IMAGE" || post.media_type === "VIDEO") {
                allMedia.push({
                    media_type: post.media_type,
                    media_url: post.media_url,
                    permalink: post.permalink,
                    caption: post.caption
                });
            }
        }

        if (albumPromises.length > 0) {
            const albumResults = await Promise.all(albumPromises);
            albumResults.forEach(mediaArray => {
                if (mediaArray && mediaArray.length > 0) {
                    allMedia = allMedia.concat(mediaArray);
                }
            });
        }

        for (const post of posts) {
            if (post && post.media_type === "CAROUSEL_ALBUM" && albumMediaCache[post.id]) {
                allMedia = allMedia.concat(albumMediaCache[post.id]);
            }
        }

        return allMedia;
    } catch (error) {
        return allMedia;
    }
}

async function loadEventsSection() {
    await fillEvents();
    if (eventPosts.length > visiblePosts) {
        addLoadMoreEventsButton();
    }
}

async function loadGallerySection() {
    await fillCarousel('galerieTrack', galeriePosts, visiblegaleriePosts);
}

async function loadContestsSection() {
    await fillCarousel('concoursTrack', concoursPosts, visibleConcoursPosts);
}

function smoothScroll(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute("href");
    const targetElement = document.querySelector(targetId);
    targetElement.scrollIntoView({ behavior: "smooth" });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', function () {

    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        slides[currentSlide].classList.add('opacity-100');

        setInterval(() => {
            slides[currentSlide].classList.remove('opacity-100');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('opacity-100');
        }, 5000);
    }

    const animateElement = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animateElement.forEach(element => {
        observer.observe(element);
    });
});

document.addEventListener('DOMContentLoaded', function () {

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('message') === 'success') {
        const contactSection = document.getElementById('contact');

        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 animate-fade-in';
        successMsg.innerHTML = `
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Votre message a bien été envoyé. Merci de nous avoir contactés !</span>
                </div>
            `;

        document.body.appendChild(successMsg);

        window.history.replaceState({}, document.title, window.location.pathname);

        setTimeout(() => {
            successMsg.classList.add('opacity-0');
            setTimeout(() => {
                successMsg.remove();
            }, 1000);
        }, 5000);
    }
});

fetchInstagramPosts();
