<?php

namespace App\Tests;

use App\Service\ChatbotService; 
use PHPUnit\Framework\TestCase;

class ChatbotServiceTest extends TestCase
{
    public function testGetResponse(): void
    {
        $chatbot = new ChatbotService();
        $this->assertSame("Bonjour comment je peux vous aider", $chatbot->getResponse("bonjour"));
        $this->assertSame("Bonjour comment je peux vous aider", $chatbot->getResponse(" Bonjour ")); // Test trim/lowercase
        $this->assertSame("Je n'ai pas compris votre message.", $chatbot->getResponse("autre chose"));
        $this->assertSame("Je n'ai pas compris votre message.", $chatbot->getResponse(""));
    }
}