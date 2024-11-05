let formData = new FormData();

//this function handles the photos being dropped by the user, gets them ready to send to the backend and then displays them for the user
async function handleDrop(event) {
  event.preventDefault();

  const file = event.dataTransfer.files;

  console.log("Dropped file:", file);

  // This populates the UI with the uploaded images
  const imageArray = createArrayOfImagesFromFile(file);
  updateImage(imageArray);

  displaySendDataButton();
}

async function sendDataToAIEndPoint() {
  const promtTextInput = document.getElementById("prompt-text").value;

  formData.append("prompt", promtTextInput);

  putPromptInLocalStorage(promtTextInput);

  try {
    const response = await fetch("/AIAnalysisEndPoint", {
      method: "POST",
      body: formData,
    });

    console.log(response);

    const data = await handleResponse(response);
  } catch (error) {
    console.error("this is the error from the AIEndPoint", error);
  }
}

/////
/////  HELPER FUNCTIONS BELOW THIS POINT
////

function handleDragOver(event) {
  event.preventDefault();
}

function updateImage(imageArray) {
  const container = document.getElementById("display-dropped-photos");

  imageArray.forEach((image) => {
    const imgElement = document.createElement("img");
    const objectURL = URL.createObjectURL(image);
    imgElement.src = objectURL;

    imgElement.onload = () => URL.revokeObjectURL(objectURL);

    const div = document.createElement("div");
    div.className = "image-dropped-in";
    div.appendChild(imgElement);
    container.appendChild(div);
  });
}

function createArrayOfImagesFromFile(fileElement) {
  const imageArray = [];
  for (let i = 0; i < fileElement.length; i++) {
    if (fileElement[i].type.match(/^image\//)) {
      console.log("Dropped file:", fileElement[i]);
      formData.append("images", fileElement[i]);
      imageArray.push(fileElement[i]);
    }
  }
  return imageArray;
}

function displaySendDataButton() {
  document.getElementById(
    "div-for-button-to-fetch-data-from-backend"
  ).style.display = "block";
}

async function handleResponse(response) {
  if (response.ok) {
    const data = await response.json();
    console.log("API Response Data:", data[0].message.content);
    const theTestPulledOutOfTheData = data[0].message.content;
    let dataToDisplayInTheUi = "";

    for (let item of data) {
      dataToDisplayInTheUi += item.message.content;
    }

    document.getElementById("result-container").innerHTML =
      dataToDisplayInTheUi;

    return data;
  } else {
    throw new Error(`Server responded with status: ${response.status}`);
  }
}

function putPromptInLocalStorage(uiPromptValue) {
  let prompts = JSON.parse(localStorage.getItem("prompts")) || [];

  prompts.push(uiPromptValue);

  localStorage.setItem("prompts", JSON.stringify(prompts));
}
