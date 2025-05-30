exports.handler = async function (event, context) {
    const token = process.env.IG_TOKEN; // Récupère le token stocké dans les variables d'environnement Netlify
    const { mediaId } = event.queryStringParameters; // Récupère le mediaId depuis les paramètres de requête

    if (!mediaId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Le paramètre 'mediaId' est requis" }),
        };
    }

    try {
        // Appel à l'API Instagram pour récupérer les médias du carrousel
        const response = await fetch(
            `https://graph.instagram.com/${mediaId}/children?fields=id,media_type,media_url&access_token=${token}`
        );
        const data = await response.json();

        if (data.error) {
            throw new Error(`Erreur Instagram: ${data.error.message}`);
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Permet toutes les origines
                'Access-Control-Allow-Methods': 'GET', // Autorise la méthode GET
                'Access-Control-Allow-Headers': 'Content-Type', // Autorise le Content-Type dans les en-têtes
            },
            body: JSON.stringify(data.data), // Retourne uniquement les données des médias
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erreur lors de la récupération des médias" }),
        };
    }
};
