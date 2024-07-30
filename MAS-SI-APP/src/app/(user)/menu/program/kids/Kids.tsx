import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useAuth } from "@/src/providers/AuthProvider"
import { Program } from '@/src/types'
import { Searchbar, Divider } from 'react-native-paper'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import ProgramsListProgram from '@/src/components/ProgramsListProgram'

const Kids = () => {
  const { session } = useAuth()
  const [ kidsPrograms, setKidsPrograms ] = useState<Program[]>()
  const [ searchBarInput, setSearchBarInput ] = useState("")
  const getKidsPrograms = async () => {
    const { data, error } = await supabase.from("programs").select("*").eq("is_kids", true)
    if( error ){
        console.log( error )
    }
    if( data ){
        setKidsPrograms(data)
    }
  }

  const tabBarHeight = useBottomTabBarHeight()
  const filterTestFunc = () => {
    
  }
  useEffect(() => {
    getKidsPrograms()
  }, [])
  return (
    <View className='bg-[#0D509D] flex-1'>
    <View className='bg-white pt-2 mt-1 flex-1'style={{borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingBottom: tabBarHeight }}>
    <Searchbar placeholder='Search...' onChangeText={filterTestFunc} value={searchBarInput} className='mt-2 w-[95%] mb-2' style={{alignSelf : "center", justifyContent: "center"}} elevation={1}/>
    <View className='mb-5'/>
    <FlatList 
        data={kidsPrograms}
        renderItem={({item}) => <ProgramsListProgram program={item}/>}
        ItemSeparatorComponent={() => <Divider style={{width: "50%", alignSelf: "center", height: 1}}/>}
        contentContainerStyle={{rowGap: 15}}
      />
    </View>
  </View>
  )
}

export default Kids