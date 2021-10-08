export class BLE {

    #send = null;
    #read = null;
    #sended = true;
    #deviceId = 0x180d;
    #characteristicId = 0x2a37;
    #characteristic = null;
    #disconnect = null;
    device = null;

    connect = async () => {
        return new Promise((resolve, reject) => {
            navigator.bluetooth
                .requestDevice({
                    optionalServices: [this.#deviceId],
                    acceptAllDevices: true,
                })
                .then((device) => {
                    this.#disconnect = () => device.gatt.disconnect();
                    this.device = device;
                    return device.gatt.connect();
                })
                .then((server) => server.getPrimaryService(this.#deviceId))
                .then((service) => service.getCharacteristic(this.#characteristicId))
                .then((characteristic) => {

                    let timer = null;

                    this.#send = (str) => {
                        if (this.#sended) {
                            this.#sended = false;
                            let buf;

                            if (typeof str === 'string') {
                                buf = new ArrayBuffer(str.length);
                                const bufView = new Uint8Array(buf);

                                for (let i = 0, strLen = str.length; i < strLen; i++) {
                                    bufView[i] = str.charCodeAt(i);
                                }

                                if (timer) {
                                    clearTimeout(timer);
                                    timer = null;
                                }
                            } else {
                                buf = str;
                            }

                            timer = setTimeout(() => {
                                characteristic
                                    .writeValue(buf)
                                    .then(() => (this.#sended = true));

                            }, 100);

                        }
                    };


                    this.#characteristic = characteristic;
                    this.#read = () => Promise.resolve(characteristic.value);
                    resolve(true);
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

    send = (data) => {
        if (this.#send) {
            this.#send(data);
        }
    }

    read = () => {
        return this.#read().then((val) => {
            const enc = new TextDecoder();
            const res = enc.decode(new Uint8Array(val.buffer));
            return res;
        });
    }

    disconnect = () => {
        this.#disconnect();
        this.device = null;
    }

    listen = (callback) => {
        this.#characteristic.startNotifications();
        this.#characteristic.addEventListener(
            'characteristicvaluechanged',
            () => {
                this.read().then(callback);
            }
        );
    }
}