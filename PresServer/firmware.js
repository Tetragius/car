const wifi = require("Wifi");
const lcd = require("SSD1306");

const ssid = "TetraHome";
const option = { password: "6bdae4a5206" };
const rootPath = 'static';

const mimeTypes = {
    js: 'application/javascript',
    html: 'text/html',
    css: 'text/css',
    ico: 'image/vnd.microsoft.icon'
};

I2C1.setup({ scl: D27, sda: D25 });
const g = lcd.connect(I2C1, () => { }, { rst: D26 });
const lines = [];

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

const pageHandler = (req, res) => {
    let file = null;
    const url = req.url;
    print(url);
    try {
        if (url === '/') {
            file = E.openFile(`${rootPath}/index.html`, 'r');
        }
        else {
            file = E.openFile(`${rootPath}/${url}`, 'r');
        }
        const ext = req.url.split('.').pop();
        res.writeHead(200, { 'Content-Type': mimeTypes[ext.length - 1] || 'text/html' });
        file.pipe(res);
    }
    catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404 - ${url} Not Found`);
    }

};

function onInit() {
    E.connectSDCard(SPI1, D16);
    // E.unmountSD();

    wifi.connect(ssid, option, (err) => {
        const address = wifi.getIP(() => {
            const srv = require('http').createServer(pageHandler);
            srv.listen(80);
        });
        print(address.ip);
    });
    wifi.stopAP();

}