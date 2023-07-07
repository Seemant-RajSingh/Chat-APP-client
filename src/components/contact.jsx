import React from 'react'
import Avatar from './avatar'

// props from chat.jsx
export default function Contact({id, username, onClick, selected, online}) {
  return (
    
    <div key={id} onClick={() => onClick(id)} className={"h-16 flex items-center gap-2 cursor-pointer rounded-lg "+(selected ? 'bg-yellow-200' : '')}>


        {selected && (
          <div className='w-1 bg-yellow-400 h-16 rounded-r-lg'></div>
        )}



        <div className='flex gap-2 pl-3 items-center'>

          <Avatar online={online} username={username} userId={id} />
          <span className='text-gray-800'>{username}</span>

        </div>
          

    </div>

  )
}
