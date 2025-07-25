import { BrowserWindow, shell } from 'electron'
import path from 'path'
import icon from '../../../resources/icon.png?asset'
import { is } from '@electron-toolkit/utils'

export default class MainWindow {
  static win: Electron.BrowserWindow | null = null
  constructor() {
    if (!MainWindow.win || MainWindow.win.isDestroyed()) {
      // Create the browser window.
      MainWindow.win = new BrowserWindow({
        width: 1000,
        height: 800,
        minHeight: 800,
        minWidth: 1000,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
          preload: path.join(__dirname, '../preload/index.js'),
          sandbox: false
        }
      })

      MainWindow.win.on('ready-to-show', () => {
        MainWindow.win?.show()
      })

      MainWindow.win.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
      })

      // HMR for renderer base on electron-vite cli.
      // Load the remote URL for development or the local html file for production.
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        MainWindow.win.loadURL(process.env['ELECTRON_RENDERER_URL'])
      } else {
        MainWindow.win.loadFile(path.join(__dirname, '../renderer/index.html'))
      }
    }
  }
}
