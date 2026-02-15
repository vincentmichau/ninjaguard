&lt;?php
/**
 * NightWatch - Page de connexion
 */

session_start();

// Déjà connecté ?
if (isset($_SESSION['token'])) {
    header('Location: /dashboard.php');
    exit();
}
?&gt;
&lt;!DOCTYPE html&gt;
&lt;html lang="fr"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;NightWatch - Connexion&lt;/title&gt;
    
    &lt;!-- Bootstrap CSS --&gt;
    &lt;link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"&gt;
    
    &lt;!-- Font Awesome --&gt;
    &lt;link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"&gt;
    
    &lt;!-- Styles personnalisés --&gt;
    &lt;link href="/assets/css/style.css" rel="stylesheet"&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div class="login-container"&gt;
        &lt;div class="login-card"&gt;
            &lt;div class="login-logo"&gt;
                &lt;h1&gt;&lt;i class="fas fa-shield-alt"&gt;&lt;/i&gt; NightWatch&lt;/h1&gt;
                &lt;p class="text-muted"&gt;Gestion de rondes de nuit&lt;/p&gt;
            &lt;/div&gt;
            
            &lt;form id="loginForm" data-action="/auth/login" data-method="POST" data-redirect="/dashboard.php"&gt;
                &lt;div class="mb-3"&gt;
                    &lt;label for="email" class="form-label"&gt;Email&lt;/label&gt;
                    &lt;div class="input-group"&gt;
                        &lt;span class="input-group-text"&gt;
                            &lt;i class="fas fa-envelope"&gt;&lt;/i&gt;
                        &lt;/span&gt;
                        &lt;input type="email" class="form-control" id="email" name="email" required 
                               placeholder="votre@email.com" value="admin@nightwatch.fr"&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
                
                &lt;div class="mb-4"&gt;
                    &lt;label for="password" class="form-label"&gt;Mot de passe&lt;/label&gt;
                    &lt;div class="input-group"&gt;
                        &lt;span class="input-group-text"&gt;
                            &lt;i class="fas fa-lock"&gt;&lt;/i&gt;
                        &lt;/span&gt;
                        &lt;input type="password" class="form-control" id="password" name="password" required 
                               placeholder="••••••••" value="Admin123!"&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
                
                &lt;div class="mb-3 form-check"&gt;
                    &lt;input type="checkbox" class="form-check-input" id="remember"&gt;
                    &lt;label class="form-check-label" for="remember"&gt;
                        Se souvenir de moi
                    &lt;/label&gt;
                &lt;/div&gt;
                
                &lt;button type="submit" class="btn btn-primary w-100 btn-lg"&gt;
                    &lt;i class="fas fa-sign-in-alt"&gt;&lt;/i&gt; Se connecter
                &lt;/button&gt;
            &lt;/form&gt;
            
            &lt;hr class="my-4"&gt;
            
            &lt;div class="text-center text-muted"&gt;
                &lt;small&gt;Version PHP/MySQL/Bootstrap&lt;/small&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"&gt;&lt;/script&gt;
    &lt;script&gt;
        const API_URL = '/api';
        
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(API_URL + '/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                    window.location.href = '/dashboard.php';
                } else {
                    alert(data.message || 'Erreur de connexion');
                }
            } catch (error) {
                alert('Erreur de connexion au serveur');
                console.error(error);
            }
        });
    &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;