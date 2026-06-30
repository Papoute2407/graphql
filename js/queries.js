// queries.js

// ── 1. Requête simple ─────────────────────────────────────────
const GET_USER = `{
    user {
        id
        login
        email
    }
}`;

// ── 2. Requête avec argument ──────────────────────────────────
// XP hors piscine uniquement
const GET_XP = `{
    transaction(
        where: {
            type: { _eq: "xp" },
            _and: [
                { path: { _like: "/rouen/div-01/%" } },
                {
                    _or: [
                        { path: { _nlike: "/rouen/div-01/%/%" } },
                        { path: { _like: "/rouen/div-01/checkpoint%" } }
                    ]
                }
            ]
        },
    ) {
        amount
        createdAt
        path
    }
}`;

// ── 3. Requête imbriquée (nested) ─────────────────────────────
const GET_RESULTS = `{
    result {
        grade
        createdAt
        path
        object {
            name
            type
        }
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
        _and: [
            { path: { _like: "/rouen/%" } },
            { path: { _nlike: "%piscine%" } }
        ]
    }, order_by: { amount: desc }, limit: 1) {
        amount
    }
}`;