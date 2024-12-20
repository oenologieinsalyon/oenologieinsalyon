exports.handler = async function(event, context) {
    const token = process.env.IG_TOKEN; // Récupère le token stocké dans les variables d'environnement Netlify

    try {
        const instagramResponse = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink&access_token=${token}`);
        const instagramData = await instagramResponse.json();

        if (instagramData.error) {
            throw new Error(`Erreur Instagram: ${instagramData.error.message}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(instagramData.data), // Retourne uniquement les données des posts
        };
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Instagram:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erreur lors de la récupération des posts Instagram" }),
        };
    }
};