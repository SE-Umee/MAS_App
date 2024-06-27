import { View, Text, Pressable, FlatList, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useLocalSearchParams, Stack } from 'expo-router';
import programsData from '@/assets/data/programsData';
import LecturesListLecture from '@/src/components/LectureListLecture';
import { defaultProgramImage }  from '@/src/components/ProgramsListProgram';
import { useNavigation } from 'expo-router';

const BackButton = () => {
  const navigate = useNavigation();

  return (
    <TouchableOpacity  onPress={() => navigate.goBack()}>
      <Text>Back</Text>
    </TouchableOpacity>
  );
};

const programLectures = () => {
  const { programId } = useLocalSearchParams();
  const program = programsData.find(p => p.programId.toString() == programId)
   
  if (!program){
    return (
      <Text> Program Not Found </Text>
    )
  }
  
  const lectures = program.lectures
  return (
    <View>
      <Stack.Screen options={ { title: "Lectures", } } />
      <BackButton />
      <View className='w-50% m-auto contain'>
      <Image 
        source={ { uri: program.programImg || defaultProgramImage }}
        style={{width: 300, height: 200}}
      />
      </View>
      <FlatList 
        data={lectures}
        renderItem={ ({item}) => <LecturesListLecture lecture={item}/> }
      />
    </View>
  )
}


const styles={
  programImageStyle: "h-200 w-300"
}
export default programLectures