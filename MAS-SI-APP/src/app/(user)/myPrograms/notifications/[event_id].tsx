import { View, Text, Dimensions, ScrollView, StatusBar, useWindowDimensions, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { EventsType } from '@/src/types'
import { useAuth } from '@/src/providers/AuthProvider'
import { supabase } from '@/src/lib/supabase'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from 'react-native-reanimated'
import { defaultProgramImage } from '@/src/components/ProgramsListProgram'
import NotificationCard from './NotificationCard'
import { Icon } from 'react-native-paper'
const NotificationEventSettings = () => {
  const { event_id } = useLocalSearchParams()
  const { session } = useAuth()
  const [ event, setEvent ] = useState<EventsType>() 
  const layout = useWindowDimensions().width
  const layoutHeight = useWindowDimensions().height
  const [ scrollY, setScrollY ] = useState(0)
  const [ active, setActive ] = useState(0)
  const [ selectedNotification, setSelectedNotification ] = useState<number[]>([])
  const NOTICARDHEIGHT  = layoutHeight / 12
  const NOTICARDWIDTH  = layout * 0.8

  const getProgram = async( ) => {
    const { data, error } = await supabase.from('events').select("*").eq("event_id", event_id ).single()
    if( data ){
      setEvent(data)
    }
  }
  const tabBarHeight = useBottomTabBarHeight() + 30
  const { width } = Dimensions.get("window")
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const scrollOffset = useScrollViewOffset(scrollRef)
  const imageAnimatedStyle = useAnimatedStyle(() => {
    return{
      transform: [
        {
          translateY : interpolate(
          scrollOffset.value,
          [-250, 0, 250 ],
          [-250/2, 0, 250 * 0.75]
          )
        },
        {
          scale: interpolate(scrollOffset.value, [-250, 0, 250], [2, 1, 1])
        }
      ]
    }
  })

  const handleScroll = (event : any) =>{
      const scrollPositon = event.nativeEvent.contentOffset.y
      const index = scrollPositon / NOTICARDHEIGHT 
      setActive(index)
    }
  useEffect(() => {
    getProgram()
  },[])

  const array = [ 1, 2, 3, 4, 5, 6]
  return (
    <View className='flex-1 bg-white' style={{flexGrow: 1}}>
     <StatusBar barStyle={"dark-content"}/>
     <Stack.Screen options={{ title : ''}}/>
      <Animated.ScrollView 
      ref={scrollRef}  
      scrollEventThrottle={16} 
      contentContainerStyle={{justifyContent: "center", alignItems: "center", marginTop: "2%", backgroundColor : "white", paddingBottom : tabBarHeight}} 
      >
          
          <View>
            <Animated.Image 
              source={ { uri: event?.event_img || defaultProgramImage }}
              style={ [{width: width / 1.2, height: 300, borderRadius: 8 }, imageAnimatedStyle] }
              resizeMode='stretch'
            />
          </View>
          <View className='flex-col bg-white w-[100%] h-[80]'>
            <Text className='font-bold text-2xl text-center'>{event?.event_name}</Text>
            <Text className='font-bold text-gray-400 text-center'>{event?.event_speaker}</Text>

            <View className='ml-2'>
              <Text>Notification Options</Text>
            </View>
          </View>
          <View className='bg-white w-[100%] items-center'>
            {
              array.map((item , index) => {
                return(
                  <View className='flex-col'>
                    <View className='flex-row items-center justify-center'>
                      <NotificationCard height={NOTICARDHEIGHT} width={NOTICARDWIDTH} index={index} scrollY={scrollY} setSelectedNotification={setSelectedNotification} selectedNotification={selectedNotification}/>
                    </View>
                    <View style={{height : 10}}/>
                  </View>
                )
              })
            }
          </View>
        </Animated.ScrollView>
    </View>
  )
}

export default NotificationEventSettings