import Home from "./pages/Home";
import Navbar from "./pages/Navbar";
import UsersList from "./pages/UsersList";
import { UserProvider } from "./context/UserContext";
import "./App.css";

function App() {
  return (
    <UserProvider>
      <Navbar />
      <Home />
      <UsersList />
    </UserProvider>
  );
}

export default App;