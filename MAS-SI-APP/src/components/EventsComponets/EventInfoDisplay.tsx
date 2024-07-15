import { View, Text, Dimensions, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack, router } from "expo-router"
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated,{ interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from 'react-native-reanimated';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/providers/AuthProvider';
import { defaultProgramImage }  from '@/src/components/ProgramsListProgram';
import { Divider, Portal, Modal, IconButton, Icon, Button } from 'react-native-paper';
import SheikData from "@/assets/data/sheikData";
import { Lectures, SheikDataType, Program } from '@/src/types';
import { EventsType } from '@/src/types';
import { EventLectureType } from '@/src/types';
import RenderEventsLectures from './RenderEventLectures';
import RenderEventLectures from "./RenderEventLectures"
type EventInfoDisplayProp = {
    event_img : string
    event_speaker : string
    event_name : string
    event_desc : string
}
const EventInfoDisplay = ({ event_img, event_speaker, event_name, event_desc} : EventInfoDisplayProp) => {
    const [ visible, setVisible ] = useState(false);
    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const Tab = useBottomTabBarHeight()
  
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

    const GetSheikData = (  ) => {
        const sheik : SheikDataType[]  = SheikData.filter(sheik => sheik.name == event_speaker)
        return( 
          <View>
            <View className=' flex-row'>
              <Image source={{uri : sheik[0].image || defaultProgramImage}} style={{width: 110, height: 110, borderRadius: 50}} resizeMode='contain'/>
              <View className='flex-col px-5'>
                <Text className='text-xl font-bold'>Name: </Text>
                <Text className='pt-2 font-semibold'> {sheik[0].name} </Text>
              </View>
            </View>
      
            <View className='flex-col py-3'>
              { sheik[0].name == "MAS" ? <Text className='font-bold'>Impact </Text> :  <Text className='font-bold'>Credentials: </Text> } 
              { sheik[0].creds.map( (cred, i) => {
                return <Text key={i}> <Icon source="cards-diamond-outline"  size={15}/> {cred} </Text>
              })}
            </View>
          </View>
        )
      } 
  return (
    <View className='flex-1 bg-white' style={{flexGrow: 1}}>
    <Stack.Screen options={ { title : "", headerTransparent: true, headerLeft: () => <Button onPress={() => router.back()} style={{justifyContent: "flex-start"}}><Icon source={"less-than"} color='black' size={15}/><Text className='text-black'>Back</Text></Button> }}  />
     <Animated.ScrollView ref={scrollRef}  scrollEventThrottle={16} contentContainerStyle={{justifyContent: "center", alignItems: "center", marginTop: "14%" }} >
         
         <Animated.Image 
           source={ { uri: event_img || defaultProgramImage } }
           style={ [{width: width / 1.2, height: 300, borderRadius: 8 }, imageAnimatedStyle] }
           resizeMode='stretch'
         />

         <View className='bg-white' style={{paddingBottom : Tab * 3, width: width}}>
           <Text className='text-center mt-2 text-xl text-black font-bold'>{event_name}</Text>
           <Text className='text-center mt-2  text-[#0D509D]' onPress={showModal}>{event_speaker}</Text>
             <View className='ml-3'>
                <Text>{event_desc}</Text>
             </View>
         </View>

         <Portal>
           <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={{backgroundColor: 'white', padding: 20, height: "35%", width: "90%", borderRadius: 35, alignSelf: "center"}} >
             <GetSheikData />
           </Modal>
         </Portal>
     </Animated.ScrollView>
     </View>
  )
}

export default EventInfoDisplay