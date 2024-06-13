import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { setStandings, setGroups } from '../redux/actions/actions';

export const getTournamentBySport = async ({axiosInstance, sport, category}) => {
    try {
        const authToken = await AsyncStorage.getItem('AcessToken');
        //need to lowercase the word of sport 
        const response = await axiosInstance.get(`${BASE_URL}/${sport}/getTournamentByLevel`, {
            params: {
                category: category
            },
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
        })
        const item = response.data;
        if (!item || item === null) {
            return [];
        } else {
            
            const dataWithDisplayText = item.map((it, index) => {

                //currentStatus
                const startDate = new Date(it.start_on);
                const endDate = new Date(it.end_on);
                const currentDate = new Date();
                const remainingStartTime = startDate.getTime()-currentDate.getTime();
                const remainingEndTime = endDate.getTime()-currentDate.getTime();
                const days = Math.ceil(remainingStartTime/(100*3600*24));
                const endDays = Math.ceil(remainingEndTime/(1000*3600*24));
                let currentStatus;
                if(days>0){
                    currentStatus = "upcoming";
                } else if(endDays<0) {
                    currentStatus = "ended";
                } else {
                    currentStatus = "live";
                }

                // //set the date 
                // const dateStartStr = it.start_on;
                // const dateEndStr = it.end_on;
                // const timeStampStartOn = new Date(dateStartStr);
                // const timeStampEndOn = new Date(dateEndStr);
                // const options = {weekday: 'long', month:'long', day:'2-digit'}
                // const formattedStartOn = timeStampStartOn.toLocaleString('en-US', options);
                // const formattedEndOn = timeStampEndOn.toLocaleString('en-US', options);
                // it.start_on = formattedStartOn;
                // it.end_on = formattedEndOn;

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
            return categarizedTournament;
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

export const fetchGroups = (tournament, axiosInstance) => {
    return async (dispatch) => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${tournament.sport_type}/getTournamentGroups`, {
                params: { tournament_id: tournament.tournament_id.toString() },
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
};

export const fetchStandings = (tournament, groups, axiosInstance) => {
    return async (dispatch) => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            let standingData = [];
            for (const item of groups) {
                if (item !== undefined) {
                    const response = await axiosInstance.get(`${BASE_URL}/${tournament.sport_type}/getTournamentStanding`, {
                        params: {
                            tournament_id: tournament.tournament_id.toString(),
                            group_id: item.group_id,
                            sport_type: tournament.sport_type
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
};
