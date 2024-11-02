let formData = new FormData();

async function handleDrop(event) {
  event.preventDefault();

  const file = event.dataTransfer.files;

  console.log("Dropped file:", file);

  // This populates the UI with the uploaded images
  const imageArray = createArrayOfImagesFromFile(file);
  updateImage(imageArray);
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
      formData.append("images[]", fileElement[i]);
      imageArray.push(fileElement[i]);
    }
  }
  return imageArray;
}
