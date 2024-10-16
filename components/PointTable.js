import React from 'react';
import { View, Text } from 'react-native';
import tailwind from 'twrnc';



const PointTable = ({ standingsData }) => {
    let tableHead;
    let formattedData = [];
    if (Array.isArray(standingsData) && standingsData.length > 0) {
        const sportType = standingsData[0]?.sport_type;

        if (sportType === "Football") {
            tableHead = ["Team", "W", "L", "D", "GD", "Pts"];
            formattedData = standingsData.map(item => [
                item.club_name, item.wins, item.loss, item.draw, item.goal_difference, item.points
            ]);
        } else if (sportType === "Cricket") {
            tableHead = ["Team", "W", "L", "D", "Pts"];
            formattedData = standingsData.map(item => [
                item.club_name, item.wins, item.loss, item.draw, item.points
            ]);
        }
    }
    const standingData = colForm(formattedData);

    return (
        <View style={tailwind`p-4 bg-white rounded-md shadow-md justify-center`}>
            <View style={tailwind`flex-row justify-between items-center py-2 border-gray-300 `}>
                {standingData?.map((colData, colIndex) => (
                    <View style={tailwind``}>
                        <Text style={tailwind`text-black`}>{tableHead[colIndex]}</Text>
                        {colData.map((rowData, rowIndex) => (
                            <Text style={tailwind`items-center justify-center mt-2`} key={rowIndex}>{rowData}</Text>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}

const colForm = (item) => {
    return item[0]?.map((_, colIndex) => item.map(data => data[colIndex]) )
}

export default PointTable;
