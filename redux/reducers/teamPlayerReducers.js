import { startMapper } from 'react-native-reanimated';
import * as actionTypes from '../types/actionTypes';

const initialState = {
        players: [],
        squads: []
}

const  teamPlayerReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_TEAM_PLAYERS:
            return {
                ...state,
                players: Array.isArray(action.payload) ? action.payload: [],
            };
        case actionTypes.SET_TEAM_PLAYER:
            return {
                ...state,
                players: [...state.players, action.payload],
            };
        case actionTypes.GET_CRICKET_MATCH_SQUAD:
            return {
                ...state,
                squads: Array.isArray(action.payload) ? action.payload: [],
            }
        case actionTypes.SET_CRICKET_MATCH_SQUAD:
            return {
                ...state,
                squads: [...state.squads, action.payload],
            }
        default:
            return state;
    }
}

export default teamPlayerReducers;