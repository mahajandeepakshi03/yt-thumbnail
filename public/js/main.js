function onSubmit(e) {
  e.preventDefault();


  const prompt = document.querySelector("#prompt").value;

  if (prompt === "") {
    alert("Please add some text");
    return;
  }

  generateImageRequest(prompt);
}

const selectedImages = [];

async function generateImageRequest(link) {
  try {
    showSpinner();
    const res = await fetch("/yt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        link: link,
      })
    });

    if (!res.ok) {
      removeSpinner();
      throw new Error("That image could not be generated");
    }

    const title = await res.json();
    console.log(title);
    const search = title.title + " " + title.description;

    
    const response = await fetch("/openai/generateimage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: search,
      }),
    });

    if (!response.ok) {
      removeSpinner();
      throw new Error("That image could not be generated");
    }

    const data = await response.json();

    const imageUrl = data;

    document.getElementById("img-con").innerHTML = "";
    for (let i = 0; i < 9; i++) {
      document.getElementById("img-con").innerHTML += `
      <div class="image-container">
      <img src="${imageUrl.data[i].url}" class="img-img" alt="" onclick="toggleSelection(this)"/>
    </div>
      `;
    }

    removeSpinner();
  } catch (error) {
    console.log(error);
    removeSpinner();
  }
}

function showSpinner() {
  document.querySelector(".spinner").classList.add("show");
}


const zipImages = async () => {
  showSpinner();
  const zip = new JSZip();

  const image1 = await fetch("/img/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      link: selectedImages[0].src,
    })
  })


  const image2 = await fetch("/img/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      link: selectedImages[1].src,
    })
  })

  const image3 = await fetch("/img/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      link: selectedImages[2].src,
    })
  })




  // const image1 = await fetch((selectedImages[0].src)).then(res => res.blob());
  // const image2 = await fetch(selectedImages[1].src).then(res => res.blob());
  // const image3 = await fetch(selectedImages[2].src).then(res => res.blob());

  zip.file("image1.jpg", await image1.blob());
  zip.file("image2.jpg", await image2.blob());
  zip.file("image3.jpg", await image3.blob());

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'images.zip';
  document.body.appendChild(link);
  link.click();
  removeSpinner();
};




const toggleSelection = (image) => {
  console.log(selectedImages.length)
  if (selectedImages.length === 3){
    if(selectedImages.includes(image)){
      image.classList.remove('selected');
      selectedImages.splice(selectedImages.indexOf(image), 1);
    }
    return;
  };
  if (selectedImages.includes(image)) {
    image.classList.remove('selected');
    selectedImages.splice(selectedImages.indexOf(image), 1);
  } else {
    image.classList.add('selected');
    selectedImages.push(image);
  }
  if(selectedImages.length === 3){
    document.querySelector("#btn-down").classList.remove("hide");
  }
  if(selectedImages.length < 3){
    document.querySelector("#btn-down").classList.add("hide");
  }
  console.log(selectedImages);
};


function removeSpinner() {
  document.querySelector(".spinner").classList.remove("show");
}

document.querySelector("#image-form").addEventListener("submit", onSubmit);
