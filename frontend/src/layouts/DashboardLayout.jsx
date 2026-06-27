import React from "react";
import { Outlet } from "react-router-dom";

import TopBar from "../dashboard/components/TopBar";
import "../dashboard/styles/dashboard.css";

function DashboardLayout() {
  return (
    <>
      <TopBar />
      <Outlet />
    </>
  );
}

export default DashboardLayout;
