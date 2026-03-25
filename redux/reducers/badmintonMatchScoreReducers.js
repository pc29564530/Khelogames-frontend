import * as actionTypes from '../types/actionTypes';

const initialState = {
    match: {}
};

const badmintonMatchScoreReducers = (state = initialState, action) => {
    switch (action.type) {

        case actionTypes.GET_MATCH:
            return {
                ...state,
                match: action.payload,
            };

        case actionTypes.SET_MATCH_STATUS: {
            // Backend sends: { id, public_id, status_code, result, ... }
            // WebSocket sends: { id, public_id, status_code, result, ... }
            const matchId = action.payload.public_id ?? action.payload.match_public_id;
            const matchNumericId = action.payload.match_id ?? action.payload.id;

            // Match by public_id first, fallback to numeric id
            const isCurrentMatch =
                (matchId && state.match?.public_id === matchId) ||
                (matchNumericId && state.match?.id === matchNumericId);

            if (!state.match || !isCurrentMatch) {
                return state;
            }

            return {
                ...state,
                match: {
                    ...state.match,
                    status_code: action.payload.status_code ?? state.match.status_code,
                    result: action.payload.result ?? state.match.result,
                },
            };
        }

        case actionTypes.SET_MATCH_RESULT: {
            const matchId = action.payload.public_id ?? action.payload.match_public_id;
            const matchNumericId = action.payload.match_id ?? action.payload.id;

            const isCurrentMatch =
                (matchId && state.match?.public_id === matchId) ||
                (matchNumericId && state.match?.id === matchNumericId);

            if (!state.match || !isCurrentMatch) {
                return state;
            }

            return {
                ...state,
                match: {
                    ...state.match,
                    result: action.payload.result ?? state.match.result,
                },
            };
        }

        case actionTypes.SET_BADMINTON_SCORE: {
            if (!state.match || state.match.public_id !== action.payload.public_id) {
                return state;
            }

            return {
                ...state,
                match: {
                    ...state.match,
                    homeScore: action.payload.homeScore ?? state.match.homeScore,
                    awayScore: action.payload.awayScore ?? state.match.awayScore,
                },
            };
        }

        case actionTypes.ADD_BADMINTON_SCORE: {
            if (!state.match || state.match.id !== action.payload.match_id) {
                return state;
            }

            const isAway = state.match.away_team_id === action.payload.team_id;
            const hScore = action.payload?.home_score ?? action.payload?.homeScore;
            const aScore = action.payload?.away_score ?? action.payload?.awayScore;

            return {
                ...state,
                match: {
                    ...state.match,
                    homeScore: isAway ? state.match.homeScore : hScore,
                    awayScore: isAway ? aScore : state.match.awayScore,
                },
            };
        }

        default:
            return state;
    }
};

export default badmintonMatchScoreReducers;
