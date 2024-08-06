const dropdowns = document.querySelectorAll(".dropdown-container"),
  inputLanguageDropdown = document.querySelector("#input-language"),
  outputLanguageDropdown = document.querySelector("#output-language"),
  icons = document.querySelectorAll(".row i");

function populateDropdown(dropdown, options) {
  dropdown.querySelector("ul").innerHTML = "";
  options.forEach((option) => {
    const li = document.createElement("li");
    const title = option.name + " (" + option.native + ")";
    li.innerHTML = title;
    li.dataset.value = option.code;
    li.classList.add("option");
    dropdown.querySelector("ul").appendChild(li);
  });
}

populateDropdown(inputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown, languages);

dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.toggle("active");
  });

  dropdown.querySelectorAll(".option").forEach((item) => {
    item.addEventListener("click", (e) => {
      //remove active class from current dropdowns
      dropdown.querySelectorAll(".option").forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");
      const selected = dropdown.querySelector(".selected");
      selected.innerHTML = item.innerHTML;
      selected.dataset.value = item.dataset.value;
      translate();
    });
  });
});
document.addEventListener("click", (e) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});

const swapBtn = document.querySelector(".swap-position"),
  inputLanguage = inputLanguageDropdown.querySelector(".selected"),
  outputLanguage = outputLanguageDropdown.querySelector(".selected"),
  inputTextElem = document.querySelector("#input-text"),
  outputTextElem = document.querySelector("#output-text");

swapBtn.addEventListener("click", (e) => {
  const temp = inputLanguage.innerHTML;
  inputLanguage.innerHTML = outputLanguage.innerHTML;
  outputLanguage.innerHTML = temp;

  const tempValue = inputLanguage.dataset.value;
  inputLanguage.dataset.value = outputLanguage.dataset.value;
  outputLanguage.dataset.value = tempValue;

  //swap text
  const tempInputText = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempInputText;

  translate();
});

function translate() {
  const inputText = inputTextElem.value;
  const inputLanguage =
    inputLanguageDropdown.querySelector(".selected").dataset.value;
  const outputLanguage =
    outputLanguageDropdown.querySelector(".selected").dataset.value;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURI(
    inputText
  )}`;
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      outputTextElem.value = json[0].map((item) => item[0]).join("");
    })
    .catch((error) => {
      console.log(error);
    });
}
inputTextElem.addEventListener("input", (e) => {
  //limit input to 5000 characters
  if (inputTextElem.value.length > 5000) {
    inputTextElem.value = inputTextElem.value.slice(0, 5000);
  }
  translate();
});

const uploadDocument = document.querySelector("#upload-document"),
  uploadTitle = document.querySelector("#upload-title");

uploadDocument.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (
    file.type === "application/pdf" ||
    file.type === "text/plain" ||
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    uploadTitle.innerHTML = file.name;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      inputTextElem.value = e.target.result;
      translate();
    };
  } else {
    alert("Please upload a valid file");
  }
});

const downloadBtn = document.querySelector("#download-btn");

downloadBtn.addEventListener("click", (e) => {
  const outputText = outputTextElem.value;
  const outputLanguage =
    outputLanguageDropdown.querySelector(".selected").dataset.value;
  if (outputText) {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `translated-to-${outputLanguage}.txt`;
    a.href = url;
    a.click();
  }
});

const darkModeCheckbox = document.getElementById("dark-mode-btn");

darkModeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

const inputChars = document.querySelector("#input-chars");

inputTextElem.addEventListener("input", (e) => {
  inputChars.innerHTML = inputTextElem.value.length;
});


icons.forEach(icon => {
  icon.addEventListener("click",({target}) => {
    if(!inputTextElem.value || !outputTextElem.value) return;
    if(target.classList.contains("fa-copy")) {
      var tooltip = document.querySelector('.tooltip');
    tooltip.classList.add('show-tooltip');
  
    // Hide the tooltip after 2 seconds
    setTimeout(function() {
      tooltip.classList.remove('show-tooltip');
  }, 2000);
      if(target.id == "from") {
        navigator.clipboard.writeText(inputTextElem.value);
      }else {
        navigator.clipboard.writeText(outputTextElem.value);
      }
    }else if(target.classList.contains("fa-volume-up")){
      let utterance;
      if(target.id == "from") {
        utterance = new SpeechSynthesisUtterance(inputTextElem.value);
        utterance.lang = dropdowns[0].value;
      }else { 
        utterance = new SpeechSynthesisUtterance(outputTextElem.value);
        utterance.lang = dropdowns[1].value;
      }
      speechSynthesis.speak(utterance);
    }else {
       // Check if the browser supports the Web Speech API
  if (!('webkitSpeechRecognition' in window)) {
    alert('Your browser does not support speech recognition. Please use a supported browser.');
    return;
}

var recognition = new webkitSpeechRecognition();
recognition.continuous = true; // Allow continuous recognition
recognition.interimResults = true; // Enable interim results
recognition.lang = 'en-US';

recognition.onstart = function() {
    console.log('Speech recognition started');
};

recognition.onerror = function(event) {
    console.log('Error occurred in recognition: ' + event.error);
};

recognition.onend = function() {
    console.log('Speech recognition ended');
    hideDialog();
};

recognition.onresult = function(event) {
    var speechResult = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        speechResult += event.results[i][0].transcript;
    }
    document.getElementById('input-text').value = speechResult;
    console.log('Speech result: ' + speechResult);
};

// Show the dialog
showDialog();

// Start the speech recognition
recognition.start();

// Stop recognition after 15 seconds
setTimeout(function() {
    recognition.stop();
}, 15000);
    }
  });
});


function showDialog() {
  var dialog = document.getElementById('dialog');
  dialog.style.display = 'flex';
}

function hideDialog() {
  var dialog = document.getElementById('dialog');
  dialog.style.display = 'none';
}

