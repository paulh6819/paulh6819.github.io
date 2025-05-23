let formData = new FormData();
// fix this below, update the environment varibles
const apiUrl = "https://chatgpt-image-analyser-production.up.railway.app";
//const apiUrl = "http://localhost:3010";

let mediaTypeToggle = localStorage.getItem("selectedMedia") || "DVD";
let extraAnalysisToggle = localStorage.getItem("extraAnalysisToggle");
let fuzzyLogicStrength = null;

//The two functions below handle the photos uploaded up the user, display them to the UI and prepare them to be sent to the backend
async function handleDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  await handleFiles(files);
  console.log("this is the formData", formData);
  sendDataToAIEndPoint();
}

function handleImageUploadFromButton(event) {
  const files = event.target.files;
  handleFiles(files);
  sendDataToAIEndPoint();
}
//endpoint
async function sendDataToAIEndPoint() {
  displayLoadingSymbol();

  const promtTextInput = document.getElementById("prompt-text").value;

  formData.append("prompt", promtTextInput);

  putPromptInLocalStorage(promtTextInput);
  console.log("🧪 Logging all FormData entries:");
  for (let pair of formData.entries()) {
    console.log("👉", pair[0], pair[1]);
  }

  sendImagesSeparately(formData, promtTextInput);
}

/////
/////  HELPER FUNCTIONS BELOW THIS POINT
////

async function handleFiles(files) {
  const splitPhotoMode = true; // or pull this from localStorage or UI

  const imageArray = splitPhotoMode
    ? await createArrayOfImagesFromFileAndUpdateFormData(files)
    : createOriginalImagesAndUpdateFormData(files);

  //this below populates the UI with the orginal uploaded images
  updateImage(files);

  displaySendDataButton();
}

function handleDragOver(event) {
  event.preventDefault();
}

function updateImage(files) {
  const imageArray = [];

  for (let i = 0; i < files.length; i++) {
    if (files[i].type.match(/^image\//)) {
      console.log("Dropped file:", files[i]);
      // formData.append("images", files[i]);
      imageArray.push(files[i]);
    }
  }

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

function createOriginalImagesAndUpdateFormData(fileElement) {
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

async function createArrayOfImagesFromFileAndUpdateFormData(fileElement) {
  // const imageArray = [];
  // for (let i = 0; i < fileElement.length; i++) {
  //   if (fileElement[i].type.match(/^image\//)) {
  //     console.log("Dropped file:", fileElement[i]);
  //     formData.append("images", fileElement[i]);
  //     imageArray.push(fileElement[i]);
  //   }
  // }
  // return imageArray;

  const imageArray = [];
  const promises = [];

  //this for loop is what splits the photo in 4
  for (let i = 0; i < fileElement.length; i++) {
    const file = fileElement[i];
    if (!file.type.match(/^image\//)) continue;

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        const canvas = document.createElement("canvas");
        canvas.width = width / 4;
        canvas.height = height;

        for (let j = 0; j < 4; j++) {
          const ctx = canvas.getContext("2d");
          ctx.drawImage(
            img,
            j * (width / 4), // Source X
            0, // Source Y
            width / 4, // Source Width
            height, // Source Height
            0, // Dest X
            0, // Dest Y
            canvas.width, // Dest Width
            canvas.height // Dest Height
          );

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const chunkFile = new File([blob], `chunk_${i}_${j}.jpg`, {
                  type: "image/jpeg",
                });
                formData.append("images", chunkFile);
                imageArray.push(chunkFile);
                if (imageArray.length === 4 * (i + 1)) resolve();
              }
            },
            "image/jpeg",
            0.85
          );
        }
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    promises.push(promise);
  }

  // Wait for all images to finish processing before continuing
  await Promise.all(promises).then(() => {
    // updateImage(imageArray);
    displaySendDataButton();
  });
  console.log("this is the image array", imageArray);
  return imageArray;
}

//
function displaySendDataButton() {
  document.getElementById(
    "div-for-button-to-fetch-data-from-backend"
  ).style.display = "block";
}
//

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
      //refreash UI to update prompt
      window.location.reload();

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
      apiUrl +
        `/AIAnalysisEndPoint?media=${mediaTypeToggle}&extraAnalysis=${extraAnalysisToggle}&fuzzyLogicSearchStrenth=${fuzzyLogicStrength}`,
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
    alert(
      `theres an error with one of the images and here is the error- ${error}`
    );
  }
}

async function handleResponse(response) {
  if (response.ok) {
    // const data = await response.json();
    const data = await response.json(); // Correctly parse the response
    console.log("Full API Response:", data);

    const imageToAppendToTheReturningTitles = arrayBufferToBase64(
      data.imageKey.data
    );
    const imageSrc = `data:${data.imageType};base64,${imageToAppendToTheReturningTitles}`;
    let htmlContent = ` <div class="result-box">
    <img src="${imageSrc}" alt="Uploaded Image" class="uploaded-image"/>
    <h2>Extracted Titles</h2><ul>`;
    // Iterate over all extracted titles from all results
    console.log(
      "this shuold be the image binary",
      data.imageKey.toString("base64")
    );
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

    htmlContent += `</ul>
    </div>
    `;

    // Inject into UI
    document.getElementById("result-container").style.display = "block";
    document.getElementById("result-container").innerHTML += htmlContent;

    return data;
  } else {
    throw new Error(`Server responded with status: ${response.status}`);
  }
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary); // Convert binary string to Base64
}

function makeSettingsAppear() {
  const settingsDiv = document.getElementById(
    "div-holding-prompt-and-text-area"
  );
  if (settingsDiv.style.display === "block") {
    settingsDiv.style.display = "none";
  } else {
    settingsDiv.style.display = "block";
  }
}

