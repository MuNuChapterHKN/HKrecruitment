import { useAuth0 } from "@auth0/auth0-react";
import "./App.css";
import { LoginButton } from "./login";
import { LogoutButton } from "./logout";
import { Private } from "./Private";
import { SignupForm } from "./SignupForm";

function App() {
  const { isAuthenticated, user } = useAuth0();

  return (
    <div className="App">
      <h1>HKRecruitment</h1>

      {(!isAuthenticated && <LoginButton />) || <LogoutButton />}

      {isAuthenticated && (
        <SignupForm />
        // <div>
        //   <h2>{user?.nickname}</h2>
        //   <img src={user?.picture} alt={user?.name} />
        //   <pre>{JSON.stringify(user, null, 2)}</pre>
        // </div>
      )}

      <Private />
    </div>
  );
}

export default App;
