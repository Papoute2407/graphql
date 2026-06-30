// auth.js

const AUTH_URL    = 'https://zone01normandie.org/api/auth/signin';
const JWT_KEY     = 'jwt';

// ── Stockage ──────────────────────────────────────────────────
function saveToken(token) {
    localStorage.setItem(JWT_KEY, token);
}

function getToken() {
    return localStorage.getItem(JWT_KEY);
}

function removeToken() {
    localStorage.removeItem(JWT_KEY);
}

// ── Vérification ──────────────────────────────────────────────
function isLoggedIn() {
    const token = getToken();
    if (!token) return false;

    try {
        // Décoder le payload du JWT (partie centrale)
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Vérifier l'expiration
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            removeToken();
            return false;
        }

        return true;
    } catch {
        removeToken();
        return false;
    }
}

// ── Récupérer l'ID utilisateur depuis le JWT ──────────────────
function getUserIdFromToken() {
    try {
        const token   = getToken();
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Zone01 stocke l'id dans "sub" ou "https://hasura.io/jwt/claims"
        const claims  = payload['https://hasura.io/jwt/claims'];
        return claims?.['x-hasura-user-id'] ?? payload.sub ?? null;
    } catch {
        return null;
    }
}

// ── Login ─────────────────────────────────────────────────────
async function login(identifier, password) {
    const credentials = btoa(`${identifier}:${password}`);

    const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`
        }
    });

    if (!res.ok) {
        throw new Error(res.status === 401
            ? 'Identifiants invalides. Accès refusé.'
            : 'Impossible de contacter le serveur.'
        );
    }

    const token = await res.json();
    saveToken(token);
    return token;
}

// ── Logout ────────────────────────────────────────────────────
function logout() {
    removeToken();
    window.location.href = 'index.html';
}