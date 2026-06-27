import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { positions } from "../data/data";
import apiClient from "../../api/client";
import { getStockDetailPath } from "../../constants/routes";
import { formatCurrency } from "../../utils/formatters";

const Positions = () => {
  const [remotePositions, setRemotePositions] = useState([]);
  const [didPositionsRequestFail, setDidPositionsRequestFail] = useState(false);

  useEffect(() => {
    apiClient
      .get("/allPositions")
      .then((res) => {
        setRemotePositions(res.data);
        setDidPositionsRequestFail(false);
      })
      .catch(() => {
        setRemotePositions([]);
        setDidPositionsRequestFail(true);
      });
  }, []);

  const allPositions = didPositionsRequestFail ? positions : remotePositions;

  if (!allPositions.length) {
    return (
      <div className="empty-state">
        <h3>No active positions</h3>
        <p>Positions will appear here when available.</p>
      </div>
    );
  }

  return (
    <div className="order-table">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg.</th>
            <th>LTP</th>
            <th>P&L</th>
            <th>Chg.</th>
          </tr>
        </thead>
        <tbody>
          {allPositions.map((stock, index) => {
            const curValue = stock.price * stock.qty;
            const isProfit = curValue - stock.avg * stock.qty >= 0.0;
            const profClass = isProfit ? "profit" : "loss";
            const dayClass = stock.isLoss ? "loss" : "profit";
            const instrument = stock.symbol || stock.name;

            return (
              <tr key={`${instrument}-${index}`}>
                <td data-label="Product">{stock.product}</td>
                <td data-label="Instrument">
                  <Link className="symbol-link" to={getStockDetailPath(instrument)}>
                    {instrument}
                  </Link>
                </td>
                <td data-label="Qty.">{stock.qty}</td>
                <td data-label="Avg.">{formatCurrency(stock.avg)}</td>
                <td data-label="LTP">{formatCurrency(stock.price)}</td>
                <td data-label="P&L" className={profClass}>
                  {curValue - stock.avg * stock.qty >= 0 ? "+" : ""}
                  {formatCurrency(curValue - stock.avg * stock.qty)}
                </td>
                <td data-label="Chg." className={dayClass}>
                  {stock.day}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Positions;
