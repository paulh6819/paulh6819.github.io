console.log("this javascript is hooked up ");
async function handleDrop(event) {
  event.preventDefault();

  const file = event.dataTransfer.files;

  console.log("Dropped file:", file);
}
function handleDragOver(event) {
  event.preventDefault();
}
