import axios from "axios";

export function getCollections(jwt, category, season, userId) {
    return axios(`https://api.epics.gg/api/v1/collections/users/${userId}/user-summary`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            'seasons': season
        }
    })
}

export function getCardTemplates(jwt, category, collectionId) {
    return axios(`https://api.epics.gg/api/v1/collections/${collectionId}/card-templates`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category
        }
    })
}

export function getLeaderboard(jwt, category, collectionId, page) {
    return axios(`https://api.epics.gg/api/v1/leaderboards/collections/${collectionId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            'page': page
        }
    })
}

export function getItems(jwt, category, collectionId, userId) {
    return axios(`https://api.epics.gg/api/v1/collections/${collectionId}/users/${userId}/owned2`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category
        }
    })
}