import React, { useContext, useState } from "react";

import GeneralContext from "./GeneralContext";
import apiClient from "../../api/client";

import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid, initialPrice = 0, mode = "BUY" }) => {
  const generalContext = useContext(GeneralContext);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(initialPrice);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSell = mode === "SELL";

  const handleOrderClick = async () => {
    const qty = Number(stockQuantity);
    const price = Number(stockPrice);

    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await apiClient.post("/newOrder", {
        symbol: uid,
        name: uid,
        qty,
        price,
        mode,
        orderType: "MARKET",
      });

      window.dispatchEvent(new Event("portfolio:refresh"));
      generalContext.closeBuyWindow();
    } catch (requestError) {
      const message =
        requestError.response?.data?.rejectionReason ||
        requestError.response?.data?.message ||
        "Order could not be placed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    generalContext.closeBuyWindow();
  };

  return (
    <div className="order-window" id="buy-window" draggable="true">
      <div className="order-window__header">
        <div>
          <span className="eyebrow">Order review</span>
          <h3>{uid}</h3>
        </div>
        <span className={isSell ? "order-window__mode--sell" : ""}>{mode}</span>
      </div>

      <div className="regular-order">
        <div className="inputs">
          <label>
            Quantity
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </label>
          <label>
            Limit price
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
            />
          </label>
        </div>
      </div>

      {error && <p className="order-window__error">{error}</p>}

      <div className="buttons">
        <span>Order type: MARKET</span>
        <div>
          <button
            className={isSell ? "btn btn-red" : "btn btn-blue"}
            onClick={handleOrderClick}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? "Placing..." : mode}
          </button>
          <button
            type="button"
            className="btn btn-grey"
            onClick={handleCancelClick}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
