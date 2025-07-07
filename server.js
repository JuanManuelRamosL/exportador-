const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ CREDENCIALES DE SERVICIO
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: "tech-media-438002",
    private_key_id: "95d08fdc1f457d5c0ea9860eafdafd11314040d2",
    private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkq...<tu clave completa>\n-----END PRIVATE KEY-----\n`,
    client_email: "sheetsservice@tech-media-438002.iam.gserviceaccount.com",
    client_id: "104919253957063280311",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/sheetsservice%40tech-media-438002.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// 📋 DATOS DE LA SHEET
const SPREADSHEET_ID = "1zT0k6oshZepMM3SWm0A8Wn3kcr0XZeIhJzH4VZq9NrI";
const SHEET_NAME = "Hoja";

// ✅ Función para guardar en la hoja
async function guardarContacto(nombre, canal, telefono) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:D`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[nombre, canal, telefono, new Date().toLocaleString()]],
    },
  });
}

// 🚀 Endpoint para recibir desde ManyChat
app.post("/guardar-contacto", async (req, res) => {
  try {
    const { name, channel, custom_field_telefono } = req.body;

    await guardarContacto(
      name || "",
      channel || "",
      custom_field_telefono || ""
    );

    res.status(200).send({ message: "Contacto guardado correctamente" });
  } catch (error) {
    console.error("❌ Error al guardar contacto:", error);
    res.status(500).send({ error: "Error interno al guardar en la hoja" });
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🟢 Servidor activo en puerto ${PORT}`));
