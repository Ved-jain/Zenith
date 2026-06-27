import React from "react";

import { GeneralContextProvider } from "../../dashboard/components/GeneralContext";
import WatchList from "../../dashboard/components/WatchList";

function WatchlistPage() {
  return (
    <GeneralContextProvider>
      <div className="dashboard-container">
        <div className="content">
          <WatchList />
        </div>
      </div>
    </GeneralContextProvider>
  );
}

export default WatchlistPage;
