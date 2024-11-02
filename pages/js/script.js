let imagesToBeDisplayedInTheUi = "";
let formData = new FormData();

async function handleDrop(event) {
  event.preventDefault();

  const file = event.dataTransfer.files;

  console.log("Dropped file:", file);

  const imageArray = [];

  for (let i = 0; i < file.length; i++) {
    if (file[i].type.match(/^image\//)) {
      console.log("Dropped file:", file[i]);
      formData.append("images[]", file[i]);
      imageArray.push(file[i]);
    }
  }

  updateImage(imageArray);
  function updateImage(imageArray) {
    //count++;

    for (let image of imageArray) {
      const img = document.createElement("img");

      img.src = URL.createObjectURL(image);
      img.height = 10;
      img.onload = function () {
        URL.revokeObjectURL(this.src);
      };
      imagesToBeDisplayedInTheUi += `<div class="image-dropped-in" >
<img class="image-dropped-in-url" src="${URL.createObjectURL(
        image
      )}" alt="image">
</div>
`;
    }
    document.getElementById("display-dropped-photos").innerHTML =
      imagesToBeDisplayedInTheUi;
  }
}
function handleDragOver(event) {
  event.preventDefault();
}
