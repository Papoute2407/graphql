// queries.js

// ── 1. Requête simple ─────────────────────────────────────────
const GET_USER = `{
    user {
        id
        login
        email
        campus
    }
}`;

// ── 2. Requête avec argument ──────────────────────────────────
// XP hors piscine uniquement
const GET_XP = `{
    transaction(where: {
        type: { _eq: "xp" }
    }, order_by: { createdAt: asc }) {
        amount
        createdAt
        path
    }
}`;


// ── 4. Requête avec variable dynamique ────────────────────────
const GET_OBJECT = `
    query($id: Int!) {
        object(where: { id: { _eq: $id }}) {
            name
            type
            attrs
        }
    }
`;

// ── 5. Audits (up et down) ────────────────────────────────────
const GET_AUDITS = `{
    transaction(where: {
        type: { _in: ["up", "down"] }
    }) {
        type
        amount
        createdAt
    }
}`;

// ── 6. Skills ─────────────────────────────────────────────────
const GET_SKILLS = `{
    transaction(where: {
        type: { _like: "skill_%" }
    }) {
        type
        amount
    }
}`;

// ── 7. Niveau utilisateur ─────────────────────────────────────
const GET_LEVEL = `{
    transaction(where: {
        type: { _eq: "level" },
        path: { _like: "/rouen/div-01%" },
    }, order_by: { createdAt: desc }, limit: 1) {
        amount
    }
}`;