// const express = require("express");
// const cors = require("cors");
// const fetch = require("node-fetch");
// const app = express();
// app.use(cors());
// app.use(express.json());

// app.post("/translate", async (req, res) => {
//   const { q, source, target } = req.body;
//   const response = await fetch("https://libretranslate.de/translate", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ q, source, target, format: "text" })
//   });
//   const data = await response.json();
//   res.json(data);
// });

// app.listen(3000, () => console.log("Proxy running on http://localhost:3000"));
