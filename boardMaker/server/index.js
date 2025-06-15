const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const levelRoutes = require("./routes/levels"); // Make sure this path is correct

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Mount the /api/levels route handler
app.use("/api/levels", levelRoutes);

app.listen(port, () => console.log(`Server listening on port ${port}`));
