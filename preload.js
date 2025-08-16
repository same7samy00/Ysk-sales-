// This file is used to expose safe APIs to the renderer process.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Add APIs here if needed
});
