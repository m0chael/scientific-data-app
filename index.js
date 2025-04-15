// Import required modules
const { app, BrowserWindow, dialog, Menu, shell} = require('electron');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const {
  validateFileSize, 
  readPreliminaryFileType,
  validateFileExtension,
  validatePreliminaryMimeAndExtensions
} = require("./system/file-helpers.js");

const {returnAndReadCsv, returnAndReadEarthquakeGeoJson} = require('./system/file-compatibility-helpers.js');
const {sendErrorRes, showAlert} = require('./system/dialog-helpers.js');

const ENABLE_PRODUCTION_MENU_BAR = true;

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      { label: 'Exit', role: 'quit' }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      { label: 'Open external homepage', click: () => { sendToActualBrowser(); } },
      { type: 'separator' },
      { label: 'Switch night mode', click: () => { toggleNightDayModeFromBack(); } },
      { type: 'separator' },
      { label: 'Set new folder', click: () => { callInternallySetFolder(); } },
      { type: 'separator' },
      { label: 'Reset app', click: () => { showConfirmResetDialog(); } },
    ]
  },
];




// Create Express app
const serverApp = express();
const upload = multer();

// Define your data and mappings
let SOME_DATA_MAPPING = null;

// Define the route for handling POST requests
serverApp.post('/getitem', upload.none(), (req, res) => {
  const someEntryIncoming = req.body;
  
  if (someEntryIncoming) {
    const matchedEntry = SOME_DATA_MAPPING.find(function (entry) {
      let isThisAMatch = entry['path'] == someEntryIncoming.incoming;
      return isThisAMatch;
    });

    if (matchedEntry) {
      let filePath = path.join(someEntryIncoming.incoming);
      let thisFileExtension = path.extname(filePath);

      if (validateFileExtension(thisFileExtension)){

        let thisFilePreliminary = readPreliminaryFileType(filePath);
        if (thisFilePreliminary[0]) {

          let thisResultingMatchMime = validatePreliminaryMimeAndExtensions(thisFilePreliminary[1], thisFileExtension);
          if (thisResultingMatchMime[0]) {
            if (validateFileSize(filePath)) {
              if (thisResultingMatchMime[1] == ".csv") {
                returnAndReadCsv(res, filePath);
              } else if (thisResultingMatchMime[1] == ".geojson") {
                returnAndReadEarthquakeGeoJson(res, filePath);
              } else {
                return sendErrorRes(res, "Invalid compatibility type.");
              }
            } else {
              return sendErrorRes(res, "Invalid file size.");
            }
          } else {
            return sendErrorRes(res, "There was likely a file extension mismatch.");
          }
        } else {
          return sendErrorRes(res, "Unsupported file mime type.");
        }
      } else {
        return sendErrorRes(res, "Invalid file extension.");
      }
    } else {
      return sendErrorRes(res, "Invalid mapping item.");
    }
  } else {
    return sendErrorRes(res, "Failed to parse incoming entry.");
  }
});


function superParsingFolderStructureAndSave(incomingDirectory, callback) {

  function readDirectoryRecursively(dir) {
    const files = fs.readdirSync(dir);
    const result = [];

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively read subdirectory
        result.push(...readDirectoryRecursively(filePath));
      } else {
        // Read file content and add to the result array
        const fileExtension = path.extname(filePath);
        if (file == ".DS_Store") {}
        else if (fileExtension == ".json" || fileExtension == ".csv" || fileExtension == ".geojson") {
          result.push({
            item: file,
            path: filePath,
            type: fileExtension,
          });
        }
      }
    });

    return result;
  };

  const filesArray = readDirectoryRecursively(incomingDirectory);
  const jsonContent = JSON.stringify({"folder":incomingDirectory, "array": filesArray});
  const userDataPath = app.getPath('userData');
  const filePath = path.join(userDataPath, 'data.json');

  fs.writeFileSync(filePath, jsonContent);
  callback();
};

