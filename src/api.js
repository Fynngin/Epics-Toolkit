import axios from "axios";

/**
 * Sends login request.
 * @param auth object of form: {email: xxx, password: yyy}
 * @returns Promise, which can be awaited elsewhere
 */
export function login(auth) {
    return axios("https://api.epics.gg/api/v1/auth/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(auth)
    })
}

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

export function getStickerTemplates(jwt, category, collectionId) {
    return axios(`https://api.epics.gg/api/v1/collections/${collectionId}/sticker-templates`, {
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

export function getAppInfo(jwt, category) {
    return axios("https://api.epics.gg/api/v1/settings/web", {
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

export function getStorePacks(jwt, category, page) {
    return axios("https://api.epics.gg/api/v1/packs", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            page: page
        }
    })
}

export function getPlayers(jwt, category) {
    return axios("https://api.epics.gg/api/v1/players", {
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

export function getRoles(jwt, category) {
    return axios("https://api.epics.gg/api/v1/players/roles", {
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

export function getPlayerMaps(jwt, category) {
    return axios("https://api.epics.gg/api/v1/ultimate-team/players", {
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

export function getMaps(jwt, category) {
    return axios("https://api.epics.gg/api/v1/ultimate-team/maps", {
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