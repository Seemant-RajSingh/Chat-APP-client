import {UserContextProvider} from "./context/usercontext";
import axios from "axios"
import Routes from "./routes";

function App() {

  // establishing base/root link 
  axios.defaults.baseURL = "http://localhost:4000"
  axios.defaults.withCredentials = true

  return (
    <UserContextProvider>
    <Routes />
    </UserContextProvider>
  );
}

export default App;


//postcss?