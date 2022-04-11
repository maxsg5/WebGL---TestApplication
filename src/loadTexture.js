

async function loadTexture(){
    let formData = new FormData();
    formData.append('file', myFile.files[0]);
    await fetch('/upload.php',{method : 'POST', body : formData});
}
    