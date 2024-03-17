import { combineReducers } from "redux";
import authReducers from "./authReducers";
import createUserReducers from "./createUserReducers";
import signUpReducers from "./signUpReducers";
import mobileNumberReducers from "./mobileNumberReducers";
import threadsReducers from "./threadsReducers";
import commentsReducers from "./commentReducers";
import userReducers from "./userReducers";
import joinedCommunityReducer from "./joinedCommunityReducer";
import communityReducers from "./communityReducers"
import editProfileReducers from "./editProfileReducers";
import profileReducers from "./profileReducers";

const rootReducer = combineReducers({
    signup: signUpReducers,
    auth: authReducers,
    newuser: createUserReducers,
    mobilenumber: mobileNumberReducers,
    threads: threadsReducers,
    comments: commentsReducers,
    user: userReducers,
    joinedCommunity: joinedCommunityReducer,
    community: communityReducers,
    editProfile: editProfileReducers,
    profile: profileReducers
});

export default rootReducer;