require("dotenv").config();

const mongoose = require("mongoose");

const { UserModel } = require("../models/UserModel");
const { HoldingsModel } = require("../models/HoldingsModel");
const { PositionsModel } = require("../models/PositionsModel");
const { OrdersModel } = require("../models/OrdersModel");

const run = async () => {
  const { MONGO_URL, USER_EMAIL } = process.env;

  if (!MONGO_URL) {
    throw new Error("MONGO_URL is required.");
  }

  if (!USER_EMAIL) {
    throw new Error("USER_EMAIL is required. Example: USER_EMAIL=user@example.com node scripts/attachUserIdToExistingData.js");
  }

  await mongoose.connect(MONGO_URL);

  const user = await UserModel.findOne({ email: USER_EMAIL.trim().toLowerCase() });

  if (!user) {
    throw new Error(`No user found for USER_EMAIL=${USER_EMAIL}`);
  }

  const filter = { userId: { $exists: false } };
  const update = { $set: { userId: user._id } };

  const [holdings, positions, orders] = await Promise.all([
    HoldingsModel.updateMany(filter, update),
    PositionsModel.updateMany(filter, update),
    OrdersModel.updateMany(filter, update),
  ]);

  console.log("Attached existing records to user:", user.email);
  console.log("Holdings modified:", holdings.modifiedCount);
  console.log("Positions modified:", positions.modifiedCount);
  console.log("Orders modified:", orders.modifiedCount);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
