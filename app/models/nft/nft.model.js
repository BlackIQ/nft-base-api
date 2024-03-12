// Connections
import { mongodb } from "$app/connections/index.js";

import mongoose from "mongoose";
const mongooseSchema = mongoose.Schema;

export const schemaModel = {
  idx: {
    type: Number,
    default: null,
  },
  face: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  imageURL: {
    type: String,
    default: null,
  },
  attributes: {
    type: Object,
    default: {},
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  metadata: {
    type: Object,
    default: {},
  },
};

export const schema = new mongooseSchema(schemaModel, { timestamps: true });

export default mongodb.model("NFT", schema);
