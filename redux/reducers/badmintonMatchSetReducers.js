import * as actionTypes from '../types/actionTypes';

const initialState = {
    sets: [],
    points: [],
    currentSet: null,
    currentSetScore: null,
};

const badmintonMatchSetReducers = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.ADD_BADMINTON_NEW_SET: {
            if (!action.payload) return state;
            const sets = [...(state.sets || []), action.payload];
            console.log("Redux Sets: ", sets)
            const current = sets.find(s => s.set_status === 'in_progress');
            console.log("New Set Current: ", current);
            return {
                ...state,
                sets,
                currentSet: current?.set_number || null,
                currentSetScore: current || null,
            };
        }
        case actionTypes.SET_BADMINTON_SETS: {
            const sets = action.payload || [];
            const current = sets.find(s => s.set_status === 'in_progress');
            return {
                ...state,
                sets,
                currentSetScore: current || null,
                currentSet: current?.set_number || null,
            };
        }

        case actionTypes.ADD_BADMINTON_SET: {
            if (!state.sets || !action.payload) return state;

            const { set, point, newSet } = action.payload;
            if (!set) return state;

            // Update the matching set's score and append the new point
            const updatedSets = state.sets.map((it) => {
                if (it.set_number === set.set_number) {
                    return {
                        ...it,
                        home_score: set.home_score,
                        away_score: set.away_score,
                        set_status: set.set_status || it.set_status,
                        points: point
                            ? [...(it.points || []), point]
                            : it.points,
                    };
                }
                return it;
            });

            // Update currentSet/currentSetScore if this set is in_progress
            let updatedCurrentSet = state.currentSet;
            let updatedCurrentSetScore = state.currentSetScore;

            if (set.set_status === 'in_progress') {
                updatedCurrentSet = set.set_number;
                // Find the updated set from updatedSets to get the full object with points
                updatedCurrentSetScore = updatedSets.find(s => s.set_number === set.set_number) || set;
            } else if (state.currentSet === set.set_number) {
                // Current set just completed — find the updated version
                updatedCurrentSetScore = updatedSets.find(s => s.set_number === set.set_number) || set;
            }

            return {
                ...state,
                sets: updatedSets,
                currentSet: updatedCurrentSet,
                currentSetScore: updatedCurrentSetScore,
            };
        }

        case actionTypes.SET_BADMINTON_POINTS: {
            return {
                ...state,
                points: action.payload || [],
            };
        }

        case actionTypes.SET_BADMINTON_POINT: {
            if (!action.payload?.match_id) {
                return state;
            }

            return {
                ...state,
                points: [...state.points, action.payload],
            };
        }

        default:
            return state;
    }
};

export default badmintonMatchSetReducers;