//i need to make a fuction that grabs the button for the extra anaylisis toggle and then puts into the local host if the extra analisis is true or not,
// and then i need to make thebox turn green if chatGPT says the match is true, for when the extraAnaalisis is working

function setupExtraAnalysisButton() {
  // Get the button element
  let extraAnalysisBtn = document.getElementById("extraAnalysisBtn");

  // Load the toggle state from localStorage (always stored as a string)
  let storedToggle = localStorage.getItem("extraAnalysisToggle");
  console.log(storedToggle);

  // Declare a variable to store the actual boolean state
  let extraAnalysisToggle;

  // Convert stored string into boolean value (true or false)
  if (storedToggle === "true") {
    extraAnalysisToggle = true;
  } else {
    extraAnalysisToggle = false;
  }

  // Apply the visual state based on the toggle value
  if (extraAnalysisToggle === true) {
    extraAnalysisBtn.style.backgroundColor = "green";
    extraAnalysisBtn.style.color = "white";
    extraAnalysisBtn.setAttribute("data-active", "true");
  } else {
    extraAnalysisBtn.style.backgroundColor = "gray";
    extraAnalysisBtn.style.color = "white";
    extraAnalysisBtn.setAttribute("data-active", "false");
  }

  // Attach a click event listener to the button
  extraAnalysisBtn.addEventListener("click", function () {
    // Flip the toggle value
    if (extraAnalysisToggle === true) {
      extraAnalysisToggle = false;
    } else {
      extraAnalysisToggle = true;
    }

    // Save the updated value back to localStorage
    if (extraAnalysisToggle === true) {
      localStorage.setItem("extraAnalysisToggle", "true");
    } else {
      localStorage.setItem("extraAnalysisToggle", "false");
    }

    // Update the button appearance
    if (extraAnalysisToggle === true) {
      extraAnalysisBtn.style.backgroundColor = "green";
      extraAnalysisBtn.style.color = "white";
      extraAnalysisBtn.setAttribute("data-active", "true");
    } else {
      extraAnalysisBtn.style.backgroundColor = "gray";
      extraAnalysisBtn.style.color = "white";
      extraAnalysisBtn.setAttribute("data-active", "false");
    }

    // Log it for debugging
    console.log("Extra Analysis Toggle is now:", extraAnalysisToggle);

    // Reload the page to reflect changes
    location.reload();
  });
}
document.addEventListener("DOMContentLoaded", function () {
  setupExtraAnalysisButton();
});

///LOGIC FOR DROP DOWN MENU
let currentlyOpenMenu = null;
const toggleDropdown = (e) => {
  e.stopPropagation();
  const btn = e.currentTarget;
  let menu = btn.nextElementSibling;

  while (menu && menu.nodeType !== 1) {
    menu = menu.nextSibling;
  }

  if (!menu) return;

  const isOpen = menu.style.display === "block";

  if (currentlyOpenMenu && currentlyOpenMenu !== menu) {
    currentlyOpenMenu.style.display = "none";
  }

  menu.style.display = isOpen ? "none" : "block";
  currentlyOpenMenu = isOpen ? null : menu;
};
const closeAllMenus = () => {
  if (currentlyOpenMenu) {
    currentlyOpenMenu.style.display = "none";
    currentlyOpenMenu = null;
  }
};
window.addEventListener("DOMContentLoaded", () => {
  const dropdownItems = document.querySelectorAll(".dropdown-menu li");
  const displaySpan = document.getElementById("fuzzyStrengthValue");

  // Restore value from localStorage (if any)
  const savedValue = localStorage.getItem("fuzzyLogicStrength");
  if (savedValue) {
    // Highlight the saved option
    dropdownItems.forEach((item) => {
      if (item.getAttribute("data-value") === savedValue) {
        item.classList.add("active");
        if (displaySpan) {
          displaySpan.textContent = savedValue;
        }
      } else {
        item.classList.remove("active");
      }
    });
  }

  // Attach click events
  document.querySelectorAll(".btn-buy-list").forEach((btn) => {
    btn.addEventListener("click", toggleDropdown);
  });

  dropdownItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();

      // Remove highlight from other items
      const allItems = item.parentElement.querySelectorAll("li");
      allItems.forEach((li) => li.classList.remove("active"));

      // Highlight selected item
      item.classList.add("active");

      // Get selected value
      const selectedValue = item.getAttribute("data-value");
      console.log(`User selected fuzzy logic level: ${selectedValue}`);

      // Update display
      if (displaySpan) {
        displaySpan.textContent = selectedValue;
      }

      // ✅ Save to localStorage
      localStorage.setItem("fuzzyLogicStrength", selectedValue);

      // Close menu
      closeAllMenus();
    });
  });
});
// Close dropdown if click outside
window.addEventListener("click", (e) => {
  if (
    currentlyOpenMenu &&
    !e.target.classList.contains("btn-buy-list") &&
    !currentlyOpenMenu.contains(e.target)
  ) {
    closeAllMenus();
  }
});
function getFuzzyLogicStrengthFromLocalStorage() {
  const storedValue = localStorage.getItem("fuzzyLogicStrength");
  if (storedValue) {
    console.log(
      `📦 Loaded fuzzyLogicStrength from localStorage: ${storedValue}`
    );
    fuzzyLogicStrength = storedValue;
  } else {
    console.log("📦 No fuzzyLogicStrength found in localStorage.");
  }
}
// Call this once on page load
getFuzzyLogicStrengthFromLocalStorage();
