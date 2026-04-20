import React, { useEffect, useMemo, useState } from 'react';
import {
 View, Text, Modal, FlatList,
 Pressable, TextInput, SafeAreaView
} from 'react-native';

import { getAllCountries } from 'react-native-country-picker-modal';

export default function CityPicker({
 visible,
 onClose,
 onSelectCity,
}) {

 const [countries, setCountries] = useState([]);
 const [cities, setCities] = useState([]);
 const [search, setSearch] = useState('');
 const [selectedCountry, setSelectedCountry] = useState(null);

 useEffect(() => {
   loadCountries();
 }, []);

 const loadCountries = async () => {
   const list = await getAllCountries();
   setCountries(list || []);
 };

 const fetchCities = async (countryName) => {
   try {
     const res = await fetch(
       'https://countriesnow.space/api/v0.1/countries/cities',
       {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           country: countryName
         })
       }
     );

     const data = await res.json();
     setCities(data.data || []);
   } catch (err) {
     console.log(err);
   }
 };

 const filteredCountries = useMemo(() => {
   return countries.filter((item) =>
     item.name.toLowerCase().includes(search.toLowerCase())
   );
 }, [countries, search]);

 const filteredCities = useMemo(() => {
   return cities.filter((city) =>
     city.toLowerCase().includes(search.toLowerCase())
   );
 }, [cities, search]);

 const getFlagEmoji = (code) =>
   code?.toUpperCase().replace(/./g,
     c => String.fromCodePoint(127397 + c.charCodeAt())
   );

 return (
 <Modal visible={visible} animationType="slide">
    <SafeAreaView style={{ flex:1, backgroundColor:'#020617' }}>

    <View style={{ padding:20 }}>
        <Text style={{
            color:'white',
            fontSize:22,
            fontWeight:'700'
        }}>
            {selectedCountry ? 'Select City' : 'Select Country'}
        </Text>

        <TextInput
            placeholder={selectedCountry ? 'Search city...' : 'Search country...'}
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
            style={{
            marginTop:14,
            backgroundColor:'#0f172a',
            color:'white',
            borderRadius:14,
            padding:12
            }}
        />
    </View>

    <FlatList
    data={selectedCountry ? filteredCities : filteredCountries}
    keyExtractor={(item, index) =>
        selectedCountry ? index.toString() : item.cca2
    }
    renderItem={({ item }) => (

        selectedCountry ? (

        <Pressable
            onPress={() => {
            onSelectCity({
                country: selectedCountry.name,
                city: item
            });
            onClose();
            }}
            style={{
            padding:16,
            borderBottomWidth:1,
            borderBottomColor:'#1e293b'
            }}
        >
            <Text style={{ color:'white', fontSize:16 }}>
            {item}
            </Text>
        </Pressable>

        ) : (

        <Pressable
            onPress={() => {
            setSelectedCountry(item);
            setSearch('');
            fetchCities(item.name);
            }}
            style={{
            padding:16,
            borderBottomWidth:1,
            borderBottomColor:'#1e293b'
            }}
        >
            <Text style={{ color:'white', fontSize:16 }}>
            {getFlagEmoji(item.cca2)} {item.name}
            </Text>
        </Pressable>

        )
    )}
    />

    {selectedCountry ? (
        <Pressable
            onPress={() => {
            setSelectedCountry(null);
            setCities([]);
            setSearch('');
            }}
            style={{ margin:20 }}
        >
            <Text style={{ color:'#f87171' }}>
            ← Back to Countries
            </Text>
        </Pressable>
    ):(
        <Pressable
            onPress={onClose}
            style={{
            margin:20,
            backgroundColor:'#1e293b',
            padding:16,
            borderRadius:14,
            alignItems:'center'
            }}
        >
            <Text style={{ color:'white' }}>Close</Text>
        </Pressable>
    )}
    </SafeAreaView>
 </Modal>
 );
}