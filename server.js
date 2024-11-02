import express from "express";
import multer from "multer";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("pages"));
app.use(express.urlencoded({ extended: true }));
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/AIAnalysisEndPoint", upload.array("images"), async (req, res) => {
  //this is necessary because the prompt comes in array of all the promts, can be a source for bugs so I will need to dig in to this
  const promptTextArray = req.body.prompt;
  let promtForGPT = extractPrompt(promptTextArray);
  console.log("this is the first console.log", promtForGPT);

  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No images uploaded.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

async function informationBackFromChatGPTAboutPhoto(img) {
  const base64Image = Buffer.from(img).toString("base64");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Here is a promt from a user in regards to the image: ${promtForGPT}. Please return back in the form of HTML so the user can have the result displayed in the UI.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  });
  console.log(
    "here is chat GPTs response to the INITAL book image",
    response.choices[0]
  );

  return response.choices[0];
}

function extractPrompt(itemToTest) {
  if (Array.isArray(itemToTest)) {
    return itemToTest[itemToTest.length - 1];
  } else {
    return itemToTest;
  }
}
