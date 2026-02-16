&lt;?php
/**
 * NightWatch - Interface de chat
 */

session_start();

// Vérifier l'authentification
if (!isset($_SESSION['token'])) {
    header('Location: /login.php');
    exit();
}

$user = json_decode($_SESSION['user'], true);

// Charger le layout
$content = ob_get_clean();

ob_start();
?&gt;
&lt;div class="container-fluid py-4"&gt;
    &lt;div class="row"&gt;
        &lt;div class="col-12"&gt;
            &lt;div class="card fade-in"&gt;
                &lt;div class="card-header"&gt;
                    &lt;h4 class="mb-0"&gt;&lt;i class="fas fa-comments"&gt;&lt;/i&gt; Chat Équipe&lt;/h4&gt;
                &lt;/div&gt;
                &lt;div class="card-body"&gt;
                    &lt;div class="row"&gt;
                        &lt;!-- Liste des conversations --&gt;
                        &lt;div class="col-md-4"&gt;
                            &lt;div class="list-group" id="conversationsList"&gt;
                                &lt;a href="#" class="list-group-item list-group-item-action active"&gt;
                                    &lt;div class="d-flex w-100 justify-content-between"&gt;
                                        &lt;h6 class="mb-1"&gt;&lt;i class="fas fa-users"&gt;&lt;/i&gt; Général&lt;/h6&gt;
                                        &lt;small&gt;Maintenant&lt;/small&gt;
                                    &lt;/div&gt;
                                    &lt;p class="mb-1 text-truncate"&gt;Dernier message...&lt;/p&gt;
                                &lt;/a&gt;
                                &lt;a href="#" class="list-group-item list-group-item-action"&gt;
                                    &lt;div class="d-flex w-100 justify-content-between"&gt;
                                        &lt;h6 class="mb-1"&gt;&lt;i class="fas fa-user"&gt;&lt;/i&gt; Équipe de nuit&lt;/h6&gt;
                                        &lt;small&gt;Il y a 2h&lt;/small&gt;
                                    &lt;/div&gt;
                                    &lt;p class="mb-1 text-truncate"&gt;Dernier message...&lt;/p&gt;
                                &lt;/a&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                        
                        &lt;!-- Zone de chat --&gt;
                        &lt;div class="col-md-8"&gt;
                            &lt;div class="d-flex flex-column h-100"&gt;
                                &lt;!-- En-tête de conversation --&gt;
                                &lt;div class="border-bottom pb-3 mb-3"&gt;
                                    &lt;h5&gt;&lt;i class="fas fa-users"&gt;&lt;/i&gt; Général&lt;/h5&gt;
                                    &lt;small class="text-muted"&gt;Chat de l'équipe&lt;/small&gt;
                                &lt;/div&gt;
                                
                                &lt;!-- Messages --&gt;
                                &lt;div class="chat-container flex-grow-1 mb-3" id="chatMessages"&gt;
                                    &lt;div class="chat-message received"&gt;
                                        &lt;div class="sender"&gt;Jean Dupont&lt;/div&gt;
                                        &lt;div class="content"&gt;Bonsoir tout le monde ! Comment se passe la ronde ?&lt;/div&gt;
                                        &lt;div class="time"&gt;20:45&lt;/div&gt;
                                    &lt;/div&gt;
                                    &lt;div class="chat-message sent"&gt;
                                        &lt;div class="sender"&gt;Vous&lt;/div&gt;
                                        &lt;div class="content"&gt;Tout se passe bien sur le site principal. J'ai terminé la première vérification.&lt;/div&gt;
                                        &lt;div class="time"&gt;21:00&lt;/div&gt;
                                    &lt;/div&gt;
                                    &lt;div class="chat-message received"&gt;
                                        &lt;div class="sender"&gt;Marie Martin&lt;/div&gt;
                                        &lt;div class="content"&gt;Super ! N'oublie pas de vérifier les issues de secours.&lt;/div&gt;
                                        &lt;div class="time"&gt;21:05&lt;/div&gt;
                                    &lt;/div&gt;
                                &lt;/div&gt;
                                
                                &lt;!-- Formulaire d'envoi --&gt;
                                &lt;form class="d-flex gap-2" id="chatForm"&gt;
                                    &lt;input type="text" class="form-control flex-grow-1" id="messageInput" 
                                           placeholder="Écrivez votre message..." autocomplete="off"&gt;
                                    &lt;button type="submit" class="btn btn-primary"&gt;
                                        &lt;i class="fas fa-paper-plane"&gt;&lt;/i&gt; Envoyer
                                    &lt;/button&gt;
                                &lt;/form&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;

&lt;script&gt;
// Envoyer un message
document.getElementById('chatForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const container = document.getElementById('chatMessages');
    
    // Ajouter le message
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const messageHtml = `
        &lt;div class="chat-message sent fade-in"&gt;
            &lt;div class="sender"&gt;Vous&lt;/div&gt;
            &lt;div class="content"&gt;${message.replace(/&lt;/g, '&amp;lt;').replace(/&gt;/g, '&amp;gt;')}&lt;/div&gt;
            &lt;div class="time"&gt;${time}&lt;/div&gt;
        &lt;/div&gt;
    `;
    
    container.insertAdjacentHTML('beforeend', messageHtml);
    container.scrollTop = container.scrollHeight;
    
    // Vider l'input
    input.value = '';
    
    // Simuler une réponse (à remplacer par l'API WebSocket)
    setTimeout(() =&gt; {
        simulateResponse();
    }, 2000);
});

// Simuler une réponse (placeholder)
function simulateResponse() {
    const responses = [
        'Bien reçu !',
        'Merci pour l\'information.',
        'Je note ça dans le rapport.',
        'Ok, je vérifie.',
        'D\'accord, je m\'en occupe.'
    ];
    
    const container = document.getElementById('chatMessages');
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const messageHtml = `
        &lt;div class="chat-message received fade-in"&gt;
            &lt;div class="sender"&gt;Équipe&lt;/div&gt;
            &lt;div class="content"&gt;${randomResponse}&lt;/div&gt;
            &lt;div class="time"&gt;${time}&lt;/div&gt;
        &lt;/div&gt;
    `;
    
    container.insertAdjacentHTML('beforeend', messageHtml);
    container.scrollTop = container.scrollHeight;
}

// Auto-scroll vers le bas
const container = document.getElementById('chatMessages');
container.scrollTop = container.scrollHeight;
&lt;/script&gt;
&lt;?php
$content = ob_get_clean();

require_once __DIR__ . '/../views/components/layout.php';
?&gt;