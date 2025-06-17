import * as actionTypes from '../types/actionTypes';

const initialState = {
    currentInning: "inning1", // "inning1", "inning2", "inning3", "inning4"
    inningStatus: 'not_started', // "not_started", "in_progress", "break", "completed"
    battingTeam: null,
    completedInnings: [], // Array of { teamId, inningNumber, score }
    currentInningNumber: 1,
    matchFormat: "ODI", // or "T20", "TEST"
};

const cricketMatchInningReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_CURRENT_INNING:
            return {
                ...state,
                currentInning: action.payload
            };

        case actionTypes.SET_INNING_STATUS:
            return {
                ...state,
                inningStatus: action.payload
            };

        case actionTypes.SET_BATTING_TEAM:
            return {
                ...state,
                battingTeam: action.payload
            };

        case actionTypes.SET_MATCH_FORMAT:
            return {
                ...state,
                matchFormat: action.payload
            };

        case actionTypes.SET_INNING_COMPLETED: {
            const newCompletedInnings = [...state.completedInnings, action.payload];
            const nextInningNumber = state.currentInningNumber + 1;

            let nextInning = `inning${nextInningNumber}`;
            let inningStatus = 'in_progress';

            const maxInnings = state.matchFormat === "TEST" ? 4 : 2;

            if (nextInningNumber > maxInnings) {
                inningStatus = 'completed';
                nextInning = null;
            }

            return {
                ...state,
                completedInnings: newCompletedInnings,
                currentInningNumber: nextInningNumber,
                currentInning: nextInning,
                inningStatus
            };
        }

        default:
            return state;
    }
};

export default cricketMatchInningReducer;
