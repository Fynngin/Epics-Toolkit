import axios from "axios";
import axiosRateLimit from "axios-rate-limit";
const http = axiosRateLimit(axios.create(), {maxRequests: 130, perMilliseconds: 60000})

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

export function getUserInfo(jwt, category) {
    return http("https://api.epics.gg/api/v1/user/info", {
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

export function getCardsByTemplate(jwt, category, userId, templateId) {
    return http(`https://api.epics.gg/api/v1/collections/users/${userId}/card-templates/${templateId}/cards`, {
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

export function getStickersByTemplate(jwt, category, userId, templateId) {
    return http(`https://api.epics.gg/api/v1/collections/users/${userId}/sticker-templates/${templateId}/stickers`, {
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

export function getUserPacks(jwt, category, page) {
    return http("https://api.epics.gg/api/v1/packs/user", {
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

export function getUserMarketListings(jwt, category, userId, type, page) {
    return http(`https://api.epics.gg/api/v1/market/listed/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'sort': '-price',
            'categoryId': category,
            'page': page,
            'type': type
        }
    })
}

export function updateMarketListing(jwt, category, marketId, minOffer, price) {
    return http(`https://api.epics.gg/api/v1/market/listed/${marketId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category
        },
        data: JSON.stringify({
            'minOffer': minOffer,
            'price': price
        })
    })
}

export function removeMarketListing(jwt, marketId) {
    return http(`https://api.epics.gg/api/v1/market/listed/${marketId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
    })
}

export function listItem(jwt, category, id, minOffer, price, type) {
    return http("https://api.epics.gg/api/v1/market/list", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category
        },
        data: {
            'id': id,
            'minOffer': minOffer,
            'price': price,
            'type': type
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

export function searchUsers(jwt, category, username) {
    return http(`https://api.epics.gg/api/v1/users/search`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            'username': username
        }
    })
}

export function getTrades(jwt, category, page) {
    return http(`https://api.epics.gg/api/v1/trade?status=open`, {
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

export function acceptTrade(jwt, category, tradeId) {
    return http(`https://api.epics.gg/api/v1/trade/accept-offer`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category
        },
        data: JSON.stringify({
            'tradeId': tradeId
        })
    })
}

export function getCardIds(jwt, category, collection, userId) {
    return http(`https://api.epics.gg/api/v1/collections/users/${userId}/cardids`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            'collectionId': collection
        }
    })
}

export function getStickerIds(jwt, category, collection, userId) {
    return http(`https://api.epics.gg/api/v1/collections/users/${userId}/stickerids`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            'collectionId': collection
        }
    })
}

/**
 * Sends trade to the given user with userId
 * @param jwt, authentication token
 * @param category, game category (either 1 or 2)
 * @param userId, the userId to recieve the trade
 * @param entities, array of items, i.e. [{id: 12345, type: 'card'}, {id: 54321, type: 'sticker'}, ...]
 * @returns Promise to be awaited
 */
export function sendTrade(jwt, category, userId, entities) {
    return http(`https://api.epics.gg/api/v1/trade/create-offer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category
        },
        data: JSON.stringify({
            user2Id: userId,
            user1Balance: 0,
            user2Balance: 0,
            entities: entities
        })
    })
}

export function getCircuit(jwt, category, circuitId) {
    return http(`https://api.epics.gg/api/v1/ultimate-team/circuits/${circuitId}`, {
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

export function getRushAchievements(jwt, category, userId) {
    return http(`https://api.epics.gg/api/v1/achievements/${userId}/user`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            'subGroup': 'ut_game'
        }
    })
}

export function getUserRosters(jwt, category, userId) {
    return http(`https://api.epics.gg/api/v1/ultimate-team/rosters`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            'userId': userId
        }
    })
}

export function getRostersById(jwt, category, rosterIds) {
    return http(`https://api.epics.gg/api/v1/ultimate-team/pve/rosters`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            'ids': rosterIds
        }
    })
}

export function getTotw(jwt, category) {
    return http(`https://api.epics.gg/api/v1/ultimate-team/pve/rosters`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
            'categoryId': category,
            'tier': 'team_of_the_week'
        }
    })
}

export function playRushPve(jwt, category, circuitId, stageId, bannedMaps, rosterId, enemyRosterId, isTotw) {
    let data = {
        categoryId: category,
        rosterId: rosterId,
        enemyRosterId: enemyRosterId,
        bannedMapIds: bannedMaps
    }
    if (!isTotw)
        data.circuit = {
            id: circuitId,
            stageId: stageId
        }
    return http(`https://api.epics.gg/api/v1/ultimate-team/pve/games`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        data: JSON.stringify(data)
    })
}

export function openPack(jwt, category, packId) {
    return http(`https://api.epics.gg/api/v1/packs/open2`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-jwt': jwt
        },
        params: {
        'categoryId': category
        },
        data: JSON.stringify({
            packId: packId
        })
    })
}