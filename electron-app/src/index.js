import {app, BrowserWindow} from 'electron';
import serve from 'electron-serve';

const loadURL = serve({directory: 'dist'});

let mainWindow;

(async () => {
	await app.whenReady();

	mainWindow = new BrowserWindow();

	await loadURL(mainWindow);

	// Or optionally with search parameters.
	await loadURL(mainWindow, {id: 4, foo: 'bar'});

	// The above is equivalent to this:
	await mainWindow.loadURL('app://-');
	// The `-` is just the required hostname
})();
