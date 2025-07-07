const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");

// ✅ Configuración general
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Configurar Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: "tech-media-438002",
    private_key_id: "95d08fdc1f457d5c0ea9860eafdafd11314040d2",
    private_key:
      `-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA\n-----END PRIVATE KEY-----\n`.replace(
        /\\n/g,
        "\n"
      ),
    client_email: "sheetsservice@tech-media-438002.iam.gserviceaccount.com",
    client_id: "104919253957063280311",
    token_uri: "https://oauth2.googleapis.com/token",
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = "1zT0k6oshZepMM3SWm0A8Wn3kcr0XZeIhJzH4VZq9NrI";
const SHEET_NAME = "Hoja";

// ✅ Buffer en memoria
let buffer = [];

// ✅ Escribir lote en Sheets
async function escribirEnSheets() {
  if (buffer.length === 0) return;

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const lote = buffer.splice(0, 20); // Lote de hasta 20 contactos

  try {
    const values = lote.map((contacto) => [
      contacto.nombre,
      contacto.canal,
      contacto.telefono,
      new Date().toLocaleString(),
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:D`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    console.log(`✅ ${values.length} contacto(s) escritos`);
  } catch (error) {
    console.error("❌ Error al escribir en Sheets:", error);
    buffer = lote.concat(buffer); // Reintenta más adelante
  }
}

// ✅ Guardar cada 2 segundos
setInterval(escribirEnSheets, 2000);

// ✅ Endpoint para recibir contactos
app.post("/guardar-contacto", (req, res) => {
  const { name, channel, custom_field_telefono } = req.body;

  buffer.push({
    nombre: name || "",
    canal: channel || "",
    telefono: custom_field_telefono || "",
  });

  res.status(200).send({ message: "Contacto recibido" });
});

// ✅ Arranque del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en puerto ${PORT}`);
});
