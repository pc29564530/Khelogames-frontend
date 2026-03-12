import React, {useState, useRef} from 'react';
import { Pressable, Text, View, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';

const incidentsTypes = [
    "goal",
    "penalty",
    "foul",
    "shot_on_target",
    "free_kick",
    "penalty_miss",
    "yellow_card",
    "red_card",
    "substitution",
    "penalty_shootout",
    "period",
    "corner_kick"
];

const AddFootballModalIncident = ({
    tournament,
    match,
    awayPlayer,
    homePlayer,
    awayTeam,
    homeTeam,
    homeSquad,
    awaySquad,
    setIncidentModalVisible
}) => {
    const scrollViewRef = useRef(null);
    const navigation = useNavigation();
    const [selectedIncident, setSelectedIncident] = useState("");

    const handleIncident = (item) => {
        setSelectedIncident(item);

        // Common params for all screens
        const baseParams = {
            tournament,
            match,
            awayPlayer,
            homePlayer,
            awayTeam,
            homeTeam,
            homeSquad,
            awaySquad,
            incidentType: item
        };

        // Navigate to appropriate screen based on incident type
        switch (item) {
            case "substitution":
                navigation.navigate("AddFootballIncident", {
                    ...baseParams,
                    componentType: "substitution"
                });
                break;
            case "penalty_shootout":
                navigation.navigate("AddFootballIncident", {
                    ...baseParams,
                    componentType: "shootout"
                });
                break;
            case "period":
                navigation.navigate("AddFootballIncident", {
                    ...baseParams,
                    componentType: "period"
                });
                break;
            default:
                navigation.navigate("AddFootballIncident", {
                    ...baseParams,
                    componentType: "standard"
                });
                break;
        }

        // Close the modal if needed
        if (setIncidentModalVisible) {
            setIncidentModalVisible(false);
        }
    };

    const scrollRight = () => {
        scrollViewRef.current?.scrollTo({x: 100, animated: true});
    };

    return (
        <View style={tailwind`mt-2`}>
            <View style={tailwind`mt-4`}>
                <Text style={[tailwind`text-xl font-bold mb-4`, { color: '#f1f5f9' }]}>Select Incident Type</Text>
                <View style={tailwind`flex-row items-end`}>
                    <View style={tailwind`flex-row flex-wrap gap-3`}>
                        {incidentsTypes.map((item, index) => {
                            const isSelected = selectedIncident === item;
                            return (
                            <Pressable
                                key={index}
                                onPress={() => handleIncident(item)}
                                style={[
                                tailwind`px-5 py-2 rounded-full`,
                                isSelected
                                    ? { backgroundColor: '#f87171', borderWidth: 1, borderColor: '#f87171' }
                                    : { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
                                ]}
                            >
                                <Text style={[
                                tailwind`text-sm font-semibold capitalize`,
                                isSelected ? { color: '#ffffff' } : { color: '#cbd5e1' }
                                ]}>
                                {item.replace(/_/g, ' ')}
                                </Text>
                            </Pressable>
                            );
                        })}
                    </View>
                    <Pressable onPress={scrollRight} style={tailwind`ml-2 p-2`}>
                        <MaterialIcons name="keyboard-arrow-right" size={32} color="#64748b" />
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default AddFootballModalIncident;