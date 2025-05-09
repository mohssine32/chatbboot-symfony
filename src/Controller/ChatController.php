<?php

namespace App\Controller;

use App\Entity\Message;
use App\Repository\MessageRepository; // Bientôt utilisé
use Doctrine\ORM\EntityManagerInterface;     // <-- AJOUTÉ
use App\Service\ChatbotService;             // <-- AJOUTÉ
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

final class ChatController extends AbstractController
{
    public function __construct(
        private readonly MessageRepository $messageRepository,
        private readonly EntityManagerInterface $entityManager, // <-- AJOUTÉ
        private readonly ChatbotService $chatbotService    // <-- AJOUTÉ
    ) {}

    public function index(): Response
    {
        $messages = $this->messageRepository->findBy([], ['sendAt' => 'ASC']);

        return $this->render('chat/index.html.twig', [
            'messages' => $messages,
        ]);
    }

    
public function send(Request $request): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    $userMessageContent = $data['message'] ?? null;

    if (!$userMessageContent) {
        // Vous pourriez avoir besoin d'ajouter : use Symfony\Component\HttpFoundation\Response;
        // en haut du fichier si ce n'est pas déjà fait pour Response::HTTP_BAD_REQUEST
        return new JsonResponse(['error' => 'Message vide.'], Response::HTTP_BAD_REQUEST);
    }

    // 1. Enregistrer message utilisateur
    $userMessage = new Message();
    $userMessage->setContent($userMessageContent);
    $userMessage->setSender('user');
    $userMessage->setSendAt(new \DateTime());
    $this->entityManager->persist($userMessage);

    // 2. Obtenir réponse du bot via le service
    $botResponseContent = $this->chatbotService->getResponse($userMessageContent);

    // 3. Enregistrer message du bot
    $botMessage = new Message();
    $botMessage->setContent($botResponseContent);
    $botMessage->setSender('bot');
    $botMessage->setSendAt(new \DateTime());
    $this->entityManager->persist($botMessage);

    // 4. Sauvegarder en BDD
    $this->entityManager->flush();

    // 5. Retourner les données au client
    return new JsonResponse([
        'user_message' => ['content' => $userMessage->getContent(), 'sender' => 'user', 'sentAt' => $userMessage->getSendAt()->format('H:i')],
        'bot_message' => ['content' => $botMessage->getContent(), 'sender' => 'bot', 'sentAt' => $botMessage->getSendAt()->format('H:i')],
    ]);
}

}
