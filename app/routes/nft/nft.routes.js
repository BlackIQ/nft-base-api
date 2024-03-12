import express from "express";

import { NFT } from "$app/controllers/index.js";

const router = express.Router();

router.get("/", NFT.ALL);
router.post("/", NFT.CREATE);
router.get("/:id", NFT.SINGLE);
router.delete("/:id", NFT.DELETE);
router.patch("/:id", NFT.UPDATE);

export default router;
