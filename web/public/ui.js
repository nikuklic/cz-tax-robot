const UI = {};

UI.setupIndexPage = () => {    
    const appDiv = document.getElementById("app");
    const form = document.getElementById("form");

    const fileLists = [];

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

        const hasPdfFiles = Array.from(fileList).some(f => f.type === 'application/pdf');
        if (!hasPdfFiles) {
            return;
        }
    
        const input = document.createElement('input');
        input.name = 'files';
        input.type = 'file';
        input.multiple = true;
        input.files = fileList;

        form.appendChild(input);
    }
}

UI.setupStatusPage = () => {
    const preDiv = document.getElementById("pre");

    const updateInterval = setInterval(() => {
        fetch(location.href + '/json')
            .then(r => {
                if (!r.ok) {
                    preDiv.innerText = 'REPORT NO LONGER AVAILABLE';
                    clearInterval(updateInterval);

                    throw Error(r.statusText);
                }

                return r.json();
            })
            .then(json => {
                if (json.status.aggregate === 'done') {
                    clearTimeout(updateInterval);
                }

                preDiv.innerText = JSON.stringify(json, null, 2);
            })
            .catch(() => {

            }); 
    }, 100);
}