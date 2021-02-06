import axios from "axios";

const authToken = "Bearer 3BhL55WCArPQkd7AsB9t5UwNluyWJ6Huzijv8IRnsjNKZQwXoS8";

export function getMatches(page) {
    return axios.get("https://api.pandascore.co/csgo/matches", {
        headers: {
            'Authorization': authToken
        },
        params: {
            'page': page,
            'per_page': 100
        }
    })
}

export function getMatchesByStartDate(rangeStart, rangeEnd) {
    return axios.get("https://api.pandascore.co/csgo/matches", {
        headers: {
            'Authorization': authToken
        },
        params: {
            'range[begin_at]': `${rangeStart},${rangeEnd}`,
            'per_page': 100
        }
    })
}