const UI = {};

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
    form.submit();
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
      UI.customalert('Is this a joke to you?! Gimme your PDFs.')
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
        if (json.status.aggregate === "done") {
          clearTimeout(updateInterval);

          divDownloads.style.display = 'block';
          aDownloadJson.href = location.href + "/json";
          aDownloadXlsx.href = location.href + "/xlsx";
          aDownloadXlsx.click();
        }
        if (json.status.aggregate === "failed") {
          clearTimeout(updateInterval);
        }

        spanProgress.innerHTML = `Status: ${json.status.aggregate}`;
        preDetails.innerText = JSON.stringify(json, null, 2);
      })
      .catch(() => {});
  }, 200);
};
