import React from 'react';
import { View, Text } from 'react-native';
import tailwind from 'twrnc';



const PointTable = ({ standingsData, game }) => {
    let tableHead;
    let formattedData = [];
    if (Array.isArray(standingsData) && standingsData.length > 0) {

        if (game.name === "football") {
            tableHead = ["Team", "M", "W", "L", "D", "G","GA", "GD", "Pts"];
            formattedData = standingsData.map(item => [
                item?.teams?.name, item.matches, item.wins, item.loss, item.draw, item.goal_for, item.goal_against, item.goal_difference, item.points
            ]);
        } else if (game.name === "cricket") {
            tableHead = ["Team", "M", "W", "L", "D", "Pts"];
            formattedData = standingsData.map(item => [
                item?.teams?.name, item.matches, item.wins, item.loss, item.draw, item.points
            ]);
        }
    }
    const standingData = colForm(formattedData);

    return (
        <>
            {standingData?.length>0 && (
                <View style={tailwind`p-4 bg-white justify-center`}>
                    <View style={tailwind`flex-row justify-between items-center py-2 border-gray-300 `}>
                        {standingData?.map((colData, colIndex) => (
                            <View style={tailwind``}>
                                <Text style={tailwind`text-black font-semibold text-center`}>{tableHead[colIndex]}</Text>
                                {colData.map((rowData, rowIndex) => (
                                    <Text style={tailwind`items-center justify-center mt-2`} key={rowIndex}>{rowData}</Text>
                                ))}
                            </View>
                        ))}
                    </View>
            </View>
            )}
        </>
    );
}

const colForm = (item) => {
    return item[0]?.map((_, colIndex) => item.map(data => data[colIndex]) )
}

export default PointTable;
