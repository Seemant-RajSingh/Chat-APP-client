import React from 'react'
import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import {uniqBy} from "lodash";
import Logo from '../components/logo';
import Contact from '../components/contact';
import {UserContext} from "../context/usercontext"


export default function Chat() {

  const [ws,setWs] = useState(null) 
  const [onlinePeople,setOnlinePeople] = useState({})
  const [offlinePeople,setOfflinePeople] = useState({})
  const [selectedUserId,setSelectedUserId] = useState(null)
  const [newMessageText,setNewMessageText] = useState('')
  const [messages,setMessages] = useState([])

  const {username,id,setId,setUsername} = useContext(UserContext)
  const divUnderMessages = useRef()




  useEffect(() => {
    connectToWs();
  }, [selectedUserId])


  function connectToWs() {
    const ws = new WebSocket('ws://localhost:4000')

    setWs(ws)

    ws.addEventListener('message', handleMessage)
    // reconnecting
    ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log('Disconnected. Trying to reconnect.');
        connectToWs();
      }, 1000)
    })
  }




  function showOnlinePeople(peopleArray) {
    // console.log(people)
    // people var -> list of all online people
    const people = {};  // setting peple as object
    peopleArray.forEach(({userId,username}) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }



  // handling recieved messages
  function handleMessage(ev) {

    const messageData = JSON.parse(ev.data);
    //console.log({ev,messageData});

    if ('online' in messageData) {
      showOnlinePeople(messageData.online)

    } else if ('text' in messageData) {
      // recieved messages
      if (messageData.sender === selectedUserId) {
        setMessages(prev => ([...prev, {...messageData}]))
      } 
    }
  }




  function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();
  
    // backend request
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );
  
    if (file) {
      // getting messages for selected user chat
      axios.get('/messages/' + selectedUserId).then(res => {
        setMessages(res.data);
      });
    } else {
      // showing sent text from sender user
      setNewMessageText('');
      setMessages(prev => [
        ...prev,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  }



  function sendFile(ev) {

    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);

    reader.onload = () => {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      })
    }
  }



  function logout() {
    axios.post('/logout').then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }




  // scroll to newest(bottom) message
  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({behavior:'smooth', block:'end'});
    }
  }, [messages])





  useEffect(() => {
    axios.get('/people').then(res => {
      const offlinePeopleArr = res.data
      // p => person
        .filter(p => p._id !== id)  // excluding logged in user
        .filter(p => !Object.keys(onlinePeople).includes(p._id))

      const offlinePeople = {}

      offlinePeopleArr.forEach(p => {
        offlinePeople[p._id] = p
      })

      setOfflinePeople(offlinePeople);
    })
  }, [onlinePeople])




  // fetching messages for selectedUserId
  useEffect(() => {

    if (selectedUserId) {
      axios.get(`/messages/${selectedUserId}`).then((res) => {
        const filteredMessages = res.data.filter(
          (message) =>
            (message.sender === id && message.recipient === selectedUserId) ||
            (message.sender === selectedUserId && message.recipient === id)
        );
        setMessages(filteredMessages);
      });
    }
  }, [selectedUserId, messages])


  



  const onlinePeopleExclOurUser = {...onlinePeople}
  delete onlinePeopleExclOurUser[id]

  // filtering duplicate messages
  const messagesWithoutDupes = uniqBy(messages, '_id')




  return (

    <div className="flex h-screen">


      <div className="bg-yellow-100 w-1/3 p-2 pt-4 flex flex-col">

       <div className='flex-grow'>
       <Logo />
        
        {Object.keys(onlinePeopleExclOurUser).map(userId => (

          <Contact
          key={userId}
          id={userId}
          online={true}
          username={onlinePeopleExclOurUser[userId]}
          onClick={() => setSelectedUserId(userId)}
          selected={userId === selectedUserId} />
      ))}

        {Object.keys(offlinePeople).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId} />
          ))}
       </div>


                                                        {/* user info and Logout */}

        <div className='p-2 text-center flex items-center justify-center'>

        <span className="mr-2 text-sm text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>

          {username}
        </span>

          <button 
          onClick={logout}
          className='text-sm bg-yellow-300 py-1 px-2 text-gray-600 border rounded-md font-bold hover:bg-yellow-400'>Logout</button>
        </div>

    </div>





      <div className="flex flex-col bg-yellow-50 w-2/3 p-2">


                                                                      {/* Chats and messages */}

        <div className='flex-grow'>


          {/* select a person message */}
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-500">&larr; Select a person from the sidebar</div>
            </div>
          )}
          


          {!!selectedUserId && (

            <div className="relative h-full">

              <div className='overflow-y-scroll absolute top-0 left-0 right-0 bottom-2'>

          {messagesWithoutDupes.map((message) => (
            <div
              key={message._id}
              className={message.sender === id ? 'text-right' : 'text-left'}
            >
              <div
                className={`inline-block border border-yellow-500 p-2 my-2 rounded-lg mr-1 max-w-2xl ${
                  message.sender === id ? 'bg-yellow-500 text-white' : 'bg-white text-gray-500'
                }`}
              >
                {message.text}

                {message.file && (
                  <div>
                    <a
                      target="_blank"
                      className="flex items-center gap-1 border-b"
                      href={axios.defaults.baseURL + '/uploads/' + message.file}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 01"
                        />
                      </svg>
                      File Link
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}


                <div ref={divUnderMessages}></div>
                
              </div>
            </div>
          )}
          
        </div>



                                                         {/* Sending message/file buttons */}

        {!!selectedUserId && (
        <form className='flex gap-2' onSubmit={sendMessage}>
          
            <input type="text" 
            placeholder="Type your message here" 
            value={newMessageText}
            onChange={ev => setNewMessageText(ev.target.value)}
            className='bg-white-10 p-2 rounded-md flex-grow border border-yellow-500' />

            {/* attach file button */}
            <label className='py-2 px-2 cursor-pointer bg-yellow-300 rounded-lg'>
            <input type="file" className="hidden" onChange={sendFile} />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
              </svg>
            </label>


            {/* send message button */}
            <button type='submit' className='bg-yellow-500 p-2 text-white rounded-lg'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            </button>

        </form>
        )}

      </div>
      

    </div>
  )
}





// refresh after logout to show offline

