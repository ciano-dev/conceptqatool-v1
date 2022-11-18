const express = require("express");
const router = express.Router();
const Multer = require("multer");
const AdmZip = require("adm-zip");
const { Storage } = require("@google-cloud/storage");
const uuid = require("uuid");

const uuidv1 = uuid.v1;

require("dotenv").config();

const CreativeModel = require("../models/CreativeModel");
const PreviewModel = require("../models/PreviewModel");

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GCLOUD_CLIENT_EMAIL,
    private_key: process.env.GCLOUD_PRIVATE_KEY,
  },
});

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const bucket = storage.bucket(process.env.GCS_BUCKET);

// Routes
router.post("/", (req, res) => {
  res.json({
    status: "done",
  });
});

router.post("/upload", multer.single("upload"), (req, res) => {
  let uid = uuidv1();

  if (req.file.mimetype.includes('zip')) {
    let defaultValues = {},
      possibleValues = {},
      html = "",
      newHtml = "",
      newFileName,
      zip = new AdmZip(req.file.buffer),
      zipEntries = zip.getEntries(),
      indexList = 0,
      count = 0;

    zipEntries.forEach(function (zipEntry, index) {
      if (!zipEntry.isDirectory) {
        newFileName = `${uid}/${zipEntry.entryName}`;

        if (zipEntry.name === "index.html") {
          defaultValues = new Object();
          possibleValues = new Object();
          html = zipEntry.getData().toString("utf8");
          //zipEntry.setData(Buffer.from(xhtml, "utf8"));
          //console.log(zipEntry.getData());

          newHtml =
            html.split("</html>")[0] +
            `<script>
            window.addEventListener("message",
            (event) => {
                if(typeof event.data === "object"){
                    defaultValues= event.data;
                }else{
                  if(event.data === "pause"){
                    gwd.auto_PauseBtnClick();
                  }else{
                    gwd.auto_PlayBtnClick();
                  }
                }
            },
            false
        );
        </script></html>`;

          if (html.split("var defaultValues").length > 1) {
            const rawValues = html
              .split("var defaultValues")[1]
              .replace(/:'/g, ':"')
              .split("}")[0]
              .split("{")[1]
              .replace(/',|'/g, '",')
              .split('",');

            rawValues.forEach((values, index) => {
              if (index === rawValues.length - 1) {
                defaultValues[
                  values
                    .split(new RegExp('[:"]', "g"))[0]
                    .split("\n")
                    .pop()
                    .trim()
                ] = values
                  .split(new RegExp(/:\"|:\s\"/, "g"))
                  .pop()
                  .split('"')[0];
              } else {
                defaultValues[
                  values
                    .split(new RegExp('[:"]', "g"))[0]
                    .split("\n")
                    .pop()
                    .trim()
                ] = values.split(new RegExp(/:\"|:\s\"/, "g")).pop();
              }
            });
          }

          if (html.split("possibleValues").length > 1) {
            const posValues = html
              .split("possibleValues")[1]
              .replace(/:'/g, ':"')
              .split("}")[0]
              .split("{")[1]
              .replace(/',|'/g, '",')
              .split('",');

            posValues.forEach((values, index) => {
              if (index === posValues.length - 1) {
                possibleValues[
                  values
                    .split(new RegExp('[:"]', "g"))[0]
                    .split("\n")
                    .pop()
                    .trim()
                ] = values
                  .split(new RegExp(/:\"|:\s\"/, "g"))
                  .pop()
                  .split('"')[0];
              } else {
                possibleValues[
                  values
                    .split(new RegExp('[:"]', "g"))[0]
                    .split("\n")
                    .pop()
                    .trim()
                ] = values.split(new RegExp(/:\"|:\s\"/, "g")).pop();
              }
            });
          }

          zipEntry.setData(Buffer.from(newHtml, "utf8"));
        }

        // delete defaultValues[""];
        // delete possibleValues[""];

        var file = bucket.file(newFileName);
        var fileStream = file.createWriteStream();

        fileStream.on("error", (err) => console.log(err));
        fileStream.on("finish", () => {
          if (file.name.includes("index.html")) {
            indexList = 1;
          }
          count++;

          if (count === zipEntries.length - 1 && indexList !== 0) {
            const newNodes = new CreativeModel({
              url: process.env.GCS_BUCKET,
              uid: uid,
              directory: zipEntry.entryName.split("/")[0],
              width: zipEntry.entryName
                .toLowerCase()
                .split("/")[0]
                .split("-")[0]
                .split("x")[0],
              height: zipEntry.entryName
                .toLowerCase()
                .split("/")[0]
                .split("-")[0]
                .split("x")[1],
              defaultValue: defaultValues,
              possibleValue: possibleValues,
            });

            newNodes.save((error, result) => {
              if (error) {
                return res
                  .status(500)
                  .json({ msg: "Sorry, internal server errors" });
              }

              return res.json(result);
            });
          }
        });
        fileStream.end(zipEntry.getData());
      }
    });
  }
});

router.get("/getCreative", (req, res) => {
  CreativeModel.findById(
    req.query.mdbId,
    { useFindAndModify: false },
    (err, list) => {
      if (err) return res.status(500).send(err);
      return res.json(list);
    }
  );
});

router.post("/addPreview", (req, res) => {
  const newPreview = new PreviewModel({
    creativeId: req.body.cId,
    previewName: req.body.previewNode,
    defaultValues: {},
  });
  newPreview.save((error, result) => {
    if (error) {
      return res.status(500).json({ msg: "Sorry, internal server errors" });
    }
    return res.json(result);
  });
});

router.get("/getPreview", (req, res) => {
  PreviewModel.find({ creativeId: req.query.mdbId }, (err, list) => {
    if (err) return res.status(500).send(err);
    return res.json(list);
  });
});

router.post("/addPreviewSingle", (req, res) => {
  const newPreview = new PreviewModel({
    creativeId: req.body.cId,
    previewName: req.body.previewName,
    defaultValues: req.body.defaultValues,
    url: process.env.GCS_BUCKET,
    uid: req.body.uid,
    directory: req.body.directory,
    width: req.body.width,
    height: req.body.height,
  });
  newPreview.save((error, result) => {
    if (error) {
      return res.status(500).json({ msg: "Sorry, internal server errors" });
    }
    return res.json(result);
  });
});

router.get("/getPreviewSingle", (req, res) => {
  PreviewModel.findById(
    req.query.mdbId,
    { useFindAndModify: false },
    (err, list) => {
      if (err) return res.status(500).send(err);
      return res.json(list);
    }
  );
});

module.exports = router;
