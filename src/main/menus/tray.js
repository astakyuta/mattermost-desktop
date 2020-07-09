// Copyright (c) 2015-2016 Yuya Ochiai
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
'use strict';

import {app, Menu} from 'electron';

function createTemplate(mainWindow, config, isDev) {
  const settingsURL = isDev ? 'http://localhost:8080/browser/settings.html' : `file://${app.getAppPath()}/browser/settings.html`;
  const teams = config.teams;
  const template = [
    // ...teams.slice(0, 9).map((team, i) => {
    //   return {
    //     label: team.name,
    //     click: () => {
    //       showOrRestore(mainWindow);
    //       mainWindow.webContents.send('switch-tab', i);
    //
    //       if (process.platform === 'darwin') {
    //         app.dock.show();
    //         mainWindow.focus();
    //       }
    //     },
    //   };
    // }), {
    //   type: 'separator',
    // }, {
    // {
    //   label: process.platform === 'darwin' ? 'Preferences...' : 'Settings',
    //   click: () => {
    //     mainWindow.loadURL(settingsURL);
    //     showOrRestore(mainWindow);
    //
    //     if (process.platform === 'darwin') {
    //       app.dock.show();
    //       mainWindow.focus();
    //     }
    //   },
    // }, {
    //   type: 'separator',
    // }, {
    {
      label: 'Reload [For Test Only]',
      accelerator: 'Shift+CmdOrCtrl+R',
      click(item, focusedWindow) {

        mainWindow.webContents.session.clearCache(() => {
          //Restart after cache clear
          mainWindow.reload();
        });

        if (focusedWindow) {
          if (focusedWindow === mainWindow) {
            mainWindow.webContents.send('clear-cache-and-reload-tab');
          } else {
            focusedWindow.webContents.session.clearCache(() => {
              focusedWindow.reload();
            });
          }
        }

      },
    }, {
      type: 'separator',
    }, {
      label: 'Logout',
      accelerator: 'Shift+CmdOrCtrl+L',
      click(item, focusedWindow) {
        // mainWindow.webContents.session.clearStorageData();
        // mainWindow.reload();
        mainWindow.webContents.session.clearStorageData();
        mainWindow.reload();

        // if (focusedWindow) {
        //   if (focusedWindow === mainWindow) {
        //     mainWindow.webContents.send('clear-cache-and-reload-tab');
        //   } else {
        //     focusedWindow.webContents.session.clearCache(() => {
        //       focusedWindow.reset();
        //     });
        //   }
        // }
      },
    }, {
      type: 'separator',
    },{
      role: 'quit',
    },
  ];
  return template;
}

function createMenu(mainWindow, config, isDev) {
  return Menu.buildFromTemplate(createTemplate(mainWindow, config, isDev));
}

function showOrRestore(window) {
  if (window.isMinimized()) {
    window.restore();
  } else {
    window.show();
  }
}

export default {
  createMenu,
};
