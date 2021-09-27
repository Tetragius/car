var makeCRCTable = function () {
	var c;
	var crcTable = [];
	for (var n = 0; n < 256; n++) {
		c = n;
		for (var k = 0; k < 8; k++) {
			c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
		}
		crcTable[n] = c;
	}
	return crcTable;
}

var crc32 = function (str) {
	var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
	var crc = 0 ^ (-1);

	for (var i = 0; i < str.length; i++) {
		crc = (crc >>> 8) ^ crcTable[(crc ^ str[i]) & 0xFF];
	}

	return (crc ^ (-1)) >>> 0;
};

class BL {
	constructor() {
		this._send = null;
		this._sended = true;
		this.deviceId = 0x180d;
		console.log(this.deviceId);
		this.characteristicId = 0x2a37;
		this.characteristic = null;

		navigator.bluetooth
			.requestDevice({
				optionalServices: [this.deviceId],
				acceptAllDevices: true,
			})
			.then((device) => {
				console.log(1, device.name);
				return device.gatt.connect();
			})
			.then((server) => {
				console.log(2, server)
				return server.getPrimaryService(this.deviceId);
			})
			.then((service) => {
				console.log(3);
				return service.getCharacteristic(this.characteristicId);
			})
			.then((characteristic) => {
				let timer = null;
				this._send = (str) => {
					if (this._sended) {
						this._sended = false;
						var buf = new ArrayBuffer(str.length);
						var bufView = new Uint8Array(buf);
						for (var i = 0, strLen = str.length; i < strLen; i++) {
							bufView[i] = str.charCodeAt(i);
						}
						if (timer) {
							clearTimeout(timer);
							timer = null;
						}
						timer = setTimeout(() => {
							console.log(str, buf);
							characteristic
								.writeValue(buf)
								.then(() => (this._sended = true));

						}, 100);

					}
				};

				this.characteristic = characteristic;
				characteristic.startNotifications();
				this._read = () => Promise.resolve(characteristic.value);
			})
			.catch((error) => {
				alert(error);
			});
	}

	send(data) {
		if (this._send) {
			this._send(data);
		}
	}

	read() {
		return this._read().then((val) => {
			const enc = new TextDecoder();
			const res = enc.decode(new Uint8Array(val.buffer));
			return res;
		});
	}

	listen(callback) {
		this.characteristic.addEventListener(
			'characteristicvaluechanged',
			() => {
				this.read().then(callback);
			}
		);
	}
}

window.onload = () => {
	const ctrl = document.getElementById('ctrl');

	let BLI;


	const btnConnect = document.createElement('button');
	btnConnect.textContent = 'connect';
	btnConnect.onclick = () => {
		BLI = new BL();
	};
	ctrl.appendChild(btnConnect);

	const btn_0 = document.createElement('button');
	btn_0.textContent = 'read';
	btn_0.onclick = () => BLI.read().then(console.log);
	ctrl.appendChild(btn_0);

	const btn_1 = document.createElement('button');
	btn_1.textContent = 'listen';
	btn_1.onclick = () =>
		BLI.listen((value) => {
			//const b = document.getElementById('sp');
			//b.style.minHeight = `${parseInt(value)}px`;
			console.log(value);
		});
	ctrl.appendChild(btn_1);

	const rng = document.createElement('input');
	rng.type = 'range';
	rng.min = 0;
	rng.max = 180;
	rng.step = 5;
	rng.value = 90;
	
	;
	rng.oninput = (e) => BLI.send(e.target.value + '\r');
	ctrl.appendChild(rng);

	const a = document.createElement('input');
	a.type = 'range';
	a.min = 0;
	a.max = 1.00;
	a.step = 0.01;
	a.value = 0;
	a.oninput = (e) => BLI.send('a' + e.target.value + '\r');
	ctrl.appendChild(a);
};
