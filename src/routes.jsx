import {useContext} from "react"
import {UserContext} from "./context/usercontext.jsx"

import RegisterAndLoginForm from "./pages/RegisterAndLoginForm.jsx"
import Chat from "./pages/chat.jsx";



export default function Routes() {

  const {username, id} = useContext(UserContext);

  if (username) {
    return <Chat />
  }

  return (
    <RegisterAndLoginForm />
  );
}

