const btnConnect = document.getElementById('btn');
const dataBlock = document.getElementById('data');

const normalizeThumbstick = (input, deadZone = 0) => {
    const rel = (input - 128) / 128
    if (Math.abs(rel) <= deadZone) return 0
    return Math.min(1, Math.max(-1, rel))
}

const normalizeTrigger = (input, deadZone = 0) => {
    return Math.min(1, Math.max(deadZone, input / 255))
}

btnConnect.onclick = async () => {
    const devices = await navigator.hid.requestDevice({
        filters: [
            // Sony Controllers
            { vendorId: 0x054C, productId: 0x0BA0 },
            { vendorId: 0x054C, productId: 0x05C4 },
            { vendorId: 0x054C, productId: 0x09CC },
            { vendorId: 0x054C, productId: 0x05C5 },
        ]
    });

    const controller = devices[0];
    await controller.open();

    controller.oninputreport = (e) => {
        const report = e.data;
        console.log(e.data);
        const data = {};
        // Джойстики
        data['leftStickX'] = normalizeThumbstick(report.getUint8(0));
        data['leftStickY'] = normalizeThumbstick(report.getUint8(1));
        data['rightStickX'] = normalizeThumbstick(report.getUint8(2));
        data['rightStickY'] = normalizeThumbstick(report.getUint8(3));
        // Кнопки с пиктограммами
        const mainButtons = report.getUint8(4);
        data['triangle'] = !!(mainButtons & 0x80);
        data['circle'] = !!(mainButtons & 0x40);
        data['cross'] = !!(mainButtons & 0x20);
        data['square'] = !!(mainButtons & 0x10);
        // Кеопки со стрелками
        const dPad = mainButtons & 0x0F;
        data['dPadUp'] = dPad === 7 || dPad === 0 || dPad === 1;
        data['dPadRight'] = dPad === 1 || dPad === 2 || dPad === 3;
        data['dPadDown'] = dPad === 3 || dPad === 4 || dPad === 5;
        data['dPadLeft'] = dPad === 5 || dPad === 6 || dPad === 7;
        // Остальные кнопки
        const otherButtons = report.getUint8(5);
        data['l1'] = !!(otherButtons & 0x01);
        data['r1'] = !!(otherButtons & 0x02);
        data['l2'] = !!(otherButtons & 0x04);
        data['r2'] = !!(otherButtons & 0x08);
        data['share'] = !!(otherButtons & 0x10);
        data['options'] = !!(otherButtons & 0x20);
        data['l3'] = !!(otherButtons & 0x40);
        data['r3'] = !!(otherButtons & 0x80);
        const options = report.getUint8(6);
        data['playStation'] = !!(options & 0x01);
        data['touchPadClick'] = !!(options & 0x02);
        // Боковые триггеры
        data['L2'] = normalizeTrigger(report.getUint8(7))
        data['R2'] = normalizeTrigger(report.getUint8(8))
        // Гироскоп и акселерометр
        data['gyroX'] = report.getUint16(13);
        data['gyroY'] = report.getUint16(15);
        data['gyroZ'] = report.getUint16(17);
        data['accelX'] = report.getInt16(19);
        data['accelY'] = report.getInt16(21);
        data['accelZ'] = report.getInt16(23);
        // Тачпад
        data['touches'] = [];
        if (!(report.getUint8(34) & 0x80)) {
            data.touches.push({
                touchId: report.getUint8(34) & 0x7F,
                x: (report.getUint8(36) & 0x0F) << 8 | report.getUint8(35),
                y: report.getUint8(37) << 4 | (report.getUint8(36) & 0xF0) >> 4
            })
        }
        if (!(report.getUint8(38) & 0x80)) {
            data.touches.push({
                touchId: report.getUint8(38) & 0x7F,
                x: (report.getUint8(40) & 0x0F) << 8 | report.getUint8(39),
                y: report.getUint8(41) << 4 | (report.getUint8(40) & 0xF0) >> 4
            })
        }
        dataBlock.innerText = JSON.stringify(data, null, 4);
    }

    let flag = true;
    const set = () => {
        const report = new Uint8Array(16);
        report[0] = 0x05;                // Report ID
        report[1] = 0xF0 | 0x01 | 0x02;  // Enable Rumble (0x01), Lightbar (0x02)
        report[4] = 0x00;                // Light rumble motor
        report[5] = 0x00;                // Heavy rumble motor
        report[6] = flag ? 0x00 : 0XFF;  // Lightbar Red
        report[7] = 0x00;                // Lightbar Green
        report[8] = !flag ? 0x00 : 0XFF; // Lightbar Blue
        flag = !flag;
        controller.sendReport(report[0], report.slice(1));
    }
    setInterval(set, 500);
};
