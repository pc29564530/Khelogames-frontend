import { combineReducers } from "redux";
import authReducers from "./authReducers";
import createUserReducers from "./createUserReducers";
import signUpReducers from "./signUpReducers";
import mobileNumberReducers from "./mobileNumberReducers";

const rootReducer = combineReducers({
    signup: signUpReducers,
    auth: authReducers,
    user: createUserReducers,
    mobilenumber: mobileNumberReducers,
});

export default rootReducer;