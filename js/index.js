import './containers/app.js';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(reg => {
            if (reg.installing) {
                console.log('installing');
            } else if (reg.waiting) {
                console.log('installed');
            } else if (reg.active) {
                console.log('active');
            }
        }).catch(error => {
            console.log(error);
        });
}