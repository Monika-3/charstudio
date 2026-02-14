'use client'
   import { useEffect, useState } from 'react'
   import { supabase } from '@/lib/supabase'

   export default function Home() {
     const [characters, setCharacters] = useState<any[]>([])
     const [loading, setLoading] = useState(true)

     useEffect(() => {
       fetchCharacters()
     }, [])

     const fetchCharacters = async () => {
       try {
         const { data, error } = await supabase
           .from('characters')
           .select('*')
           .order('created_at', { ascending: false })
         
         if (error) {
           console.error('Error:', error)
         } else {
           setCharacters(data || [])
         }
       } catch (err) {
         console.error('Failed to fetch:', err)
       } finally {
         setLoading(false)
       }
     }

     return (
       <div className="min-h-screen bg-zinc-950 text-white p-8">
         <div className="max-w-7xl mx-auto">
           <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
             PoseFlow
           </h1>
           
           {loading ? (
             <div className="text-center py-12">
               <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="mt-4 text-zinc-400">Loading...</p>
             </div>
           ) : characters.length === 0 ? (
             <div className="text-center py-12">
               <p className="text-xl text-zinc-400 mb-4">No characters yet</p>
               <p className="text-sm text-zinc-500">
                 Database is connected! Add a character to get started.
               </p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {characters.map((char) => (
                 <div 
                   key={char.id} 
                   className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:border-blue-500 transition"
                 >
                   <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-3xl mb-4">
                     👤
                   </div>
                   <h2 className="text-xl font-semibold mb-2">{char.name}</h2>
                   <p className="text-sm text-zinc-500">
                     Created: {new Date(char.created_at).toLocaleDateString()}
                   </p>
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>
     )
   }
