import * as actionTypes from '../types/actionTypes';

const initialState = {
        matches: [],
        match: []
}

const  matchesReducers = (state=initialState, action) => {

    switch (action.type) {
        case actionTypes.GET_MATCHES:
            return {
                ...state,
                matches: Array.isArray(action.payload) ? action.payload: [],
            };
        case actionTypes.SET_MATCHES:
            return {
                ...state,
                matches: [...state.matches, action.payload],
            };
        case actionTypes.GET_MATCH:
            return {
                ...state,
                match: action.payload
            }
        case actionTypes.SET_MATCH_STATUS:
            const {id, status_code} = action.payload;
            const updateMatch = {
                ...state.matches,
                group_stage: state.matches.group_stage?.map((item) => {
                    item.id === id ? {...state.item, status_code} : state.item
                }),
                knockout_stage: {
                    ...state.matches.knockout_stage,
                    final: state.matches.knockout_stage?.final?.map(itm => itm.id === id ? {
                            ...itm,
                            status_code
                        }: itm
                    ),
                    semifinal: state.matches.knockout_stage?.semifinal?.map(itm => itm.id === id ? {
                            ...itm,
                            status_code
                        }: itm
                    ), 
                    quaterfinal: state.matches.knockout_stage?.quaterfinal?.map(itm => itm.id === id ? {
                            ...itm,
                            status_code
                        }: itm
                    ),
                },
                league_stage: {
                    ...state.matches.league_stage,
                    league_stage: state.matches?.league_stage?.map(itm => itm.id === id ? {
                            ...itm,
                            status_code
                        } : itm
                    )
                }
            }
            const updateSingleMatch = state.match.id === action.payload.id ? {
                ...state.match,
                ...action.payload
            } : state.match;
            return {
                ...state,
                match: updateSingleMatch,
                matches: updateMatch
            }
        default:
            return state;
    }
}

export default matchesReducers;