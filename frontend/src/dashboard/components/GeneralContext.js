import React, { useState } from "react";

import BuyActionWindow from "./BuyActionWindow";

const GeneralContext = React.createContext({
  openBuyWindow: (uid, price) => {},
  openSellWindow: (uid, price) => {},
  closeBuyWindow: () => {},
});

export const GeneralContextProvider = (props) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [selectedStockPrice, setSelectedStockPrice] = useState(0);
  const [orderMode, setOrderMode] = useState("BUY");

  const handleOpenOrderWindow = (uid, price, mode) => {
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
    setSelectedStockPrice(price || 0);
    setOrderMode(mode);
  };

  const handleOpenBuyWindow = (uid, price) => {
    handleOpenOrderWindow(uid, price, "BUY");
  };

  const handleOpenSellWindow = (uid, price) => {
    handleOpenOrderWindow(uid, price, "SELL");
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
    setSelectedStockPrice(0);
    setOrderMode("BUY");
  };

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: handleOpenBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeBuyWindow: handleCloseBuyWindow,
      }}
    >
      {props.children}
      {isBuyWindowOpen && (
        <BuyActionWindow
          uid={selectedStockUID}
          initialPrice={selectedStockPrice}
          mode={orderMode}
        />
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
