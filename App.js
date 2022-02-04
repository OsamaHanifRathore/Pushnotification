/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React , {useEffect , useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Share from 'react-native-share';
import {GoogleSignin , GoogleSigninButton} from '@react-native-community/google-signin';


import PushNotification from "react-native-push-notification";

import FireBase from "@react-native-firebase/app";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import messaging from '@react-native-firebase/messaging';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


GoogleSignin.configure(

)

function App({navigation}){
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
  
      
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },
    
      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
    
        // process the notification
        if (notification.foreground) {
       
          PushNotification.localNotification({
              title:notification.title,
              message:notification.message
          });
       } 
        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
    
      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);
    
        // process the action
      },
    
      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function(err) {
        console.error(err.message, err);
      },
    
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
    
      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,
    
      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });
   
    PushNotification.createChannel(
      {
        channelId: "fcm_fallback_notification_channel", // (required)
        channelName: "channel", // (required)
      // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) )

     
    }
  , [])


 
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />   
        <Stack.Screen name="Setting" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function HomeScreen({navigation}){
  const [googleInfo , setGoogleInfo] = useState({});
  const [loader  , isLoader]  = useState(false);
  
  useEffect(()=>{
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      navigation.navigate(`${remoteMessage.notification.body}`);
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
        }
      });
  },[])

  const signIn = async() =>{
    try{
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()
      console.log("user info called" , userInfo);
      setGoogleInfo(userInfo);
     
      console.log("google info = " , googleInfo);
    }catch(e){
        console.log("error " , e);
    }
 
  }

  const shareOptions = {
    title: 'Share via',
    message: 'some message',
    url: 'some share url', // only for base64 file in Android
  };

 
  return (
  <View>
    <Text>home</Text>
    <GoogleSigninButton onPress={signIn}/>
    <Button onPress={()=>{
     Share.open(shareOptions)
     .then((res) => {
       console.log(res);
     })
     .catch((err) => {
       err && console.log(err);
     });
    }} title={"share"}/>
  </View>
  );
}
function SettingsScreen(){
  return (
  <View>
    <Text>Setting</Text>
  </View>
  );
}
const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
