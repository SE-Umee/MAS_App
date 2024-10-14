import { Image, StyleSheet, View, Text, FlatList, ScrollView, Dimensions, useWindowDimensions, ImageBackground, StatusBar, Pressable } from 'react-native';
import React, { useState, useEffect, useRef, useContext, useCallback} from 'react';
import { gettingPrayerData, prayerTimesType, Profile } from '@/src/types';
import { format, parse, setHours, setMinutes, subMinutes } from 'date-fns';
import { ThePrayerData} from '@/src/components/getPrayerData';
import { usePrayer } from '@/src/providers/prayerTimesProvider';
import SalahDisplayWidget from '@/src/components/salahDisplayWidget';
import {JummahTable} from '@/src/components/jummahTable';
import ProgramsCircularCarousel from '@/src/components/programsCircularCarousel';
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { JummahBottomSheetProp } from '@/src/types';
import LinkToVolunteersModal from '@/src/components/linkToVolunteersModal';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated,{ interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset, useSharedValue, useAnimatedScrollHandler, withTiming, Easing } from 'react-native-reanimated';
import { Button, TextInput, Portal, Modal, Icon  } from 'react-native-paper';
import { Link } from 'expo-router';
import LinkToDonationModal from '@/src/components/LinkToDonationModal';
import LottieView from 'lottie-react-native';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/providers/AuthProvider';
export default function homeScreen() {
  const { onSetPrayerTimesWeek, prayerTimesWeek } = usePrayer()
  const { session } = useAuth()
  const [ profile, setProfile ] = useState<Profile>()
  const [ profileFirstName , setProfileFirstName ] = useState('')
  const [ profileLastName , setProfileLastName ] = useState('')
  const [ profileEmail, setProfileEmail ] = useState('')
  const [ confirmProfile, setConfirmProfile ] = useState(false)
    const [loading, setLoading] = useState(true)
    const [visible, setVisible] = React.useState(false);
    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const tabBarHeight = useBottomTabBarHeight();
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const animation = useRef<LottieView>(null);
    const { width } = Dimensions.get("window")
    const scrollRef = useAnimatedRef<Animated.ScrollView>()
    const scrollOffset = useSharedValue(0)
    const scrollHandler = useAnimatedScrollHandler(event => {
      scrollOffset.value = event.contentOffset.y;
    });
    const imageAnimatedStyle = useAnimatedStyle(() => {
      return{
        transform: [
          {
            translateY : interpolate(
            scrollOffset.value,
            [-width / 2, 0, width / 2 ],
            [-width/4, 0, width/ 2 * 0.75]
            )
          },
          {
            scale: interpolate(scrollOffset.value, [-width/ 2, 0, width / 2], [2, 1, 1])
          }
        ]
      }
    })

    const getProfile = async () => {
      if( session?.user.is_anonymous){
        return
      }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session?.user.id).single()
      if( data ){
        if ( !data?.first_name || !data?.last_name || !data?.profile_email ){
          setVisible(true)
        }
        setProfile(data)
      }
    }
    const onConfirmButton = async () => {
      console.log(profileFirstName, profileLastName, profileEmail)
      const { data, error } = await supabase.from('profiles').update({ first_name : profileFirstName, last_name : profileLastName, profile_email : profileEmail}).eq('id', session?.user.id)
      if( data ){
        console.log(data)
      }
      if( error ){
        console.log(error)
      }
      else{
      setVisible(false)
      }
    }
    const getPrayer = async () => {
      const prayerTimesInfo = await supabase.from('prayers').select('*').eq('id', 1).single()
        const prayerTimes = prayerTimesInfo.data
        const weekInfo  : gettingPrayerData[] = ThePrayerData({prayerTimes})
        onSetPrayerTimesWeek(weekInfo)
        setLoading(false)
    }
    useEffect( () => {
      getProfile();
      getPrayer()
    }, [])
    useEffect(() => {
      if( profileFirstName && profileLastName && profileEmail ){
        setConfirmProfile(true)
      }
      else{
        setConfirmProfile(false)
      }
    }, [profileFirstName, profileLastName, profileEmail])
    if (loading){
      return(
        <View className='justify-center items-center'>
          <Text>Loading...</Text>
        </View>
      )
    }
   const prayer = prayerTimesWeek
    const jummahData : JummahBottomSheetProp[] = [
      {
        jummahSpeaker : "Sh.Abdelrahman Badawy",
        jummahSpeakerImg : "",
        jummahTopic : "United Hope",
        jummahNum: "12:15 PM",
        jummahDesc: "How to increase your iman and stand for Palestine"
      },
      {
        jummahSpeaker : "T",
        jummahSpeakerImg : "T",
        jummahTopic : "T",
        jummahNum: "1:00 PM",
        jummahDesc: "How to increase your iman and stand for Palestine"
      },
      {
        jummahSpeaker : "3",
        jummahSpeakerImg : "3",
        jummahTopic : "3",
        jummahNum: "1:45 PM",
        jummahDesc: "How to increase your iman and stand for Palestine"
      },
      {
        jummahSpeaker : "4",
        jummahSpeakerImg : "4",
        jummahTopic : "4",
        jummahNum: "3:40PM",
        jummahDesc: "How to increase your iman and stand for Palestine"
      }
    ]
    return (
      <Animated.ScrollView ref={scrollRef} className="bg-white h-full flex-1" onScroll={scrollHandler}>
            <StatusBar barStyle={"dark-content"}/>
            <View className='justify-center items-center mt-[12%] '>
              <Animated.Image source={require("@/assets/images/massiLogo2.png")} style={[{width: width / 2, height: 75, justifyContent: "center" }, imageAnimatedStyle]} />
            </View>

            <View style={{height: 250, overflow: "hidden", justifyContent:"center", borderEndStartRadius: 30 ,borderEndEndRadius: 30}} className=''>
              <SalahDisplayWidget prayer={prayer[0]} nextPrayer={prayer[1]}/>
            </View>
            <Button onPress={async () => {
              const { data : userAddedPrograms, error : addedProgramsError } = await supabase.from('added_notifications_programs').select('*').eq('user_id', session?.user.id)
              const { data : userProgramSettings, error : userSettingsError } = await supabase.from('program_notifications_settings').select('*').eq('user_id', session?.user.id)
          
              userAddedPrograms?.map((AddedProgram) => {
                userProgramSettings?.map((ProgramSettings) => {
                  if(AddedProgram.program_id == ProgramSettings.program_id){
                    ProgramSettings.notification_settings.map( async (setting) => {
                      if( setting == 'When Program Starts' ){
                        const program_time = await supabase.from('programs').select('program_start_time, program_days').eq('program_id', AddedProgram.program_id).single()
                        const currentDate = new Date()
                        const dayOfWeek = format(currentDate, 'EEEE')
                        if( program_time.data?.program_days.includes(dayOfWeek)){
                          const timeProgramStart = program_time.data.program_start_time
                          const time = timeProgramStart.split(':')
                          const hour = Number(time[0])
                          const minute = Number(time[1])
                          
                        }
                      }
                      if( setting == '30 Mins Before' ){
                        const program_time = await supabase.from('programs').select('program_start_time, program_days').eq('program_id', AddedProgram.program_id).single()
                        const currentDate = new Date()
                        const dayOfWeek = format(currentDate, 'EEEE')
                        console.log(dayOfWeek)
                        if( program_time.data?.program_days.includes(dayOfWeek) ){
                          const timeProgramStart = program_time.data.program_start_time
                          const time = timeProgramStart.split(':')
                          const hour = Number(time[0])
                          const minute = Number(time[1])
                          const date = setHours(new Date(), hour)
                          const result = subMinutes(setMinutes(date, minute), 30)
                          
                          console.log(result)
                        }
                      }
                      if( setting == 'Day Before' ){
                        const program_time = await supabase.from('programs').select('program_start_time, program_days').eq('program_id', AddedProgram.program_id).single()
                        const DaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                        const DayOfProgram = program_time.data?.program_days
                        DayOfProgram.map((day) => {
                          const DayIndex = DaysOfWeek.indexOf(day)
                          const currentDate = new Date()
                          const dayOfWeek = format(currentDate, 'EEEE')
                          if( dayOfWeek == 'Monday' ){
                            
                          }
                          if( dayOfWeek == DaysOfWeek[DayIndex - 1]){
                            console.log(DaysOfWeek[DayIndex - 1])
                          }
                        })
                      }
                    })
                  }
                })
              })
            }}>Get Program Settings</Button>
            <Button onPress={async () => {
              const {data, error} = await supabase.from('todays_prayers').select('*')
              console.log(data, error)
              const { data : userSettings }  = await supabase.from('prayer_notification_settings').select('*').eq('user_id', session?.user.id)
              console.log('userSetting', userSettings)
              data?.map((prayer) => {
                userSettings?.map((setting) => {
                  if(setting.prayer == prayer.prayer_name || (prayer.prayer_name == 'zuhr' && setting.prayer == 'dhuhr')){
                    console.log(prayer.prayer_name, setting.notification_settings)
                      setting.notification_settings.map(( choice ) => {
                        if( choice == 'Alert at Athan time' ){
                          const date = new Date(prayer.athan_time);
                        // Get the hours and minutes
                        const hours = date.getHours()
                        const minutes = date.getMinutes()
                        console.log( hours, minutes)
                          console.log('Schedule at', prayer.athan_time)
                        }else if( choice == 'Alert at Iqamah time'){
                          console.log('Schedule at', prayer.iqamah_time)
                        }else if( choice == 'Alert 30 mins before next prayer' ){
                          if( setting.prayer == 'fajr' ){
                            const nextPrayerInfo = data.filter(e => e.prayer_name == 'zuhr')
                            const nextPrayerTime = nextPrayerInfo[0].athan_time
                            
                            const date = new Date(nextPrayerTime);
                           // Subtract 30 minutes (30 * 60 * 1000 milliseconds)
                            date.setTime(date.getTime() - 30 * 60 * 1000);

                            // Get the updated timestamp in ISO format (with timezone info)
                            const updatedTimestampz = date.toISOString();
                            console.log(updatedTimestampz)
                          }
                          if( setting.prayer == 'dhuhr' ){
                            const nextPrayerInfo = data.filter(e => e.prayer_name == 'asr')
                            const nextPrayerTime = nextPrayerInfo[0].athan_time
                            const date = new Date(nextPrayerTime);
                           // Subtract 30 minutes (30 * 60 * 1000 milliseconds)
                            date.setTime(date.getTime() - 30 * 60 * 1000);

                            // Get the updated timestamp in ISO format (with timezone info)
                            const updatedTimestampz = date.toISOString();
                            console.log(updatedTimestampz)
                            console.log(nextPrayerInfo)
                          }
                          if( setting.prayer == 'asr' ){
                            const nextPrayerInfo = data.filter(e => e.prayer_name == 'maghrib')
                            const nextPrayerTime = nextPrayerInfo[0].athan_time
                            const date = new Date(nextPrayerTime);
                           // Subtract 30 minutes (30 * 60 * 1000 milliseconds)
                            date.setTime(date.getTime() - 30 * 60 * 1000);

                            // Get the updated timestamp in ISO format (with timezone info)
                            const updatedTimestampz = date.toISOString();
                            console.log(updatedTimestampz)
                            console.log(nextPrayerInfo)
                          }
                          if( setting.prayer == 'maghrib' ){
                            const nextPrayerInfo = data.filter(e => e.prayer_name == 'isha')
                            const nextPrayerTime = nextPrayerInfo[0].athan_time
                            const date = new Date(nextPrayerTime);
                           // Subtract 30 minutes (30 * 60 * 1000 milliseconds)
                            date.setTime(date.getTime() - 30 * 60 * 1000);

                            // Get the updated timestamp in ISO format (with timezone info)
                            const updatedTimestampz = date.toISOString();
                            console.log(updatedTimestampz)
                            console.log(nextPrayerInfo)
                          }
                          if( setting.prayer == 'isha' ){
                            const nextPrayerInfo = data.filter(e => e.prayer_name == 'fajr')
                            const nextPrayerTime = nextPrayerInfo[0].athan_time
                            const date = new Date(nextPrayerTime);
                           // Subtract 30 minutes (30 * 60 * 1000 milliseconds)
                            date.setTime(date.getTime() - 30 * 60 * 1000);

                            // Get the updated timestamp in ISO format (with timezone info)
                            const updatedTimestampz = date.toISOString();
                            console.log(updatedTimestampz)
                            console.log(nextPrayerInfo)
                          }
                        }else if( choice == 'Mute'){
                          return
                        }
                      })
                  }
                })
              })
            }}>Test</Button>
            <Button onPress={ async () => await supabase.functions.invoke('send-prayer-notification')}>Test Push</Button>
          <Link href={'/menu/program'} asChild>
            <Pressable className='pt-7 flex-row justify-between w-[100%] px-3'>
              <Text className='font-bold text-2xl text-[#0D509D]' style={{textShadowColor: "light-gray", textShadowOffset: { width: 0.5, height: 3 }, textShadowRadius: 0.6}} >Weekly Programs</Text>
              <View className='flex-row items-center'>
                <Text className='text-gray-300'>View All</Text>
                <Icon source={'chevron-right'} size={20}/>
              </View>
            </Pressable>
          </Link>
              <View className='pt-3' style={{height: 250}}>
                <ProgramsCircularCarousel />
              </View>
              <View className='pl-3 flex-row pt-10'>
                  <Text className='text-[#0D509D] font-bold text-2xl'>Donate</Text>
              </View>
              <View className='pt-2'>
                <LinkToDonationModal />
              </View>
            <View className='flex-row pl-3 pt-5'>
              <Text className='text-[#0D509D] font-bold text-2xl' style={{textShadowColor: "#light-gray", textShadowOffset: { width: 0.5, height: 3 }, textShadowRadius: 1 }}>Volunteers</Text>
            </View>
            <View className='pt-2'>
              <LinkToVolunteersModal />
            </View>
            <View className='flex-row pl-3 pt-6'>
              <Text className='text-[#0D509D] font-bold text-2xl' style={{textShadowColor: "#light-gray", textShadowOffset: { width: 0.5, height: 3 }, textShadowRadius: 1 }}>Jummah Schedule</Text>
            </View>
            <View className='justify-center items-center w-[95%] m-auto pt-2' style={{shadowColor: "black", shadowOffset: { width: 0, height: 0},shadowOpacity: 0.6}}>
              <ImageBackground style={{width:"100%", height: 450, justifyContent: "center"}} source={require("@/assets/images/jummahSheetBackImg.png")} resizeMode='stretch' imageStyle={{ borderRadius: 20 }}>
                <JummahTable jummahData={jummahData} ref={bottomSheetRef}/>
              </ImageBackground>
            </View>
            <View style={[{paddingBottom : tabBarHeight}]}></View>
            <Portal>
              <Modal dismissable={false} visible={visible} onDismiss={hideModal} contentContainerStyle={{ height : '70%', width : '95%', borderRadius : 10, backgroundColor : 'white', alignSelf : 'center', alignItems : 'center' }}>
                <View className='flex-col'>
                  <View>
                    <Text className='text-center font-bold text-3xl'>Welcome</Text>
                  </View>
                  <View className='items-center'>
                    <Text>Enter Your First Name</Text>
                    <TextInput
                    mode='outlined'
                    theme={{ roundness : 50 }}
                    style={{ width: 300, backgroundColor: "#e8e8e8", height: 45 }}
                    activeOutlineColor='#0D509D'
                    value={profileFirstName}
                    onChangeText={setProfileFirstName}
                    placeholder="First Name"
                    textColor='black'
                    />
                    <Text>Enter Your Last Name</Text>
                  <TextInput
                    mode='outlined'
                    theme={{ roundness : 50 }}
                    style={{ width: 300, backgroundColor: "#e8e8e8", height: 45 }}
                    activeOutlineColor='#0D509D'
                    value={profileLastName}
                    onChangeText={setProfileLastName}
                    placeholder="Last Name"
                    textColor='black'
                    />
                  <Text>Enter Your Email</Text>
                  <TextInput
                    mode='outlined'
                    theme={{ roundness : 50 }}
                    style={{ width: 300, backgroundColor: "#e8e8e8", height: 45 }}
                    activeOutlineColor='#0D509D'
                    value={profileEmail}
                    onChangeText={setProfileEmail}
                    placeholder="Email"
                    textColor='black'
                    />
                  </View>
                  <View className='self-center'>
                    <Button  disabled={!confirmProfile} mode='contained' buttonColor='#57BA47' textColor='white' className='w-[150]' onPress={onConfirmButton}>Confirm</Button>
                  </View>
                  </View>
              </Modal>
            </Portal>
      </Animated.ScrollView>
    )
    
  }

const styles = StyleSheet.create({
  masLogoBox: {
    width: 500,
    height: 50
  },
  massiLogo : {
    width: 500,
    height: 75,
    resizeMode: "contain",
    justifyContent: "center",
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 850
  },
  
});


