const { app, BrowserWindow, Menu, globalShortcut} = require('electron');
const httpServer = require('http');

let PlaneList = []

function addPlane(callsign, dep, arr) {
    for(let i in PlaneList) {
        if (PlaneList[i].callsign == callsign && PlaneList[i].dep == dep && PlaneList[i].arr == arr) {
            return;
        }
    }
    PlaneList.push({
        callsign: callsign,
        dep: dep,
        arr: arr
    })
}

const createWindow = () => {
    Menu.setApplicationMenu(null)
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
    });
    win.loadFile('index.html');
    const service = httpServer.createServer()
    service.on('request', (req, res) => {
        if(req.url.startsWith('/rep')) {
            if (req.url.split('?').length == 2) {
                const list = req.url.split('?')[1]
                const data = list.split('_');
                addPlane(data[0], data[1], data[2]);
                res.end('OK');
            }
        } else if (req.url.startsWith('/req')) {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(PlaneList)); 
        } else if (req.url.startsWith('/del')) {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            PlaneList = [];
            res.end(JSON.stringify(PlaneList)); 
        }
    });
    service.listen(9901);
}

function registryShortcut() {
    globalShortcut.register('CommandOrControl+A+B', () => {
        // 获取当前窗口
        BrowserWindow.getFocusedWindow()?.webContents.openDevTools();
    });
}

app.whenReady().then(() => {
    createWindow();
    registryShortcut();
})

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
