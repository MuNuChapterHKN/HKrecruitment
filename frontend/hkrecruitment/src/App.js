import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import MyNavbar from './MyNavbar.js';
import { Route } from 'react-router-dom';


function App() {
  return <Route path="/*">
    <body>
  <MyNavbar />
  <div>App
    </div>
  </body>
  </Route>
   
}
export default App;
