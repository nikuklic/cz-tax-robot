const UI = {};

UI.init = () => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const waitFor = predicate => new Promise(resolve => {
    const resolveOnPredicateSuccess = () => {
      if (predicate()) {
        return resolve() && true;
      }

      setTimeout(resolveOnPredicateSuccess, 1000);
    }

    resolveOnPredicateSuccess();
  });

  const waitForConsole = () => {    
    const devtools = function () {};    
    devtools.toString = function() {
      this.opened = true;
    };
    console.log('%c', devtools);

    return waitFor(() => devtools.opened)
  }
  
  const talkToTheUser = messages => messages.reduce(
    (chain, message) => chain.then(() => delay(1500 + 4 * Math.random())).then(() => console.log(message)),
    Promise.resolve()
  );

  waitForConsole()
    .then(() => talkToTheUser([
      'Hello..',
      'Looking at the console, huh?',
      'I must admit..',
      'As a robot, I do that as well sometimes',
      'Lots of funky stuff out there',
      'But my mom caught me once..',
      'Got me grounded for a month :('
    ]))
    .then(() => delay(10000))
    .then(() => talkToTheUser([
      'Oh wow...',
      'You\'re still here?!',
      'Good, keeping me company...',
      'Whanna hear a joke?',
      'P = NP',
      'Not funny?.. Okay gonna shut up now'
    ]));
}

UI.customalert = message => alert(message);

UI.setupIndexPage = () => {
  const appDiv = document.getElementById("app");
  const form = document.getElementById("form");
  const inputForManualSelect = document.getElementById("input-manualSelect");

  const fileLists = [];

  document.getElementById("dropzone").addEventListener("click", e => {
    e.preventDefault();
    inputForManualSelect.click();
  });

  inputForManualSelect.addEventListener("change", () => {
    registerNewFileList(inputForManualSelect.files);
  });

  document.addEventListener("dragover", e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";

    appDiv.classList.add("hovered");
  });

  document.addEventListener("dragleave", async e => {
    e.preventDefault();
    appDiv.classList.remove("hovered");
  });

  document.addEventListener("drop", async e => {
    e.preventDefault();
    appDiv.classList.remove("hovered");

    registerNewFileList(e.dataTransfer.files);
  });

  function registerNewFileList(fileList) {
    fileLists.push(fileList);

    const hasPdfFiles = Array.from(fileList).some(
      f => f.type === "application/pdf"
    );
    if (!hasPdfFiles) {
      UI.customalert('Why are you trying to hurt me?\nI can only handle PDF files.')
      return;
    }

    const input = document.createElement("input");
    input.name = "files";
    input.type = "file";
    input.multiple = true;
    input.files = fileList;

    form.appendChild(input);
    form.submit();
  }
};

UI.setupStatusPage = () => {
  const preDetails = document.getElementById("pre");
  const preHr = document.getElementById("hr-pre");
  const aDownloadXlsx = document.getElementById("a-download-xlsx");
  const aDownloadJson = document.getElementById("a-download-json");
  const aToggleDetails = document.getElementById("a-toggle-details");
  const divDownloads = document.getElementById("div-downloads");
  const spanProgress = document.getElementById("span-progress");

  const state = {
    done: false,
    detailsAreVisible: false
  };

  aToggleDetails.addEventListener("click", e => {
    e.preventDefault();

    state.detailsAreVisible = !state.detailsAreVisible;
    aToggleDetails.innerText = state.detailsAreVisible ? 'hide' : 'show';
    preDetails.style.display = state.detailsAreVisible ? 'block' : 'none';
    preHr.style.display = state.detailsAreVisible ? 'block' : 'none';
  });

  const updateInterval = setInterval(() => {
    fetch(location.href + "/json")
      .then(r => {
        if (!r.ok) {
          preDiv.innerText = "REPORT NO LONGER AVAILABLE";
          clearInterval(updateInterval);

          throw Error(r.statusText);
        }

        return r.json();
      })
      .then(json => {
        if (state.done) {
          return;
        }

        if (json.status.aggregate === "done") {
          clearTimeout(updateInterval);

          state.done = true;
          divDownloads.style.display = 'block';
          aDownloadJson.href = location.href + "/json";
          aDownloadXlsx.href = location.href + "/xlsx";
          aDownloadXlsx.click();
        }
        if (json.status.aggregate === "failed") {
          state.done = true;
          clearTimeout(updateInterval);
        }

        spanProgress.innerHTML = `Status: ${json.status.aggregate}`;
        preDetails.innerText = JSON.stringify(json, null, 2);
      })
      .catch(() => {});
  }, 100);
};

UI.init();