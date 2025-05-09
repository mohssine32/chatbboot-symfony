<?php
namespace App\Service;

class ChatbotService
{
    public function getResponse(string $userMessage): string
    {
        $userMessage = strtolower(trim($userMessage)); // Normaliser l'entrée

        if ($userMessage === 'bonjour') {
            return "Bonjour comment je peux vous aider";
        }

        // Ajoutez d'autres règles simples ici si vous voulez
        // if ($userMessage === 'merci') {
        //     return "De rien !";
        // }

        return "Je n'ai pas compris votre message."; // Réponse par défaut
    }
}