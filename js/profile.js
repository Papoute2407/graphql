// profile.js

// ── Vérification JWT au chargement ────────────────────────────
const token = localStorage.getItem('jwt');
if (!token) {
    window.location.href = 'index.html';
}

// ── Logout ────────────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('jwt');
    window.location.href = 'index.html';
});

// ── Point d'entrée principal ──────────────────────────────────
async function loadProfile() {
    try {
        await loadUser();
        await loadXP();
        await loadAudits();
        await loadSkills();
    } catch (e) {
        console.error('Erreur chargement profil :', e);
    }
}

// ── 1. Infos utilisateur ──────────────────────────────────────
async function loadUser() {
    const data = await fetchGraphQL(GET_USER);
    const user = data.user[0];

    const initiales = user.login.slice(0, 2).toUpperCase();
    document.getElementById('avatar').textContent = initiales;
    document.getElementById('userLogin').textContent = user.login;
    document.getElementById('userEmail').textContent = user.email ?? '—';

    // ← Niveau récupéré depuis la vraie transaction "level"
    const levelData = await fetchGraphQL(GET_LEVEL);
    const level = levelData.transaction[0]?.amount ?? 0;
    document.getElementById('userLevel').textContent = level;
}

// ── 2. XP total + graphique courbe ───────────────────────────
async function loadXP() {
    const data = await fetchGraphQL(GET_XP);
    const transactions = data.transaction;

    // Calcul XP total
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('xpTotal').textContent = Math.round(total / 1000);

    // Tri par date pour le graphique
    const sorted = [...transactions].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Calcul XP cumulé
    let cumul = 0;
    const points = sorted.map(t => {
        cumul += t.amount;
        return { date: new Date(t.createdAt), xp: cumul };
    });

    drawXPGraph(points);
}

// ── 3. Audits ─────────────────────────────────────────────────
async function loadAudits() {
    const data = await fetchGraphQL(GET_AUDITS);

    const up   = data.transaction.filter(t => t.type === 'up');
    const down = data.transaction.filter(t => t.type === 'down');

    const totalUp   = up.reduce((s, t) => s + t.amount, 0);
    const totalDown = down.reduce((s, t) => s + t.amount, 0);

    document.getElementById('auditsUp').textContent   = Math.round(totalUp / 1000)   + ' kB';
    document.getElementById('auditsDown').textContent = Math.round(totalDown / 1000) + ' kB';

    drawAuditGraph(totalUp, totalDown);
}

// ── 4. Skills ─────────────────────────────────────────────────
async function loadSkills() {
    const data = await fetchGraphQL(GET_SKILLS);
    const transactions = data.transaction;

    // Regrouper par skill et garder le max
    const skillMap = {};
    transactions.forEach(t => {
        const name = t.type.replace('skill_', '');
        if (!skillMap[name] || t.amount > skillMap[name]) {
            skillMap[name] = t.amount;
        }
    });

    // Trier par valeur décroissante, garder les 8 premiers
    const sorted = Object.entries(skillMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const max = sorted[0]?.[1] || 100;
    const container = document.getElementById('skillsList');
    container.innerHTML = '';

    sorted.forEach(([name, value]) => {
        const pct = Math.round((value / max) * 100);
        const row = document.createElement('div');
        row.className = 'skill-row';
        row.innerHTML = `
            <span class="skill-name">${name}</span>
            <div class="skill-bar-bg">
                <div class="skill-bar-fill" style="width: ${pct}%"></div>
            </div>
            <span class="skill-pct">${pct}%</span>
        `;
        container.appendChild(row);
    });
}

// ── Calcul du niveau ──────────────────────────────────────────
// (à adapter selon la logique réelle de zone01)
function calculateLevel(userId) {
    return Math.floor(Math.sqrt(userId / 10));
}

// ── Lancement ─────────────────────────────────────────────────
loadProfile();