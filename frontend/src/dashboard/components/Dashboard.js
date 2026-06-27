import React from "react";
import { Outlet } from "react-router-dom";

import { GeneralContextProvider } from "./GeneralContext";

const Dashboard = () => {
  return (
    <GeneralContextProvider>
      <div className="dashboard-container">
        <div className="content">
          <Outlet />
        </div>
      </div>
    </GeneralContextProvider>
  );
};

export default Dashboard;
