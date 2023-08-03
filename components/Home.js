import React from 'react';
import {View, Pressable, Button} from 'react-native'
import Header from './Header';
import Footer from './Footer';
import Thread from './Thread';
import AddCommentIcon from '@mui/icons-material/AddComment';

function Home({navigation}) {
    const handleLogout = () => {
        localStorage.removeItem('user');
        navigation.navigate('SignIn');
    }
    return (
        <View>
            <Header />
            <Pressable onPress={()=>navigation.navigate('Thread')}><AddCommentIcon /></Pressable>
            <Button onPress={handleLogout}></Button>
            <Footer />
        </View>
    );
}

export default Home;