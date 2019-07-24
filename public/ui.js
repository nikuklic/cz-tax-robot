const UI = {};

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
  const preDiv = document.getElementById("pre");
  const aDownload = document.getElementById("a-download");
  const spanProgress = document.getElementById("span-progress");

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

          aDownload.href = location.href + "/xlsx";
          aDownload.click();
        }
        if (json.status.aggregate === "failed") {
          clearTimeout(updateInterval);
        }

        spanProgress.innerHTML = `Status: ${json.status.aggregate}`;
        preDiv.innerText = JSON.stringify(json, null, 2);
      })
      .catch(() => {});
  }, 500);
};
