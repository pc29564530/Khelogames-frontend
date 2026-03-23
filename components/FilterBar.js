import {View, Text, Pressable} from 'react-native';
import tailwind from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';

export const MatchesFilterBar = ({
  selectedDate,
  setIsDatePickerVisible,
  handleLocation,
  handleLiveMatches,
  formattedDate,
  handleNextDate,
  handlePrevDate
}) => {
  return (
    <View
      style={[
        tailwind`px-4 py-3`,
        {
          backgroundColor: "#0f172a",
          borderBottomWidth: 1,
          borderBottomColor: "#334155"
        }
      ]}
    >
      {/* DATE NAVIGATION */}
      <View style={tailwind`flex-row items-center justify-between mb-3`}>

        {/* LEFT ARROW */}
        <Pressable
          onPress={handlePrevDate}
          style={tailwind`p-2 rounded-full bg-slate-800`}
        >
          <AntDesign name="left" size={16} color="#e2e8f0" />
        </Pressable>

        {/* DATE */}
        <Pressable
          onPress={() => setIsDatePickerVisible(true)}
          style={tailwind`flex-row items-center px-4 py-2 rounded-xl bg-slate-800`}
        >
          <AntDesign name="calendar" size={16} color="#94a3b8" />
          <Text style={[tailwind`ml-2 font-semibold`, {color: "#f1f5f9"}]}>
            {formattedDate(selectedDate)}
          </Text>
        </Pressable>

        {/* RIGHT ARROW */}
        <Pressable
          onPress={handleNextDate}
          style={tailwind`p-2 rounded-full bg-slate-800`}
        >
          <AntDesign name="right" size={16} color="#e2e8f0" />
        </Pressable>
      </View>

      {/* ACTION BUTTONS */}
      <View style={tailwind`flex-row justify-between`}>

        <Pressable
          onPress={handleLocation}
          style={tailwind`flex-1 mr-2 py-2 rounded-xl bg-slate-800 items-center`}
        >
          <Text style={tailwind`text-white text-sm font-medium`}>
            📍 Nearby
          </Text>
        </Pressable>

        <Pressable
          onPress={handleLiveMatches}
          style={tailwind`flex-1 ml-2 py-2 rounded-xl bg-red-500 items-center`}
        >
          <Text style={tailwind`text-white text-sm font-medium`}>
            🔴 Live
          </Text>
        </Pressable>

      </View>
    </View>
  );
};


export const FilterBar = ({
  typeFilter,
  setTypeFilterModal,
  setStatusFilterModal,
  statusFilter
}) => {
  return (
    <View
      style={[
        tailwind`flex-row px-4 py-2`,
        {
          backgroundColor: "#0f172a",
          borderBottomWidth: 1,
          borderBottomColor: "#334155"
        }
      ]}
    >

      {/* CATEGORY */}
      <Pressable
        onPress={() => setTypeFilterModal(true)}
        style={[
          tailwind`flex-row items-center px-4 py-2 rounded-xl mr-2`,
          typeFilter !== "all"
            ? tailwind`bg-red-500`
            : tailwind`bg-slate-800`
        ]}
      >
        <Text style={tailwind`mr-1 text-sm`}>
          🎯
        </Text>
        <Text style={tailwind`text-white text-sm`}>
          {typeFilter !== "all" ? typeFilter : "Category"}
        </Text>
      </Pressable>

      {/* STATUS */}
      <Pressable
        onPress={() => setStatusFilterModal(true)}
        style={[
          tailwind`flex-row items-center px-4 py-2 rounded-xl`,
          statusFilter !== "all"
            ? tailwind`bg-red-500`
            : tailwind`bg-slate-800`
        ]}
      >
        <Text style={tailwind`mr-1 text-sm`}>
          ⏱
        </Text>
        <Text style={tailwind`text-white text-sm`}>
          {statusFilter !== "all" ? statusFilter : "Status"}
        </Text>
      </Pressable>

    </View>
  );
};