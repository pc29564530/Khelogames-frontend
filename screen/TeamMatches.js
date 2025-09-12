import React from 'react'
import ClubCricketMatch from '../components/ClubCricketMatch';
import ClubFootballMatch from '../components/ClubFootballMatch';

const TeamMatches = ({teamData, game, parentScrollY, headerHeight, collapsedHeader}) => {
    switch (game.name) {
        case "cricket":
            return <ClubCricketMatch  teamData={teamData} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>;
        default:
            return <ClubFootballMatch  teamData={teamData} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>;
    }
}

export default TeamMatches;