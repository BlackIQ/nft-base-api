import express from "express";

import Permission from "$app/routes/permission/permission.routes.js";
import Role from "$app/routes/role/role.routes.js";
import User from "$app/routes/user/user.routes.js";
import NFT from "$app/routes/nft/nft.routes.js";

// import { jwt } from "$app/middlewares/index.js";

const router = express.Router();

router.use("/permissions", Permission);
router.use("/nfts", NFT);
router.use("/roles", Role);
router.use("/users", User);

export default router;
