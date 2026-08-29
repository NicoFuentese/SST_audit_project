const { app } = require('electron');
app.whenReady().then(() => {
  console.log('Chromium:', process.versions.chrome);
  console.log('Electron:', process.versions.electron);
  app.quit();
});