import React from 'react'
import ClubCricketMatch from '../components/ClubCricketMatch';
import ClubFootballMatch from '../components/ClubFootballMatch';

const TeamMatches = ({teamData, game}) => {
    switch (game.name) {
        case "cricket":
            return <ClubCricketMatch  teamData={teamData}/>;
        default:
            return <ClubFootballMatch  teamData={teamData}/>;
    }
}

export default TeamMatches;