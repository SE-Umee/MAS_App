// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {Expo} from 'https://esm.sh/expo-server-sdk';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
console.log("Hello from Functions!")

const supabaseUrl = Deno.env.get('EXPO_PUBLIC_SUPABASE_URL');
const supabaseKey = Deno.env.get('EXPO_PUBLIC_SUPABASE_ANON');
const supabase = createClient(supabaseUrl, supabaseKey);

const schedule_notification = async ( user_id, push_notification_token, program_id, message, notification_type, program_name, notification_time ) => {
  const { error } = await supabase.from('program_notification_schedule').insert({ user_id : user_id, push_notification_token : push_notification_token, program_id : program_id, message : message, notification_type : notification_type, program_name : program_name, notification_time : notification_time})
  if( error ){
    console.log(error)
  }
}

function setTimeToCurrentDate(timeString : string ) {

  // Split the time string into hours, minutes, and seconds
  const [hours, minutes, seconds] = timeString.split(':').map(Number);

  // Create a new Date object with the current date
  const timestampWithTimeZone = new Date();

  // Set the time with setHours (adjust based on local timezone or UTC as needed)
  timestampWithTimeZone.setHours(hours + 4, minutes, seconds, 0); // No milliseconds

  // Convert to ISO format with timezone (to ensure it's interpreted as a TIMESTAMPTZ)
  const timestampISO = timestampWithTimeZone // This gives a full timestamp with timezone in UTC

  return timestampISO
}

serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  const scheduler = async () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const { data : UserSettings, error : UserSettingsError } = await supabase.from('program_notifications_settings').select('*')
    const UserSignedUpPrograms : any[] = [{
      id: 3,
      program_id: "e09db866-71af-407a-968d-672c55d807b7",
      program_name: "Lesson from Surah Yusuf",
      program_img: "https://pklldvgwaccokqcygmzr.supabase.co/storage/v1/object/sign/fliers/Lesson_Surah_Yusuf.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJmbGllcnMvTGVzc29uX1N1cmFoX1l1c3VmLnBuZyIsImlhdCI6MTcyMDYzOTY4MiwiZXhwIjoxNzUyMTc1NjgyfQ.qlcrexLWyY-SBIVxuX161IxlwNUMMmLmaNsLmM4_Ky0&t=2024-07-10T19%3A28%3A02.225Z",
      program_desc: "Break down of Surah Yusuf ",
      program_speaker: "Sh.Abdelrahman Badawy",
      has_lectures: true,
      program_start_date: "2024-07-17T01:02:52.461789+00:00",
      program_end_date: "2025-07-17T01:03:25+00:00",
      program_is_paid: false,
      program_price: 0,
      is_kids: false,
      is_fourteen_plus: false,
      is_education: false,
      program_start_time: "10:45:00",
      program_days: [ "Thursday" ]
    }]
    if( UserSettings ){
      await Promise.all(UserSettings.map( async ( program ) => {
        console.log(program)
        const { data : user_push_token , error } = await supabase.from('profiles').select('push_notification_token').eq('id', program.user_id).single()
        console.log('User Push Token', user_push_token)
        if( !user_push_token ){
          return
        }
        // if program dosnt exist in usersignedupprograms call it and get its info 
        if( !UserSignedUpPrograms.some(e => e.program_id = program.program_id) ){
          console.log(UserSignedUpPrograms)
          // Get Program Info and Current Day 
          const { data : program_info, error } = await supabase.from('programs').select('*').eq('program_id', program.program_id).single() 
          console.log(program_info)
          const currentDate = new Date()
          const day = currentDate.getDay()
          console.log('Current Day: ', day)
          const program_days = program_info.program_days
          console.log('program days', program_days)
          // Run Through User Settings for this program
          await Promise.all(program.notification_settings.map( async ( setting : string ) => {

              if( setting == 'Day Before' ){
                console.log('program days', program_days)
                await Promise.all( program_days.map( async ( days : string ) => {
                    const program_day = daysOfWeek.indexOf(days)
                    console.log('curr day', day - 1)
                    console.log(program_day - 1 % 7, days )
                    if( day - 1 == ( program_day - 1 % 7 ) ){
                      
                      // schedule notification
                      const start_time = setTimeToCurrentDate(program_info.program_start_time)
                      await schedule_notification(program.user_id, user_push_token.push_notification_token, program.program_id, `${program_info.program_name} is Starting Now!`, 'When Program Starts', program_info.program_name, start_time)  
                    }
                  }) 
                )
              } 

              if( program_days.includes( daysOfWeek[day-1] ) ){
                if( setting == 'When Program Starts' ){
                  const start_time = setTimeToCurrentDate(program_info.program_start_time)
                  await schedule_notification(program.user_id, user_push_token.push_notification_token, program.program_id, `${program_info.program_name} is Starting Now!`, 'When Program Starts', program_info.program_name, start_time)
                }
                else if( setting == '30 Mins Before' ){
                  const start_time = setTimeToCurrentDate(program_info.program_start_time)
                  start_time.setMinutes(start_time.getMinutes() - 30)
                  await schedule_notification(program.user_id, user_push_token.push_notification_token, program.program_id, `${program_info.program_name} is Starting in 30 Mins!`, '30 Mins Before', program_info.program_name, start_time)
                }
              }
              else{
                return
              }
          }))
          UserSignedUpPrograms.push(program_info)
        }

        else{
          const program_info_array = UserSignedUpPrograms.filter(obj => {
            return obj.program_id == program.program_id
          })
          console.log(program_info_array)
          const program_info = program_info_array[0]
          await Promise.all(program.notification_settings.map( async ( setting : string ) => {
            const program_days = program_info.program_days
            const currentDate = new Date()
            const day = currentDate.getDay()
            if( setting == 'Day Before' ){
              const program_days = program_info.program_days
           
              await Promise.all( program_days.map( async ( days : string ) => {
                  const program_day = daysOfWeek.indexOf(days)
                  console.log('curr day', day - 1)
                  console.log(program_day - 1 % 7, days )
                  if( day - 1 == ( program_day - 1 % 7 ) ){
                    // schedule notification
                    const start_time = setTimeToCurrentDate(program_info.program_start_time)
                    await schedule_notification(program.user_id, user_push_token.push_notification_token, program.program_id, `${program_info.program_name} is Tomorrow, Don't Forget!`, 'Day Before', program_info.program_name, start_time)  
                  }
                }) 
              )
            }

            if( program_days.includes( daysOfWeek[day-1] ) ){
              if( setting == 'When Program Starts' ){
                const start_time = setTimeToCurrentDate(program_info.program_start_time)
                await schedule_notification(program.user_id, user_push_token.push_notification_token, program.program_id, `${program_info.program_name} is Starting Now!`, 'When Program Starts', program_info.program_name, start_time)
              }
              else if( setting == '30 Mins Before' ){
                const start_time = setTimeToCurrentDate(program_info.program_start_time)
                start_time.setMinutes(start_time.getMinutes() - 30)
                await schedule_notification(program.user_id, user_push_token.push_notification_token, program.program_id, `${program_info.program_name} is Starting in 30 Mins!`, '30 Mins Before', program_info.program_name, start_time)
              }
            }
            else{
              return
            }
        }))
        } 

      }))
    }
  }

  await scheduler()
  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/program-notification-scheduler' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
