import React from 'react'
import ClubCricketMatch from '../components/ClubCricketMatch';
import ClubFootballMatch from '../components/ClubFootballMatch';
import ClubBadmintonMatch from '../components/ClubBadmintonMatch';

const TeamMatches = ({teamData, game, parentScrollY, headerHeight, collapsedHeader}) => {
    switch (game.name) {
        case "badminton":
            return <ClubBadmintonMatch teamData={teamData} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>;
        case "cricket":
            return <ClubCricketMatch  teamData={teamData} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>;
        default:
            return <ClubFootballMatch  teamData={teamData} parentScrollY={parentScrollY} headerHeight={headerHeight} collapsedHeader={collapsedHeader}/>;
    }
}

export default TeamMatches;