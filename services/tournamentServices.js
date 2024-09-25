import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { setStandings, setGroups, getTeams } from '../redux/actions/actions';
const filePath = require('../assets/status_code.json');

const convertSecondToTimestamp = (timeStamp) => {
    const dt = new Date(timeStamp*1000)
    return dt;
}

export const getTournamentBySport = async ({axiosInstance, sport}) => {
    try {
        const authToken = await AsyncStorage.getItem('AcessToken');
        const response = await axiosInstance.get(`${BASE_URL}/${sport.name}/getTournamentsBySport/${sport.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        })
        const item = response.data;
        if (!item || item === null) {
            return [];
        } else {
            
            const dataWithDisplayText = item?.tournament.map((it, index) => {
                 it.start_timestamp = convertSecondToTimestamp(it.start_timestamp);
                let currentStatus;
                if(it.status_code === 'not_started'){
                    currentStatus = "upcoming";
                } else if(it.status_code === 'finished') {
                    currentStatus = "ended";
                } else {
                    currentStatus = "live";
                }

                //set the display text
                let displayText = '';
                const usernameInitial = it.tournament_name ? it.tournament_name.charAt(0) : '';
                displayText = usernameInitial.toUpperCase();
                return {...it, displayText: displayText, currentStatus:currentStatus}
            });
            const tournamentWithDisplayText = await Promise.all(dataWithDisplayText)
            const categarizedTournament = {live:[], upcoming:[], previous:[]};
            tournamentWithDisplayText.forEach((item) => {
                let category;
                if(item.currentStatus === "live"){
                    category = "live";
                } else if(item.currentStatus === "ended") {
                    category = "previous";
                } else {
                    category = "upcoming"
                }
                categarizedTournament[category].push(item);
            })
            return {game: item.game, tournament: categarizedTournament};
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

export const getTournamentByID = async ({axiosInstance, sport, id}) => {
    try {
        const authToken = await AsyncStorage.getItem("AccessToken");
        const response = await axiosInstance.get(`${BASE_URL}/${sport}/getTournament/${id}`, {
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

export const fetchStandings = async ({tournament, groups, axiosInstance, dispatch}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        let standingData = [];
        for (const item of groups) {
            if (item !== undefined) {
                const response = await axiosInstance.get(`${BASE_URL}/${tournament.sports}/getTournamentStanding`, {
                    params: {
                        tournament_id: tournament.id.toString(),
                        group_id: item.group_id,
                        sports: tournament.sports
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                standingData.push({ groupName: item.group_name, standData: response.data });
            }
        }
        dispatch(setStandings(standingData));
    } catch (err) {
        console.error("Unable to fetch the standings of tournament: ", err);
    }
};

export const getTeamsByTournamentID  = async ({tournamentID, game,  AsyncStorage, axiosInstance}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken')
        const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTournamentTeam/${tournamentID}`, {
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
