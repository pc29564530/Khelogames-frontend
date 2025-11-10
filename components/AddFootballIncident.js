import React, {useLayoutEffect} from 'react';
import {View, Pressable} from 'react-native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

// Import the separate components
import StandardIncidentForm from '../components/form/StandardIncidentForm';
import SubstitutionIncidentForm from '../components/form/SubstitutionIncidentForm';
import ShootoutIncidentForm from '../components/form/ShootoutIncidentForm';
import PeriodIncidentForm from '../components/form/PeriodIncidentForm';

const AddFootballIncident = ({ route }) => {
    const {
        match, 
        tournament, 
        awayPlayer, 
        homePlayer, 
        awayTeam, 
        homeTeam, 
        incidentType, 
        homeSquad, 
        awaySquad,
        componentType = "standard"
    } = route.params;
    
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: `Add ${incidentType.charAt(0).toUpperCase() + incidentType.slice(1).replace(/_/g, ' ')}`,
            headerLeft: () => (
                <Pressable onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="black" style={tailwind`ml-4`} />
                </Pressable>
            ),
            headerStyle: tailwind`bg-red-400`,
        });
    }, [navigation, incidentType]);

    // Render appropriate component based on type
    const renderComponent = () => {
        const commonProps = {
            match,
            tournament,
            awayPlayer,
            homePlayer,
            awayTeam,
            homeTeam,
            homeSquad,
            awaySquad,
            incidentType,
            navigation
        };

        switch (componentType) {
            case "substitution":
                return <SubstitutionIncidentForm {...commonProps} />;
            case "shootout":
                return <ShootoutIncidentForm {...commonProps} />;
            case "period":
                return <PeriodIncidentForm {...commonProps} />;
            default:
                return <StandardIncidentForm {...commonProps} />;
        }
    };

    return (
        <View style={tailwind`flex-1 bg-white`}>
            {renderComponent()}
        </View>
    );
};

export default AddFootballIncident;