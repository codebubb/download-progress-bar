const fileToDownload = 'bigfile.zip';

const downloadProgressElem = document.querySelector(
  '.download-progress-bar__progress'
);

const startDownloadElem = document.getElementById('startDownload');

startDownloadElem.addEventListener('click', () => {
  startDownloadElem.setAttribute('disabled', 'true');
  const dataChunks = [];
  fetch(`/${fileToDownload}`)
    .then(response => {
      const reader = response.body.getReader();
      let totalDownloaded = 0;
      const totalSize = Number(
        response.headers.get('content-length')
      );

      function readData() {
        return reader.read().then(result => {
          if (result.value) {
            dataChunks.push(result.value);
            totalDownloaded += result.value.length;
            const percentage = Math.floor(
              (totalDownloaded / totalSize) * 100
            );
            console.log(
              `${totalDownloaded}/${totalSize} (${percentage}%)`
            );

            downloadProgressElem.textContent = `${percentage}%`;
            downloadProgressElem.style.width = `${percentage}%`;
          }

          if (!result.done) {
            return readData();
          }
        });
      }

      return readData();
    })
    .then(() => {
      createAndTriggerDownloadLink(
        new Blob(dataChunks),
        fileToDownload
      );
    })
    .catch(error => {
      downloadProgressElem.classList.add('error');
      downloadProgressElem.textContent = 'Download Error';
      downloadProgressElem.style.width = '100%';
    })
    .finally(() => {
      startDownloadElem.removeAttribute('disabled');
    });
});

function createAndTriggerDownloadLink(blob, fileName) {
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = URL.createObjectURL(blob);
  downloadAnchor.download = fileName;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}
