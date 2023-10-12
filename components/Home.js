import React, {useEffect, useState  } from 'react';
import {View, Pressable, Button, StyleSheet, ScrollView} from 'react-native'
import Thread from './Thread';


function Home() {
    
    return (
        <ScrollView vertical={true} style={styles.Container}>
            <View style={styles.Content}>
                <Thread />
            </View>
        </ScrollView>
    );  
}

const styles = StyleSheet.create({
    Container: {
      flex: 1,
    },
    Content: {
      backgroundColor: '#ffffff',
      padding: 10,
    },
  });
  

export default Home;