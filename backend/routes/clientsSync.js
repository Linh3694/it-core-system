const { Client } = require("@microsoft/microsoft-graph-client");
const { ClientCredentials } = require("simple-oauth2");
require("isomorphic-fetch");
require("dotenv").config();
const ClientModel = require("../models/Clients");
const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateToken");

// Tạo OAuth2 client
const oauth2Client = new ClientCredentials({
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://login.microsoftonline.com",
    tokenPath: `/${process.env.TENANT_ID}/oauth2/v2.0/token`,
  },
});

// Hàm lấy access token từ Azure AD
const getAccessToken = async () => {
  try {
    const tokenParams = {
      scope: "https://graph.microsoft.com/.default",
    };
    const tokenResponse = await oauth2Client.getToken(tokenParams);
    return tokenResponse.token.access_token;
  } catch (error) {
    console.error("Lỗi khi lấy access token:", error.message);
    throw new Error("Không thể lấy access token");
  }
};

// Hàm lấy thành viên của một nhóm Azure
const getClientsFromAzure = async (groupId, accessToken) => {
  try {
    const client = Client.init({
      authProvider: (done) => done(null, accessToken),
    });

    let nextLink = `/groups/${groupId}/members?$select=id,displayName,mail,jobTitle,department`;
    const formattedUsers = [];

    // Lấy dữ liệu qua phân trang
    while (nextLink) {
      const response = await client.api(nextLink).get();
      const users = response.value.map((user) => ({
        username: user.mail || user.userPrincipalName || "No Email",
        email: user.mail || null,
        displayName: user.displayName || "Unknown",
        jobTitle: user.jobTitle || "Not Provided",
        department: user.department || null,
      }));
      formattedUsers.push(...users);
      nextLink = response["@odata.nextLink"]
        ? response["@odata.nextLink"].split("v1.0")[1]
        : null;
    }

    return formattedUsers;
  } catch (error) {
    console.error(`Lỗi khi lấy thành viên từ Azure cho nhóm ${groupId}:`, error.message);
    throw new Error(`Không thể lấy thành viên cho nhóm: ${groupId}`);
  }
};

// Hàm đồng bộ dữ liệu từ Azure vào MongoDB
const syncClientsFromAzure = async (req, res) => {
  try {
    const groupIds = process.env.AZURE_GROUP_IDS.split(",");
    if (!groupIds || groupIds.length === 0) {
      return res.status(400).json({ message: "Không có ID nhóm Azure nào được cung cấp" });
    }

    const accessToken = await getAccessToken();
    const allMembers = [];

    for (const groupId of groupIds) {
      console.log(`Đang đồng bộ thành viên cho nhóm: ${groupId}`);
      const members = await getClientsFromAzure(groupId, accessToken);
      allMembers.push(...members);
    }

    // Lưu hoặc cập nhật dữ liệu vào MongoDB
    for (const member of allMembers) {
      await ClientModel.updateOne(
        { email: member.email }, // Dựa vào email làm khóa chính
        {
          $set: {
            username: member.username,
            name: member.displayName,
            jobTitle: member.jobTitle,
            department: member.department,
          },
        },
        { upsert: true }
      );
    }

    console.log("Đồng bộ thành công dữ liệu từ Azure!");
    res.status(200).json({ message: "Đồng bộ thành công dữ liệu từ Azure!" });
  } catch (error) {
    console.error("Lỗi khi đồng bộ dữ liệu từ Azure:", error.message);
    res.status(500).json({ message: "Lỗi khi đồng bộ dữ liệu từ Azure." });
  }
};

// Định nghĩa router
router.post("/sync-clients", validateToken, syncClientsFromAzure);

module.exports = {
  router,
  syncClientsFromAzure,
};