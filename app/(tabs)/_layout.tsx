import React from "react";
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { Tabs } from "expo-router";
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


export default function Layout() {
  return (
    <Tabs 
      backBehavior="order"
      screenOptions={{ 
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "#86868B",
          tabBarStyle: {
            backgroundColor: "#FFFFFF"
          }
      }}>

        <Tabs.Screen
            name="index"
            options={{href: null}}
        />

        <Tabs.Screen name="p-follow_list" options={{
            title: '关注', 
            headerShown: false,
            tabBarIcon: ({ color }) => (
                <FontAwesome6 name="star" size={20} color={color} />
            )
        }}/>

        <Tabs.Screen name="p-trade_bookkeeping" options={{
            title: '交易', 
            headerShown: false,
            tabBarIcon: ({ color }) => (
                <FontAwesome5 name="exchange-alt" size={20} color={color} />
            )
        }}/>

        <Tabs.Screen name="p-analyze" options={{
            title: '分析', 
            headerShown: false,
            tabBarIcon: ({ color }) => (
                <FontAwesome6 name="chart-bar" size={20} color={color} />
            )
        }}/>

        <Tabs.Screen name="p-settings" options={{
            title: '设置', 
            headerShown: false,
            tabBarIcon: ({ color }) => (
                <FontAwesome5 name="cog" size={20} color={color} />
            )
        }}/>
    </Tabs>
  );
}