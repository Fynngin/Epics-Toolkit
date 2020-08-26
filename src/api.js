import axios from "axios";
import axiosRateLimit from "axios-rate-limit";
const http = axiosRateLimit(axios.create(), {maxRequests: 150, perMilliseconds: 60000})

/**
 * Sends login request.
 * @param auth object of form: {email: xxx, password: yyy}
 * @returns Promise, which can be awaited elsewhere
 */
export function login(auth) {
    return http("https://api.epics.gg/api/v1/auth/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(auth)
    })
}

export function getCollections(jwt, category, season, userId) {
    return http(`https://api.epics.gg/api/v1/collections/users/${userId}/user-summary`, {
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
    return http(`https://api.epics.gg/api/v1/collections/${collectionId}/card-templates`, {
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
    return http(`https://api.epics.gg/api/v1/collections/${collectionId}/sticker-templates`, {
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
    return http(`https://api.epics.gg/api/v1/leaderboards/collections/${collectionId}`, {
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
    return http(`https://api.epics.gg/api/v1/collections/${collectionId}/users/${userId}/owned2`, {
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
    return http("https://api.epics.gg/api/v1/settings/web", {
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
    return http("https://api.epics.gg/api/v1/packs", {
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
    return http("https://api.epics.gg/api/v1/players", {
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
    return http("https://api.epics.gg/api/v1/players/roles", {
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
    return http("https://api.epics.gg/api/v1/ultimate-team/players", {
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
    return http("https://api.epics.gg/api/v1/ultimate-team/maps", {
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

export function getCardsByPlayer(jwt, category, userId, playerId, season, page) {
    return http(`https://api.epics.gg/api/v1/cards/owned/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            'playerIds': playerId,
            'season': season,
            'page': page
        }
    })
}

export function getMarketListings(jwt, category, templateId, type, page) {
    return http(`https://api.epics.gg/api/v1/market/buy`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            'templateId': templateId,
            'type': type,
            'page': page
        }
    })
}

export function getTeams(jwt) {
    return http(`https://api.epics.gg/api/v1/teams`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        }
    })
}