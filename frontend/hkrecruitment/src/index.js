import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from "@auth0/auth0-react";



ReactDOM.render(
  <Auth0Provider
    domain="dev-3fbrgndj.us.auth0.com"
    clientId="yBohrrNYEJKlAiHiaW0R9DeqYGSN7DFC"
    redirectUri={window.location.origin}
  >
  <BrowserRouter>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </BrowserRouter>
  </Auth0Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
