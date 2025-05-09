// assets/app.js (ou un autre nom que vous incluez dans votre Twig)

// Sélection des éléments HTML dont nous aurons besoin
const chatbox = document.getElementById('chatbox');       // La div où les messages sont affichés
const messageForm = document.getElementById('messageForm'); // Le formulaire
const userInput = document.getElementById('userInput');     // Le champ de saisie du message

/**
 * Fonction pour ajouter un message (objet) au chatbox HTML.
 * @param {object} messageData - Un objet avec les clés 'content', 'sender', 'sentAt'.
 */
function addMessageToChatbox(messageData) {
    if (!chatbox || !messageData || !messageData.content) {
        console.warn("Impossible d'ajouter le message, données manquantes ou chatbox non trouvé.");
        return;
    }

    const messageElement = document.createElement('p'); // Crée un nouvel élément <p>

    // Détermine le préfixe en fonction de l'expéditeur ('user' ou 'bot')
    let senderPrefix = '';
    if (messageData.sender === 'user') {
        senderPrefix = '<strong>Vous:</strong>';
    } else if (messageData.sender === 'bot') {
        senderPrefix = '<strong>Bot:</strong>';
    } else {
        senderPrefix = '<strong>System:</strong>'; // Pour les messages d'erreur du JS
    }

    // Formate l'heure si elle est fournie
    let timeSuffix = messageData.sentAt ? ` <em style="font-size: 0.8em; color: grey;">(${messageData.sentAt})</em>` : '';

    // Construit le HTML interne du paragraphe
    messageElement.innerHTML = `${senderPrefix} ${escapeHtml(messageData.content)}${timeSuffix}`;

    chatbox.appendChild(messageElement); // Ajoute le <p> au chatbox

    // Fait défiler automatiquement vers le bas pour voir le dernier message
    chatbox.scrollTop = chatbox.scrollHeight;
}

/**
 * Petite fonction pour échapper les caractères HTML pour éviter les injections XSS simples
 * lors de l'affichage du contenu venant de l'utilisateur ou du bot.
 */

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// S'assurer que le JS s'exécute seulement si les éléments existent
if (messageForm && userInput && chatbox) {
    // Au chargement initial de la page, on fait défiler en bas si du contenu est déjà là
    chatbox.scrollTop = chatbox.scrollHeight;

    // Ajouter un écouteur d'événement sur la soumission du formulaire
    messageForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // TRÈS IMPORTANT : Empêche le rechargement de la page

        const messageText = userInput.value.trim(); // Récupère le texte et enlève les espaces au début/fin

        if (!messageText) {
            return; // Ne rien faire si le message est vide
        }

        // Vider le champ de saisie immédiatement pour une meilleure expérience utilisateur
        userInput.value = '';

        try {
            // Envoyer la requête au serveur en utilisant l'API Fetch (moderne)
            const response = await fetch('/chat/send', { // L'URL de votre endpoint backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indique qu'on envoie du JSON
                    'Accept': 'application/json',       // Indique qu'on s'attend à recevoir du JSON
                },
                body: JSON.stringify({ message: messageText }) // Convertit l'objet JS en chaîne JSON
            });

            // Vérifier si la réponse du serveur est OK (statut HTTP 2xx)
            if (!response.ok) {
                // Si le serveur renvoie une erreur (ex: 400, 500)
                console.error('Erreur serveur:', response.status, response.statusText);
                let errorData = { error: 'Erreur inattendue du serveur.' };
                try {
                    errorData = await response.json(); // Essayer de lire le corps de l'erreur JSON
                } catch (e) { /* ignorer si le corps n'est pas du JSON */ }
                addMessageToChatbox({ content: `Erreur: ${errorData.error || response.statusText}`, sender: 'system' });
                return;
            }

            // Si tout va bien, lire la réponse JSON du serveur
            const data = await response.json();

            // Ajouter les messages (utilisateur et bot) reçus du serveur à l'interface
            // Le serveur renvoie les messages avec leur sender et sentAt corrects (après sauvegarde en BDD)
            if (data.user_message) {
                addMessageToChatbox(data.user_message);
            }
            if (data.bot_message) {
                addMessageToChatbox(data.bot_message);
            }

        } catch (error) {
            // Gérer les erreurs réseau (ex: serveur inaccessible)
            console.error('Erreur réseau ou de parsing JSON:', error);
            addMessageToChatbox({ content: 'Erreur de communication avec le serveur.', sender: 'system' });
        }
    });
} else {
    console.warn("Éléments du chat (form, input, ou chatbox) non trouvés. Le JS du chat ne s'initialisera pas.");
}