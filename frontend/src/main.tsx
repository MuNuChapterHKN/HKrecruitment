import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AxiosContext, AxiosProvider } from "./AxiosContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENTID}
      redirectUri={window.location.origin}
      audience={import.meta.env.VITE_AUDIENCE}
    >
      <AxiosProvider>
        <App />
      </AxiosProvider>
    </Auth0Provider>
  </React.StrictMode>
);
