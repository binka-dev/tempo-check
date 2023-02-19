import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MainStackNavigator from './MainStackNavigator';
import SettingsScreen from '../SettingsScreen';

const Tab = createBottomTabNavigator();

const navigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
    }
}

function BottomTabNavigator() {
    return (
        <NavigationContainer theme={navigationTheme}>
            <Tab.Navigator>
                <Tab.Screen 
                    name="Start" 
                    component={MainStackNavigator} 
                    options={{
                        headerShown: false,
                        tabBarIcon: ({focused, color, size}) => <Icon name="car" size={size} color={color}/>
                    }} 
                />
                <Tab.Screen 
                    name="Einstellungen" 
                    component={SettingsScreen} 
                    options={{
                        tabBarIcon: ({focused, color, size}) => <Icon name="cog" size={size} color={color}/>
                    }} 
                />
            </Tab.Navigator>
        </NavigationContainer>
    )
}
export default BottomTabNavigator;