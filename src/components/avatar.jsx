import React from 'react'

export default function Avatar({username, userId, online}) {

    const colors = ['bg-yellow-500', 'bg-red-500',
                    'bg-pink-500', 'bg-purple-500',
                    'bg-blue-500', 'bg-teal-500',
                    'bg-orange-500', 'bg-green-500',
                    'bg-fuchsia-500', 'bg-rose-500'];

    const userIdBase10 = parseInt(userId, 10)
    const colorIndex = userIdBase10 % colors.length
    const color = colors[colorIndex]


  return (


    <div className={"w-8 h-8 relative rounded-full flex items-center "+color}>

        <div className="text-center w-full opacity-70 text-lg font-bold text-white">{username.charAt(0).toUpperCase()}</div>

        {online && (
        <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-gray-800"></div>
      )}
      {!online && (
        <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-gray-500"></div>
      )}

    </div>
  )
}
