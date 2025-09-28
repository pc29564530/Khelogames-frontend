import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { setStandings, setGroups, getTeams } from '../redux/actions/actions';
const filePath = require('../assets/status_code.json');

const convertSecondToTimestamp = (timeStamp) => {
    const dt = new Date(timeStamp*1000)
    return dt;
}

export const getTournamentBySport = async ({axiosInstance, game}) => {
    try {
        const authToken = await AsyncStorage.getItem('AcessToken');
        const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTournamentsBySport/${game.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        })
        const item = response.data;
        if (!item || item === null) {
            return [];
        } else {
            return item
        }
    } catch (err) {
        console.error("unable to fetch tournament ", err)
    }
}

export const addNewTournamentBySport = async ({axiosInstance, data, navigation}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const response = await axiosInstance.post(`${BASE_URL}/createTournament`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const item = response.data || {};
            const organizerData = {
                organizer_name:user,
                tournament_id: item.tournament_id
            }
            const responseData = await axiosInstance.post(`${BASE_URL}/createOrganizer`, organizerData,{
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            navigation.navigate("TournamentDesciption", {tournament_id: item.tournament_id});
    } catch (err) {
        console.error("unable to add new tournament and organizer: ", err);
    }
}

export const getTournamentByPublicID = async ({axiosInstance, sport, publicID}) => {
    try {
        const authToken = await AsyncStorage.getItem("AccessToken");
        const response = await axiosInstance.get(`${BASE_URL}/${sport}/getTournament/${publicID}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
        });
    } catch (err) {
        console.error("unable to get the tournament by id: ", err);
    }
}

export const findTournamentByID = ({tournamentBySport, tournamentId, tournamentStatus}) => {
    for (const status of tournamentStatus) {
        const foundTournament = tournamentBySport[status]?.find(status => status.tournament_id===tournamentId);
        if(foundTournament){
            return foundTournament
        };
    }
    return null;
}

export const fetchGroups = async ({tournament, axiosInstance, dispatch}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${BASE_URL}/${tournament.sports}/getTournamentGroups`, {
            params: { tournament_id: tournament.id.toString() },
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        const groups = response.data || [];
        dispatch(setGroups(groups));
    } catch (err) {
        console.error("Unable to fetch the group of tournament: ", err);
    }
};


export const fetchAllGroups = async ({axiosInstance, dispatch: dispatch}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${BASE_URL}/getGroups`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        const groups = response.data || [];
        dispatch(setGroups(groups));
    } catch (err) {
        console.error("Unable to fetch the group of tournament: ", err);
    }
};


export const fetchStandings = async ({tournament, axiosInstance, dispatch, game, loading, setLoading}) => {
    try {
        setLoading(true);
        const authToken = await AsyncStorage.getItem('AccessToken');
        console.log("Game: ", game)
        if (game.name === "football") {
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getFootballStanding/${tournament.public_id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })
            if(response.data){
                dispatch(setStandings(response.data))
            } else {
                dispatch(setStandings( []));
            }
        } else if (game.name === "cricket") {
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketStanding/${tournament.public_id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })
            if(response.data){
                dispatch(setStandings(response.data))
            } else {
                dispatch(setStandings( []));
            }
        }     
    } catch (err) {
        console.error("Unable to fetch the standings of tournament: ", err);
        dispatch(setStandings([]));
    } finally {
        setLoading(false);
    }
};

export const getTeamsByTournamentID  = async ({tournamentPublicID, game,  AsyncStorage, axiosInstance}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken')
        const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTournamentTeam/${tournamentPublicID}`, {
            headers: {
                'Authorization': `bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data || [];
    } catch (err) {
        console.log("unable to fetch the team by tournament id: %v", err);
    }
}


export const getTeamsBySports = async ({game,  AsyncStorage, axiosInstance}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken')
        const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsBySport/${game.id}`, {
            headers: {
                'Authorization': `bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data || [];
    } catch (err) {
        console.log("unable to fetch the team by tournament id: %v", err);
    }
}

