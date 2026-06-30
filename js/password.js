// Toggle password visibility
        const toggleBtn = document.getElementById('togglePass');
        const passInput = document.getElementById('password');
        let shown = false;

        toggleBtn.addEventListener('click', () => {
            shown = !shown;
            passInput.type = shown ? 'text' : 'password';
            toggleBtn.textContent = shown ? '[hide]' : '[show]';
        });

        // Submit on Enter
        document.addEventListener('keydown', e => {
            if (e.key === 'Enter') handleLogin();
        });

        document.getElementById('loginBtn').addEventListener('click', handleLogin);

        async function handleLogin() {
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value;
            const btn  = document.getElementById('loginBtn');
            const errorBox = document.getElementById('errorBox');
            const errorMsg = document.getElementById('errorMsg');

            if (!user || !pass) {
                errorMsg.textContent = 'Remplis tous les champs.';
                errorBox.classList.add('show');
                return;
            }

            errorBox.classList.remove('show');
            btn.disabled = true;
            btn.textContent = '[ Connexion... ]';

            try {
                const credentials = btoa(`${user}:${pass}`);
                const res = await fetch('https://zone01normandie.org/api/auth/signin', {
                    method: 'POST',
                    headers: { 'Authorization': `Basic ${credentials}` }
                });

                if (!res.ok) throw new Error('401');

                const token = await res.json();
                localStorage.setItem('jwt', token);

                btn.textContent = '[ Accès accordé ✓ ]';
                btn.style.background = '#00e888';

                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 800);

            } catch (e) {
                errorMsg.textContent = e.message === '401'
                    ? 'Identifiants invalides. Accès refusé.'
                    : 'Impossible de contacter le serveur.';
                errorBox.classList.add('show');
                btn.disabled = false;
                btn.textContent = '[ Connexion ]';
            }
        }