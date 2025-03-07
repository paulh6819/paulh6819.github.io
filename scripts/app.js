let formData = new FormData();
// fix this below, update the environment varibles
const apiUrl = "https://chatgpt-image-analyser-production.up.railway.app";
//const apiUrl = "http://localhost:3010";

let mediaTypeToggle = localStorage.getItem("selectedMedia") || "DVD";
console.log(mediaTypeToggle);

//The two functions below handle the photos uploaded up the user, display them to the UI and prepare them to be sent to the backend
function handleDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  handleFiles(files);
}

function handleImageUploadFromButton(event) {
  const files = event.target.files;
  handleFiles(files);
}
//endpoint
async function sendDataToAIEndPoint() {
  displayLoadingSymbol();

  const promtTextInput = document.getElementById("prompt-text").value;

  formData.append("prompt", promtTextInput);

  putPromptInLocalStorage(promtTextInput);
  sendImagesSeparately(formData, promtTextInput);

  //below this is where the toggle switch state data will declare the uel perameter

  // try {
  //   const response = await fetch(
  //     apiUrl + `/AIAnalysisEndPoint?media=${mediaTypeToggle}`,
  //     {
  //       method: "POST",
  //       body: formData,
  //     }
  //   );

  //   console.log(response);

  //   const data = await handleResponse(response);
  //   hideLoadingSymbol();
  // } catch (error) {
  //   console.error("this is the error from the AIEndPoint", error);
  // }
}

/////
/////  HELPER FUNCTIONS BELOW THIS POINT
////

function handleFiles(files) {
  const imageArray = createArrayOfImagesFromFileAndUpdateFormData(files);
  updateImage(imageArray);
  displaySendDataButton();
}

function handleDragOver(event) {
  event.preventDefault();
}

function updateImage(imageArray) {
  const container = document.getElementById("display-dropped-photos");
  container.style.border = "dotted 4px black";
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

function createArrayOfImagesFromFileAndUpdateFormData(fileElement) {
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

loadSuggestedPromptsIntoLocalStorage();
function loadSuggestedPromptsIntoLocalStorage() {
  const prompt1 = `Extract the DVD titles from this image and return them **strictly** as a raw JSON object. Do NOT include any markdown formatting, just return the object directly in this format:

{ "titles": ["Title 1", "Title 2", "Title 3"] }

Make sure the response starts directly with { and ends with }. No additional text, explanations, or formatting.`;
  const prompt2 =
    "Suggested prompt: Please identify the following items and bring back an estimated resale value.";
  const promp3 =
    "Suggested prompt: Please recreate this UI with html and CSS and then print out the css you used at the bottom. Please make the changes significant.";
  putPromptInLocalStorage(prompt1);
  putPromptInLocalStorage(prompt2);
  putPromptInLocalStorage(promp3);
}

function putPromptInLocalStorage(uiPromptValue) {
  let prompts = JSON.parse(localStorage.getItem("prompts")) || [];

  if (prompts.includes(uiPromptValue)) {
    console.log("this promt is already in the UI");
  } else {
    prompts.push(uiPromptValue);
  }

  localStorage.setItem("prompts", JSON.stringify(prompts));
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("recentsButton")
    .addEventListener("click", function () {
      event.stopPropagation();
      const dropdown = document.getElementById("recentsDropdown");
      dropdown.style.display =
        dropdown.style.display === "none" ? "block" : "none";
      dimBackground();
      takePromptsFromLocalStorageAndDisPlayThemInTheRecentsTab();
    });
  document.addEventListener("click", function () {
    const dropdown = document.getElementById("recentsDropdown");

    if (dropdown.style.display === "block") {
      dropdown.style.display = "none";
      removeimmedBackground();
    }
  });
});

function dimBackground() {
  const modal = document.getElementById("dimmed-background");
  modal.style.transition = "opacity 0.5s ease-out";
  modal.style.opacity = "1";
  modal.style.visibility = "visible";
}
function removeimmedBackground() {
  const modal = document.getElementById("dimmed-background");
  modal.style.opacity = "0";
  modal.addEventListener(
    "transitionend",
    function handler() {
      if (modal.style.opacity === "0") {
        modal.style.visibility = "hidden";
      }
      modal.removeEventListener("transitionend", handler);
    },
    { once: true }
  );
}

function handleModalForCantAccessNotes() {
  const loginModal = document.getElementById("loginModal");
  loginModal.style.display = "block";
}

function removePrompt(index) {
  let prompts = JSON.parse(localStorage.getItem("prompts")) || [];
  prompts.splice(index, 1);
  localStorage.setItem("prompts", JSON.stringify(prompts));
}

function takePromptsFromLocalStorageAndDisPlayThemInTheRecentsTab() {
  const recentPromts = JSON.parse(localStorage.getItem("prompts")) || [];
  const dropdown = document.getElementById("recentsDropdown");
  dropdown.innerHTML = "";
  dropdown.style.zIndex = 100;

  recentPromts.forEach(function (prompt, index) {
    let xOutButton = document.createElement("button");
    xOutButton.innerHTML = "&times";
    xOutButton.classList.add("close-button");
    xOutButton.onclick = function (event) {
      event.stopPropagation();
      removePrompt(index);
      takePromptsFromLocalStorageAndDisPlayThemInTheRecentsTab();
    };
    let promptEntry = document.createElement("a");
    promptEntry.textContent = prompt;
    promptEntry.classList.add("prompt-entry");
    promptEntry.href = "#";
    promptEntry.addEventListener("click", function () {
      document.getElementById("prompt-text").value = prompt;
      dropdown.style.display = "none";
      removeimmedBackground();
    });
    promptEntry.appendChild(xOutButton);
    dropdown.appendChild(promptEntry);
  });
}

function displayLoadingSymbol() {
  const loader = document.querySelector(".loadingspinner-container");
  if (loader) {
    loader.style.visibility = "visible";
    loader.style.opacity = "1";
  }
}

function hideLoadingSymbol() {
  const loader = document.querySelector(".loadingspinner-container");
  if (loader) {
    loader.style.opacity = "0";

    setTimeout(() => {
      loader.style.visibility = "hidden";
    }, 500);
  }
}

//look into jsdoc for types
function setupSelectionButtons() {
  let selectedOption = null;

  document.getElementById("selected-value").innerText =
    localStorage.getItem("selectedMedia");

  // Select all buttons with class 'option-btn'
  document.querySelectorAll(".option-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      // Get value from the clicked button
      selectedOption = event.target.getAttribute("data-value");
      mediaTypeToggle = selectedOption;
      console.log(mediaTypeToggle);
      // Update UI
      document.getElementById("selected-value").innerText = selectedOption;
      localStorage.setItem("selectedMedia", selectedOption);

      console.log("Selected Option:", selectedOption);
    });
  });
}
setupSelectionButtons();

