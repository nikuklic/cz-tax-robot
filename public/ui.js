const UI = {};
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

UI.init = () => {
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
  const divBubble = document.querySelector('.div-disclaimer-bubble');
  const inputForManualSelect = document.getElementById("input-manualSelect");

  let drag = 0;

  document.getElementById("dropzone").addEventListener("click", e => {
    e.preventDefault();
    inputForManualSelect.click();
  });

  document.getElementById("a-selfhost").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("div-selfhost").classList.toggle('hidden');
  });

  inputForManualSelect.addEventListener("change", () => {
    registerNewFileList(inputForManualSelect.files);
  });

  document.addEventListener("dragenter", e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";

    ++drag;
    appDiv.classList.add("hovered");
  });

  document.addEventListener("dragleave", async e => {
    e.preventDefault();

    if (--drag === 0) {
      appDiv.classList.remove("hovered");
    }
  });

  document.addEventListener("dragover", e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });

  document.addEventListener("drop", async e => {
    e.preventDefault();
    appDiv.classList.remove("hovered");

    registerNewFileList(e.dataTransfer.files);
  });

  function registerNewFileList(fileList) {
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

    divBubble.classList.add('blue');
    divBubble.innerHTML = '<marquee>Uploading your documents..</marquee>';

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
  const yearWarning = document.getElementById("year-warning");
  const exchangeRateWarning = document.getElementById("exchange-rate-warning");
  const esppWarning = document.getElementById("espp-warning");
  const divYearSelection = document.getElementById("div-year-selection");
  const yearCheckboxes = document.getElementById("year-checkboxes");
  const btnGenerate = document.getElementById("btn-generate");
  const spanGenerating = document.getElementById("span-generating");

  let appExchangeRates = {};
  fetch('/api/config')
    .then(r => r.json())
    .then(c => { appExchangeRates = c.exchangeRates || {}; })
    .catch(() => { appExchangeRates = {}; });

  const state = {
    done: false,
    yearSelectionShown: false,
    detailsAreVisible: false
  };

  aToggleDetails.addEventListener("click", e => {
    e.preventDefault();

    state.detailsAreVisible = !state.detailsAreVisible;
    aToggleDetails.innerText = state.detailsAreVisible ? 'hide' : 'show';
    preDetails.style.display = state.detailsAreVisible ? 'block' : 'none';
    preHr.style.display = state.detailsAreVisible ? 'block' : 'none';
  });

  const downloadReport = () => {
    UI.customalert('Disclaimer: Tax Robot and all related services and information are provided on an "as is" and "as available" basis without any warranties of any kind.');
    aDownloadXlsx.click();
  };

  const currentYear = new Date().getFullYear();
  const previousYear = String(currentYear - 1);

  const showYearSelection = (foundYears) => {
    if (state.yearSelectionShown) return;
    state.yearSelectionShown = true;

    yearCheckboxes.innerHTML = '';
    const sortedYears = foundYears.slice().sort().reverse();

    sortedYears.forEach(year => {
      const rateInfo = appExchangeRates[year];
      let rateLabel = '';
      if (!rateInfo) {
        rateLabel = ' (no exchange rate configured)';
      } else if (rateInfo.usdCzk === 'unknown' || rateInfo.eurCzk === 'unknown') {
        rateLabel = ' (exchange rate unknown)';
      } else {
        rateLabel = ` (USD-CZK: ${rateInfo.usdCzk})`;
      }

      const div = document.createElement('div');
      div.style.margin = '5px 0';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = year;
      cb.id = 'year-' + year;
      // Pre-check the previous year
      if (year === previousYear) {
        cb.checked = true;
      }
      const label = document.createElement('label');
      label.htmlFor = 'year-' + year;
      label.style.marginLeft = '6px';
      label.textContent = year + rateLabel;

      if (!rateInfo || rateInfo.usdCzk === 'unknown') {
        label.style.color = '#cc6600';
      }

      div.appendChild(cb);
      div.appendChild(label);
      yearCheckboxes.appendChild(div);
    });

    divYearSelection.style.display = 'block';
  };

  const getSelectedYears = () => {
    const checkboxes = yearCheckboxes.querySelectorAll('input[type=checkbox]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  };

  btnGenerate.addEventListener('click', () => {
    const selectedYears = getSelectedYears();
    if (selectedYears.length === 0) {
      UI.customalert('Please select at least one year.');
      return;
    }

    btnGenerate.disabled = true;
    spanGenerating.style.display = 'inline';

    fetch(location.href + '/select-years', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedYears })
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to generate report');
        return r.json();
      })
      .then(result => {
        spanGenerating.style.display = 'none';
        divYearSelection.style.display = 'none';

        // Show year info
        const selectedStr = selectedYears.sort().join(', ');
        yearWarning.style.display = 'block';
        yearWarning.style.color = '#333';
        let yearInfo = 'Report generated for year(s): ' + selectedStr;
        if (result.hasEurEntries) {
          yearInfo += ' (includes Degiro EUR entries)';
        }
        yearWarning.innerHTML = yearInfo;

        // Show exchange rate warnings if any
        if (result.warnings && result.warnings.length > 0) {
          exchangeRateWarning.style.display = 'block';
          exchangeRateWarning.innerHTML = 'Warning: ' + result.warnings.join('<br>Warning: ');
        }

        // ESPP warning: expect 4 purchases per selected year
        const status = result.status;
        const expectedEspp = 4 * selectedYears.length;
        if (status.esppCount !== undefined && status.esppCount !== expectedEspp) {
          esppWarning.style.display = 'block';
          esppWarning.innerHTML = 'Warning: The number of ESPP purchases for the selected year(s) is ' + status.esppCount + ' (expected ' + expectedEspp + ' for ' + selectedYears.length + ' year(s)), make sure you uploaded the right statements';
        }

        state.done = true;
        divDownloads.style.display = 'block';
        aDownloadJson.href = location.href + "/json";
        aDownloadXlsx.href = location.href + "/xlsx";
        delay(100).then(downloadReport);
      })
      .catch(err => {
        spanGenerating.style.display = 'none';
        btnGenerate.disabled = false;
        UI.customalert('Error generating report: ' + err.message);
      });
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

        spanProgress.innerHTML = `Status: ${json.status.aggregate}`;
        preDetails.innerText = JSON.stringify(json, null, 2);

        if (json.status.aggregate === "done") {
          clearTimeout(updateInterval);

          if (json.status.excel === 'awaiting-year-selection') {
            // Show year selection UI
            if (json.status.foundYears && json.status.foundYears.length > 0) {
              showYearSelection(json.status.foundYears);
              let statusMsg = 'Status: Select years and click Generate Report';
              if (json.status.coi === 'done' && json.output && json.output.coi) {
                statusMsg += ' (COI detected: ' + (json.output.coi.employer || 'Unknown') + ')';
              }
              spanProgress.innerHTML = statusMsg;
            } else {
              spanProgress.innerHTML = 'Status: No entries found in the uploaded documents';
            }
          } else if (json.status.excel === 'done') {
            // Excel already generated (shouldn't happen in new flow, but handle it)
            state.done = true;
            divDownloads.style.display = 'block';
            aDownloadJson.href = location.href + "/json";
            aDownloadXlsx.href = location.href + "/xlsx";
            delay(100).then(downloadReport);
          }
        }

        if (json.status.aggregate === "failed") {
          state.done = true;
          clearTimeout(updateInterval);
        }
      })
      .catch(() => {});
  }, 100);
};

UI.init();
