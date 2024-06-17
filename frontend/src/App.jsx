import React from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import Alert from "react-bootstrap/Alert";

import HKNavbar from "./components/HKNavbar";
import PageLayout from "./components/PageLayout";
import LoadingSpinner from "./components/LoadingSpinner";
import AuthGuard from "./components/AuthGuard";

import HomePage from "./pages/HomePage";
import ApplyPage from "./pages/ApplyPage";
import AvailabilitiesPage from "./pages/AvailabilitiesPage";
import DebugPage from "./pages/DebugPage";
import NotFoundPage from "./pages/NotFoundPage";

import "./App.css";

function App() {
  const { isLoading } = useAuth0();

  return (
    <>
      <HKNavbar />
      <PageLayout>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/apply"
              element={<AuthGuard component={ApplyPage} />}
            />
            <Route
              path="/availabilities"
              element={<AuthGuard component={AvailabilitiesPage} />}
            />
            <Route
              path="/debug"
              element={<AuthGuard component={DebugPage} />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        )}
      </PageLayout>
    </>
  );
}

export default App;
