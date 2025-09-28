import * as actionTypes from '../types/actionTypes';


const initialState = {
   tournaments: [],
   tournament:[],
   standings: [],
   groups:[]
}

const tournamentsReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_TOURNAMENT_BY_SPORT:
            return {
                ...state,
                tournaments: action.payload
            }
        case actionTypes.GET_TOURNAMENT_BY_ID:
            return {
                ...state,
                tournament: action.payload
            }
        case actionTypes.SET_STANDING:
            return {
                ...state,
                standings: action.payload
            }
        case actionTypes.SET_GROUP:
            return {
                ...state,
                groups: action.payload
            }
        case actionTypes.ADD_TEAM_GROUP:
            const updatedGroups = state.groups.map((grp) => {
                if (grp.id === action.payload.groupId && grp.tournament_id === action.payload.tournamentId) {
                    return {
                        ...grp,
                        teams: [...grp.teams, action.payload.teamId]
                    };
                }
                return grp;
            });
            return {
                ...state,
                groups: updatedGroups
            };
        case actionTypes.ADD_GROUP:
            return {
                ...state,
                groups: [...state.groups, action.payload]
            }
        case actionTypes.ADD_TOURNAMENT:
            return {
                ...state,
                tournaments: [...state.tournaments, action.payload]
            }
        default:
            return state
    }
}

export default tournamentsReducers;