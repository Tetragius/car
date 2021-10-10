const wifi = require("Wifi");
const lcd = require("SSD1306");
const http = require('ws');

const ssid = "TetraHome";

const option = { password: "6bdae4a5206" };
const rootPath = 'static';

const mimeTypes = {
    js: 'application/javascript',
    html: 'text/html',
    css: 'text/css',
    ico: 'image/vnd.microsoft.icon',

    pdf: 'application/pdf',
    json: 'application/json',
    jsonp: 'application/json',
    pdfp: 'application/pdf',
    png: 'image/png',
    bcmap: 'application/pdf',
};

I2C1.setup({ scl: D27, sda: D25 });
const g = lcd.connect(I2C1, () => { }, { rst: D26 });
const lines = [];
const clients = [];

const print = (str) => {
    g.clear();
    lines.push(str);
    if (lines.length > 8) {
        lines.shift();
    }
    lines.forEach((line, idx) => {
        g.drawString(line, 2, idx * 8);
    });
    g.flip();
};

const wsHandler = (ws) => {
    clients.push(ws);
    ws.on('close', evt => {
        console.log('close');
        var x = clients.indexOf(ws);
        if (x > -1) {
            clients.splice(x, 1);
        }
    });
};

const pageHandler = (req, res) => {
    let file = null;
    const url = req.url;
    print(url);
    try {
        if (url === '/') {
            file = E.openFile(`${rootPath}/index.html`, 'r');
        }
        else {
            file = E.openFile(`${rootPath}/${url}.gz`, 'r');
        }
        const ext = req.url.split('.').pop();
        res.writeHead(200, {
            'Content-Type': mimeTypes[ext.length - 1] || 'text/html',
            'Content-Encoding': 'gzip',
            'Vary': 'Accept-Encoding',
            'Cache-Control': 'public, max-age=31536000'
        });
        file.pipe(res, { chunkSize: 1024 });
    }
    catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404');
    }

};

function onInit() {
    E.connectSDCard(SPI1, D16);
    // E.unmountSD();

    wifi.connect(ssid, option, (err) => {
        const address = wifi.getIP(() => {
            const srv = http.createServer(pageHandler);
            srv.on('websocket', wsHandler);
            srv.listen(80);
        });
        print(address.ip);
    });
    wifi.stopAP();

    setInterval(() => {
        const enter = analogRead(D34);
        const num = digitalRead(D35);
        clients.forEach(cl => cl.send(JSON.stringify({ enter: enter, num: num })));
    }, 1000);
}