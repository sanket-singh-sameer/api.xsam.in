import { getAuthUrl } from "../services/driveAuthConfig.js";
import { OAuth2Client } from "../services/OAuth2Client.js";
import { drive } from "../services/driveConfig.js";
import fs from "fs";

export const driveAuthController = (req, res) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
};

export const oauth2callbackController = async (req, res) => {
  const code = req.query.code;

  const { tokens } = await OAuth2Client.getToken(code);
  OAuth2Client.setCredentials(tokens);

  console.log("TOKENS:", tokens);

  res.status(200).json({
    message: "Authentication successful! You can close this tab.",
    tokens,
  });
};

export const driveUploadController = async (req, res) => {
  try {
    let folderID = process.env.YOUR_FOLDER_ID;
    if (req.body.folderID) {
      folderID = req.body.folderID;
    }
    console.log("Received file:", req.file);
    const uploadedFile = await drive.files.create({
      requestBody: {
        name: req.file.filename,
        mimeType: req.file.mimetype,
        parents: [folderID],
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      },
    });
    console.log("✅ File uploaded:", uploadedFile.data);

    res.status(200).json({
      message: "File received successfully!",
      url: `https://drive.xsam.in/1:/api.xsam.in/${uploadedFile.data.name}`,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: "Error occurred while uploading file." });
  } finally {
    // Clean up the uploaded file from the server
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("Temporary file deleted:", req.file.path);
        }
      });
    }
  }
};