serverApp.get('/getlibrary', (req, res) => {
  const userDataPath = app.getPath('userData');
  const filePath = path.join(userDataPath, 'data.json');

  let isExisting = fs.existsSync(filePath);
  if (isExisting) {
    try {
      const contentOfFile = fs.readFileSync(filePath, 'utf8');
      SOME_DATA_MAPPING = JSON.parse(contentOfFile);
      let someFolder = SOME_DATA_MAPPING["folder"];
      SOME_DATA_MAPPING = SOME_DATA_MAPPING["array"];


      superParsingFolderStructureAndSave(someFolder, function(){
        const contentOfFileSynced = fs.readFileSync(filePath, 'utf8');
        SOME_DATA_MAPPING = JSON.parse(contentOfFileSynced);
        SOME_DATA_MAPPING = SOME_DATA_MAPPING["array"];
        res.json({"success": true, "data": contentOfFileSynced});
      });

    } catch(err) {
      res.json({"success": false, "message": "An error occured while getting this library. Please try setting a new folder."});
    }
  } else {
    res.json({"success":false});
  }
});

async function selectThisFolder(callback) {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then((result) => {
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedFolder = result.filePaths[0];

      superParsingFolderStructureAndSave(selectedFolder, function(){
        callback({ "success": true, "folder": selectedFolder, "message": "Folder was selected, now parsing."});
      });
    }
  }).catch((err) => {
    callback({ "success": false, "data": err, "message": "Folder was not selected properly."});
  });
};

serverApp.post('/setfolder', upload.none(), (req, res) => {
  selectThisFolder(function(resultingFromSelectCallback){
    res.json(resultingFromSelectCallback);
  });
});

function callInternallySetFolder() {
  selectThisFolder(function(){
    refreshFrontend();
  });;
};


const server = serverApp.listen(3000, () => {});


// Electron specific window loaders
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 720,
    minWidth: 1000,
    minHeight: 720,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile('clientside/index.html');

  mainWindow.once('ready-to-show', () => {
    // Handle window drag functionality
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    mainWindow.on('mousedown', (event) => {
      isDragging = true;
      console.log("dragging");
      const { screenX, screenY } = event;
      const { x, y } = mainWindow.getPosition();
      offset.x = screenX - x;
      offset.y = screenY - y;
    });

    mainWindow.on('mousemove', (event) => {
      if (isDragging) {
        const { screenX, screenY } = event;
        mainWindow.setPosition(screenX - offset.x, screenY - offset.y);
      }
    });

    mainWindow.on('mouseup', () => {
      isDragging = false;
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    server.close();
  });
}

app.on('ready', () => {
  if (ENABLE_PRODUCTION_MENU_BAR) {
    const appMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(appMenu);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

function refreshFrontend() {
  if (mainWindow) {
    mainWindow.reload();
  }
};

function toggleNightDayModeFromBack() {
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(`toggleNightDayClient();`)
      .catch((error) => {
        showAlert("Failed to set night or day styles.")
      });
    }
};


function sendToActualBrowser() {
  const options = {
    type: 'question',
    buttons: ['Cancel', 'Visit External Homepage'],
    defaultId: 1,
    title: 'Confirmation',
    message: 'This will open the homepage on Github in your browser.',
    detail: 'Thank you for checking the app and',
    icon: path.join(__dirname, 'earth_transparent.png')
  };


  dialog.showMessageBox(null, options).then((response) => {
    const buttonIndex = response.response;
    if (buttonIndex === 1) {
      shell.openExternal("https://github.com/m0chael/scientific-data-app");
    } else {
      // Do nothing upon cancel
    }
  });
};

// Example usage inside a function
function showConfirmResetDialog() {
  const options = {
    type: 'question',
    buttons: ['Cancel', 'Reset everything'],
    defaultId: 1,
    title: 'Confirmation',
    modal:true,
    message: 'Are you sure you want to reset the App Settings to the beginning?',
    detail: 'This will reset all settings back to the beginning.',
    icon: path.join(__dirname, 'earth_transparent.png')
  };

  function clearLocalStorage(){
    // Get the current focused browser window
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      // Execute JavaScript code in the renderer process
      focusedWindow.webContents.executeJavaScript('localStorage.clear();');
    }
  };


  dialog.showMessageBox(null, options).then((response) => {
    const buttonIndex = response.response;
    if (buttonIndex === 1) {
      // User selected reset everything
      const userDataPath = app.getPath('userData');
      const filePath = path.join(userDataPath, 'data.json');
      fs.unlink(filePath, (err) => {
        if (err) {
          //console.error('Error deleting file:', err);
          clearLocalStorage();
          showAlert("Only some settings were reset. There was an error removing the mapping file. If this issue persists, please check your Application Data folder.");
          refreshFrontend();
          return;
        }
        //console.log('File deleted successfully');
        clearLocalStorage();
        refreshFrontend();
      });
    } else {
      // User clicked 'Cancel' or closed the dialog
    }
  });
};