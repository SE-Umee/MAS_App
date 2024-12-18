import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Divider } from 'react-native-paper'
import RenderEvents from '@/src/components/EventsComponets/RenderEvents'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import PaceFlyers from '@/src/components/PaceComponents/PaceFlyers'
import { supabase } from '@/src/lib/supabase'

const Pace = () => {
  const [ pace, setPace ] = useState([])
  const getPace = async () => {
    const { data, error } = await supabase.from('events').select('*').eq('pace', true)
    if( data ){
      setPace(data)
    }
    if( error ){
      console.log(error)
    }
  }
  const tabBarHeight = useBottomTabBarHeight() + 35
  useEffect(() => {
    getPace()
  }, [])
  return (
    <View className='bg-[#0D509D] flex-1 '>
    <View className='bg-white pt-2 mt-1 flex-1'style={{borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingBottom: tabBarHeight }}>
    <View className='mb-5'/>
    <FlatList 
        data={pace}
        renderItem={({item}) => (
             <PaceFlyers pace={item}/>
        )}
        ItemSeparatorComponent={() => <Divider style={{width: "50%", alignSelf: "center", height: 0.5, backgroundColor : 'lightgray'}}/>}
        contentContainerStyle={{rowGap: 15}}
      />
    </View>
  </View>
  )
}

export default Pace