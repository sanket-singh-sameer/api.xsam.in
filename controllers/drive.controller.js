import { getAuthUrl } from "../services/driveAuthConfig.js";
import { OAuth2Client } from "../services/OAuth2Client.js";
import { drive } from "../services/driveConfig.js";
import fs from "fs";
import { bufferToStream } from "../services/bufferToStream.js";

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
    const nodeEnv = process.env.NODE_ENV;
    let baseDriveUrl = "https://drive.xsam.in/0:/uploads/";

    let folderID = req.query.folderID || process.env.YOUR_FOLDER_ID;
    
    console.log("Received file:", req.file);
    const uploadedFile = await drive.files.create({
      requestBody: {
        name:
          "xsamdotin-" +
          Date.now() +
          "-" +
          Math.round(Math.random() * 1e9) +
          "-" +
          req.file.originalname,
        mimeType: req.file.mimetype,
        parents: [folderID],
      },
      media: {
        mimeType: req.file.mimetype,
        body: bufferToStream(req.file.buffer),
      },
    });
    console.log("✅ File uploaded:", uploadedFile.data);
    if (nodeEnv === "development") {
      baseDriveUrl = "https://drive.xsam.in/1:/api.xsam.in/";
    } else if (nodeEnv === "production") {
      baseDriveUrl = "https://drive.xsam.in/0:/uploads/";
    }
    res.status(200).json({
      message: "File received successfully!",
      url: `${baseDriveUrl}${uploadedFile.data.name}`,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: "Error occurred while uploading file." });
  } finally {
    req.file.buffer = null;

    // Clean up the uploaded file from the server
    // if (req.file && req.file.path) {
    //   fs.unlink(req.file.path, (err) => {
    //     if (err) {
    //       console.error("Error deleting file:", err);
    //     } else {
    //       console.log("Temporary file deleted:", req.file.path);
    //     }
    //   });
    // }
  }
};

export const driveListFilesController = async (req, res) => {
  try {
    const folderID = req.query.folderID || process.env.YOUR_FOLDER_ID;

    if (!folderID) {
      return res.status(400).json({
        message: "Missing folder id. Set YOUR_FOLDER_ID in env or pass ?folderID=...",
      });
    }

    const filesResponse = await drive.files.list({
      q: `'${folderID}' in parents and trashed = false`,
      fields:
        "files(id,name,mimeType,size,createdTime,webViewLink,webContentLink),nextPageToken",
      orderBy: "createdTime desc",
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = filesResponse.data.files || [];

    return res.status(200).json({
      folderID,
      count: files.length,
      files,
    });
  } catch (err) {
    console.error("❌ Error listing drive files:", err.message);
    return res.status(500).json({
      message: "Error occurred while fetching files from Google Drive.",
      error: err.message,
    });
  }
};
