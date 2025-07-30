import AsyncStorage from "@react-native-async-storage/async-storage";

export const fetchTeamPlayers = async (BASE_URL, teamPublicID, game, axiosInstance) => {
    try {
        const authToken = await AsyncStorage.getItem("AccessToken");
        const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsMemberFunc/${teamPublicID}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data || [];
        
    } catch (err) {
        console.error("unable to fetch the team player: ", err);
        return err
    }
}