import React from 'react';
import {View, Pressable, Button, StyleSheet} from 'react-native'
import Header from './Header';
import Footer from './Footer';
import Thread from './Thread';
import AddCommentIcon from '@mui/icons-material/AddComment';

function Home({navigation}) {
    
    return (
        <View style={styles.container}>``
            <View style={styles.header}> <Header /> </View>
            <View style={styles.content}>
                <Pressable onPress={()=>navigation.navigate('CreateThread')}><AddCommentIcon /></Pressable>
                <Thread />
            </View>
            <View style={styles.footer}> <Footer /> </View>
            {/* <Button onPress={handleLogout}></Button> */}
            
        </View>
    );  
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      backgroundColor: '#f0f0f0',
      padding: 10,
    },
    headerText: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      backgroundColor: '#ffffff',
      padding: 10,
    },
    footer: {
      backgroundColor: '#f0f0f0',
      padding: 10,
      justifyContent: 'flex-end',
    },
    footerText: {
      fontSize: 16,
    },
  });
  

export default Home;