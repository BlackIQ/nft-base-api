import { NFT } from "$app/models/index.js";
import { intRay } from "$app/functions/index.js";

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import sharp from "sharp";

const template = `
    <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- bg -->
        <!-- head -->
        <!-- hair -->
        <!-- eyes -->
        <!-- nose -->
        <!-- mouth -->
        <!-- beard -->
    </svg>
`;

const randInt = (max) => {
  return Math.floor(Math.random() * (max + 1));
};

const randElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const srcDir = `./app`;
const desDir = `./des`;
const assetsDir = `${srcDir}/assets`;

const getLayer = (name, category, skip = 0.0) => {
  const svg = readFileSync(`${assetsDir}/${category}/${name}.svg`, "utf-8");
  const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g;
  const layer = svg.match(re)[0];
  return Math.random() > skip ? layer : "";
};

const svgToPng = async (idx) => {
  const src = `${desDir}/${idx}/${idx}.svg`;
  const dest = `${desDir}/${idx}/${idx}.png`;

  const img = await sharp(src);
  const resized = await img.resize(1024);

  await resized.toFile(dest);
};

const getRandomName = async () => {
  const adjectives =
    "fired trashy tubular nasty jacked swol buff ferocious firey flamin agnostic artificial bloody crazy cringey crusty dirty eccentric glutinous harry juicy simple stylish awesome creepy corny freaky shady sketchy lame sloppy hot intrepid juxtaposed killer ludicrous mangy pastey ragin rusty rockin sinful shameful stupid sterile ugly vascular wild young old zealous flamboyant super sly shifty trippy fried injured depressed anxious clinical".split(
      " "
    );
  const names =
    "aaron bart chad dale earl fred grady harry ivan jeff joe kyle lester steve tanner lucifer todd mitch hunter mike arnold norbert olaf plop quinten randy saul balzac tevin jack ulysses vince will xavier yusuf zack roger raheem rex dustin seth bronson dennis".split(
      " "
    );

  const randAdj = randElement(adjectives);
  const randName = randElement(names);
  const name = `${randAdj}-${randName}`;

  const nft = await NFT.findOne({ name });

  if (nft) {
    return getRandomName();
  }

  return name;
};

const getRandomFace = async () => {
  const bg = randInt(5);
  const hair = randInt(7);
  const eyes = randInt(9);
  const nose = randInt(4);
  const mouth = randInt(5);
  const beard = randInt(3);

  const face = [hair, eyes, mouth, nose, beard].join("");

  const nft = await NFT.findOne({ face });

  if (nft) {
    return getRandomFace();
  }

  return { bg, hair, eyes, nose, mouth, beard, face };
};

const getRandomIdx = async () => {
  const idx = intRay.gen(10);

  const nft = await NFT.findOne({ idx });

  if (nft) {
    return getRandomIdx();
  }

  return idx;
};

export const CREATE = async (req, res) => {
  const { uid: user } = req.headers;

  try {
    const { bg, hair, eyes, nose, mouth, beard, face } = await getRandomFace();
    const name = await getRandomName();
    const idx = await getRandomIdx()
    
    const final = template
      .replace("<!-- bg -->", getLayer(`bg${bg}`, "bg"))
      .replace("<!-- head -->", getLayer("head0", "head"))
      .replace("<!-- hair -->", getLayer(`hair${hair}`, "hair"))
      .replace("<!-- eyes -->", getLayer(`eyes${eyes}`, "eyes"))
      .replace("<!-- nose -->", getLayer(`nose${nose}`, "nose"))
      .replace("<!-- mouth -->", getLayer(`mouth${mouth}`, "mouth"))
      .replace("<!-- beard -->", getLayer(`beard${beard}`, "beard", 0.5));

    const meta = {
      name,
      description: `A drawing of ${name.split("-").join(" ")}`,
      image: `${idx}.png`,
      attributes: {},
    };

    mkdirSync(`${desDir}/${idx}`);

    writeFileSync(`${desDir}/${idx}/${idx}.json`, JSON.stringify(meta));
    writeFileSync(`${desDir}/${idx}/${idx}.svg`, final);
    svgToPng(idx);

    // Insert in MongoDB
    await NFT.create({
      idx,
      face,
      name: meta.name,
      description: meta.description,
      imageURL: meta.image,
      attributes: meta.attributes,
      owner: user,
      metadata: {},
    });

    return res.status(200).send({ message: "NFT created", meta });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const SINGLE = async (req, res) => {
  const { id } = req.params;

  try {
    const nft = await NFT.findOne({ _id: id });

    if (nft) {
      return res.status(200).send({ message: "NFT found", nft });
    } else {
      return res.status(404).send({ message: "NFT did not found" });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const ALL = async (req, res) => {
  const filter = req.query;

  try {
    const nfts = await NFT.find(filter);

    return res.status(200).send({ message: "Data fetched", nfts });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const UPDATE = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const nft = await NFT.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (nft) {
      return res.status(200).send({ message: "NFT updated", nft });
    } else {
      return res.status(404).send({ message: "NFT did not found" });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export const DELETE = async (req, res) => {
  const { id } = req.params;

  try {
    const nft = await NFT.findOneAndDelete({ _id: id });

    if (nft) {
      return res.status(200).send({ message: "NFT deleted" });
    } else {
      return res.status(404).send({ message: "NFT did not found" });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
