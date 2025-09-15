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
import footballMatchPlayerScoreReducers from "./fooballMatchPlayerScoreReducers";
import footballMatchScoreReducers from "./footballMatchScoreReducers";
import cricketMatchScore from "./cricketMatchScoreReducers";
import cricketMatchInning from "./cricketMatchInning"
import cricketMatchPlayerScore from "./cricketMatchPlayerScoreReducers";
import tournamentsReducers from "./tournamentsReducers";
import sportReducers from "./sportReducers";
import clubReducers from './clubReducers';
import teamsReducers from "./teamsReducers";
import matchesReducers from "./matchesReducers";
import teamPlayerReducers from "./teamPlayerReducers";
import cricketTossReducers from "./cricketMatchTossReducers";
import cricketMatchInningReducer from "./cricketMatchInning";
import tournamentEntitiesReducers from "./tournamentEntitiesReducers";

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
    profile: profileReducers,
    matchScore: footballMatchScoreReducers,
    playerScore: footballMatchPlayerScoreReducers,
    cricketPlayerScore: cricketMatchPlayerScore,
    cricketMatchScore: cricketMatchScore,

    tournamentsReducers: tournamentsReducers,
    sportReducers: sportReducers,
    matches: matchesReducers,
    clubReducers: clubReducers,
    teams: teamsReducers,
    players: teamPlayerReducers,
    cricketToss: cricketTossReducers,
    cricketMatchInning: cricketMatchInningReducer,
    tournamentEntities: tournamentEntitiesReducers,
});

export default rootReducer;