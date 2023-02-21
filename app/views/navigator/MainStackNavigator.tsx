import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react'
import DriveDetailScreen from '../DriveDetailScreen';
import StartScreen from '../StartScreen';

const Stack = createStackNavigator();

function MainStackNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="MainView" component={StartScreen} options={{headerShown: false, title: 'Hauptbildschirm'}}/>
                <Stack.Screen name="DriveDetailScreen" component={DriveDetailScreen} options={{title: 'Detailansicht'}}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default MainStackNavigator;