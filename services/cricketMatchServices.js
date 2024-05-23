
export const addCricketScoreServices = async ({sport, dispatch, item, authToken, axiosInstance}) => {
    try {
        const scoreData1 = {
            match_id:item.match_id,
            tournament_id: item.tournament_id,
            team_id: item.team1_id,
            score: 0,
            wickets: 0,
            overs: 0,
            extras: 0,
            innings: 0
        }
        const scoreData2 = {
            match_id:item.match_id,
            tournament_id: item.tournament_id,
            team_id: item.team2_id,
            score: 0,
            wickets: 0,
            overs: 0,
            extras: 0,
            innings: 0
        }
        const team1Response = await axiosInstance.post(`${BASE_URL}/${sport}/addCricketMatchScore`,scoreData1, {
            headers: {
                'Authorization':`bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        const team2Response = await axiosInstance.post(`${BASE_URL}/${sport}/addCricketMatchScore`,scoreData2, {
            headers: {
                'Authorization':`bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        dispatch(addCricketMatchScore(team1Response.data || []));
        dispatch(addCricketMatchScore(team2Response.data || []));
    } catch (err) {
        console.log("unable to add the cricket score of team1 and team2 ", err);
    }
}