function changeMediaTypeInTheDefaultPrompt() {
  let startingPrompt = `Extract the ${mediaTypeToggle} titles from this image and return them. 
  Include subtitles like, collectors edition or complete season, ect.
 **strictly** as a raw JSON object. Do NOT include any markdown 
formatting, just return the object directly in this format:

{ "titles": ["Title 1", "Title 2", "Title 3"] }

Make sure the response starts directly with { and ends with }. No additional text, explanations, or formatting.`;

  document.getElementById("prompt-text").innerHTML = startingPrompt;
}
changeMediaTypeInTheDefaultPrompt();

// async function sendImagesSeparately(formData, promtTextInput) {
//   for (let [key, value] of formData.entries()) {
//     if (key === "images") {
//       // Ensure we are only processing images
//       const singleFormData = new FormData();
//       singleFormData.append("images", value);
//       singleFormData.append("prompt", promtTextInput);

//       fetch(apiUrl + "/AIAnalysisEndPoint", {
//         method: "POST",
//         body: singleFormData,
//       })
//         .then((response) => response.json())
//         .then((data) => {
//           console.log("Response for image:", data);
//           // Update UI with individual responses
//         })
//         .catch((error) => console.error("Error uploading image:", error));
//     }
//   }
// }

async function sendImagesSeparately(formData, promptTextInput) {
  let htmlContent = `<h2>Extracted Titles</h2><ul>`;

  for (let [key, value] of formData.entries()) {
    console.log(
      "this is the new function and the key and the value",
      key,
      value
    );
    if (key === "images") {
      console.log("inside the if of the images");
      // Ensure we are only processing images
      const singleFormData = new FormData();
      singleFormData.append("images", value);
      singleFormData.append("prompt", promptTextInput);
      processIMageWithFetch(singleFormData);
    }
  }
}
async function processIMageWithFetch(singleFormData) {
  try {
    const response = await fetch(
      apiUrl + `/AIAnalysisEndPoint?media=${mediaTypeToggle}`,
      {
        method: "POST",
        body: singleFormData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    await handleResponse(response);
    hideLoadingSymbol();
  } catch (error) {
    console.error("Error uploading image:", error);
  }
}

async function handleResponse(response) {
  if (response.ok) {
    // const data = await response.json();
    const data = await response.json(); // Correctly parse the response
    console.log("Full API Response:", data);
    // Initialize HTML content
    // Initialize HTML content
    let htmlContent = `<h2>Extracted Titles</h2><ul>`;
    // Iterate over all extracted titles from all results
    data.results.forEach((result) => {
      result.extractedTitles.forEach((title) => {
        htmlContent += `<li><strong>${title}</strong></li>`;
      });
    });

    htmlContent += `</ul><h2>Best Fuzzy Matches</h2><ul>`;

    // Iterate over all fuzzy matches from all results
    data.results.forEach((result) => {
      result.fuzzyMatches.forEach((match) => {
        htmlContent += `<li>${match}</li>`;
      });
    });

    htmlContent += `</ul>`;

    // Inject into UI
    document.getElementById("result-container").style.display = "block";
    document.getElementById("result-container").innerHTML += htmlContent;

    return data;
  } else {
    throw new Error(`Server responded with status: ${response.status}`);
  }
}
