// graphql.js

const GRAPHQL_URL = 'https://zone01normandie.org/api/graphql-engine/v1/graphql';

async function fetchGraphQL(query, variables) {

    // Valeur par défaut explicite (évite le bug "variables is not defined")
    if (variables === undefined) variables = {};

    const token = localStorage.getItem('jwt');

    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    });

    if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const json = await response.json();

    if (json.errors) {
        throw new Error(json.errors[0].message);
    }

    return json.data;
}