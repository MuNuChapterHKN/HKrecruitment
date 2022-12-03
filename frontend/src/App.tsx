import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import "./App.css";
import { LoginButton } from "./login";
import { LogoutButton } from "./logout";
import { Private } from "./Private";

function App() {
  const { isAuthenticated, user, getAccessTokenWithPopup } = useAuth0();
  const [accessToken, setAccessToken] = useState("");

  return (
    <div className="App">
      <h1>HKRecruitment</h1>

      {(!isAuthenticated && <LoginButton />) || <LogoutButton />}

      {isAuthenticated && (
        <div>
          <h2>{user?.nickname}</h2>
          <img src={user?.picture} alt={user?.name} />
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}

      <Private />

      {/* {isAuthenticated && (
        <button
          onClick={() => {
            const audience = import.meta.env.VITE_AUDIENCE;
            console.log(`Getting access token for audience ${audience}`);

            getAccessTokenWithPopup({
              audience: import.meta.env.VITE_AUDIENCE,
              grant_type: "client_credentials",
            }).then((token) => {
              setAccessToken(token);
            });
          }}
        >
          Get Access Token
        </button>
      )} */}
    </div>
  );
}

export default App;
