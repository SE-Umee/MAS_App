import { View, Image, ScrollView } from 'react-native';
import React, {forwardRef, useCallback, useEffect, useMemo, useRef, useState, } from 'react'
import BottomSheet, { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { SheikDataType } from '../types';
import { JummahBottomSheetProp } from '../types';
import { Modal, Portal, Text, Button, PaperProvider, Icon, Divider } from 'react-native-paper';
import { defaultProgramImage } from './ProgramsListProgram';
import { supabase } from '../lib/supabase';

type Ref = BottomSheetModal;

export const JummahBottomSheet = forwardRef<Ref, JummahBottomSheetProp>(({jummahSpeaker, jummahSpeakerImg, jummahTopic, jummahDesc, jummahNum}, ref) => {
    const snapPoints = useMemo(() => ["50%", "75%"], []);
    const [ speakerData, setSpeakerData ] = useState<SheikDataType[]>()
    const [ visible, setVisible ] = useState(false);
    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
  

    const GetSheikData =  () => {
      return( 
        <View className='flex-1'>
          { 
            speakerData?.map((speakerData) => (
            <>
              <View className=' flex-row'>
                  <Image source={{uri : speakerData?.speaker_img || defaultProgramImage}} style={{width: 110, height: 110, borderRadius: 50}} resizeMode='cover'/>
              <View className='flex-col px-5'>
                <Text className='text-xl font-bold'>Name: </Text>
                <Text className='pt-2 font-semibold'> {speakerData?.speaker_name} </Text>
              </View>
            </View>
      
            <View className='flex-col py-3'>
              { speakerData?.speaker_name == "MAS" ? <Text className='font-bold'>Impact </Text> :  <Text className='font-bold'>Credentials: </Text> } 
              { speakerData?.speaker_creds.map( (cred, i) => {
                return <Text key={i}> <Icon source="cards-diamond-outline"  size={15} color='black'/> {cred} {'\n'}</Text>
              })}
            </View>
            </>
            ))
          }
        </View>
      )
    } 

    const getJummah = async () => {

    }


    const renderBackDrop = useCallback( (props : any ) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props}/> , [])
  return (
    <BottomSheetModal
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{backgroundColor: "#0D509D"}}
        handleIndicatorStyle={{backgroundColor: "white"}}
        backdropComponent={renderBackDrop}
    >
      <Text variant="headlineMedium" style={{marginLeft: 5, color : "white", fontWeight : "bold"}}>{jummahNum} Prayer</Text>
      <View className=' bg-white h-full mt-1 pt-2' style={{borderRadius: 40}}>
        <View className='flex-row w-[100%] justify-between px-5 items-center'>
          <Text className='font-bold text-3xl text-black'>Topic:</Text>
          <Text className='text-3xl font-semibold text-black'>{jummahTopic}</Text>
        </View>
        <Divider style={{width : "90%", alignSelf: "center"}}/>
        <View className='flex-row items-center justify-between px-1'>
          <Text className='font-bold text-black text-2xl ml-4'>Speaker:</Text> 
          <Button onPress={showModal} style={{cursor: "pointer"}} > <Text variant='titleMedium' style={{color : "blue", textDecorationLine: "underline"}}>{jummahSpeaker}</Text> </Button>
        </View>
        <View className=''>
         <Text className='font-semi text-black text-2xl ml-4'>Description:</Text> 
         <ScrollView className='h-[40%] w-[90%] self-center rounded-lg bg-white border-gray-400 border-2' contentContainerStyle={{ paddingHorizontal : 4 }}>
          <Text className='text-lg text-black'>{jummahDesc}</Text>
         </ScrollView>
        </View>

        <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={{backgroundColor: 'white', padding: 20, width: "90%", borderRadius: 35, alignSelf: "center", height : '50%'}} >
          <GetSheikData />
        </Modal>
      </Portal>
      </View>
    </BottomSheetModal>
  )
}
)