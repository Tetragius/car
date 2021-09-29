var ServoHW = function (pin, options) {
  this._pin = pin;
  this._freq = 50;
  this._pulseMin = 0.675;
  this._pulseMax = 2.325;
  this._valueMin = 0;
  this._valueMax = 180;

  if (options && options.freq) {
    this._freq = options.freq;
  }
  if (options && options.pulseMin) {
    this._pulseMin = options.pulseMin;
  }
  if (options && options.pulseMax) {
    this._pulseMax = options.pulseMax;
  }
  if (options && options.valueMin) {
    this._valueMin = options.valueMin;
  }
  if (options && options.valueMax) {
    this._valueMax = options.valueMax;
  }

  this._period = 1000 / this._freq;
  this._valueStart = this._pulseMin / this._period;
  var pulsDiff = this._pulseMax - this._pulseMin;
  this._valueStep = pulsDiff / (this._valueMax - this._valueMin) / this._period;
};

ServoHW.prototype.write = function (value, units) {
  if (value === false) {
    digitalWrite(this._pin, 0);
    return this;
  }

  switch (units) {
    case 'us':
      value = E.clip(value, this._pulseMin * 1000, this._pulseMax * 1000);
      analogWrite(this._pin, value / 1000 / this._period, { freq: this._freq });
      break;
    case 'ms':
      value = E.clip(value, this._pulseMin, this._pulseMax);
      analogWrite(this._pin, value / this._period, { freq: this._freq });
      break;
    default:
      value = E.clip(value, this._valueMin, this._valueMax);
      analogWrite(
        this._pin,
        this._valueStart + this._valueStep * (value - this._valueMin),
        {
          freq: this._freq
        }
      );
  }

  return this;
};

var C = {
  MAX_DISTANCE: 4,
  SOUND_SPEED: 340
};

C.MAX_ROUNDTRIP_MS = (1000 * C.MAX_DISTANCE * 2) / C.SOUND_SPEED;

function convertUnits(s, units) {
  if (units === undefined) {
    return s;
  }

  switch (units) {
    case 'm':
      return (s / 2) * C.SOUND_SPEED;
    case 'cm':
      return (s / 2) * C.SOUND_SPEED * 100;
    case 'mm':
      return (s / 2) * C.SOUND_SPEED * 1000;
    case 's':
      return s;
    case 'ms':
      return s * 1000;
    case 'us':
      return s * 1000000;
  }
}

// Class Ultrasonic 
var Ultrasonic = function (pins) {
  this._trigPin = pins.trigPin;
  this._echoPin = pins.echoPin;

  this._startTime = null;
  this._riseWatchID = null;
  this._fallWatchID = null;
  this._timeoutID = null;

  this._trigPin.mode('output');
  this._echoPin.mode('input');
};

Ultrasonic.prototype.ping = function (cb, units) {
  var self = this;

  if (self._timeoutID) {
    cb(new Error('busy'));
    return this;
  }

  this._riseWatchID = setWatch(
    function (e) {
      self._riseWatchID = null;
      // Roundtrip is measured between the moment 
      // when echo line is set high and the moment 
      // when it is returned to low state 
      self._startTime = e.time;
      self._fallWatchID = setWatch(
        function (e) {
          self._fallWatchID = null;
          clearTimeout(self._timeoutID); // cancel error handling 
          self._timeoutID = null;
          var roundtripTime = e.time - self._startTime;
          self._startTime = null;
          cb(null, convertUnits(roundtripTime, units));
        },
        self._echoPin,
        { edge: 'falling' }
      );
    },
    self._echoPin,
    { edge: 'rising' }
  );

  // Timeout for the cases when we're not getting echo back 
  self._timeoutID = setTimeout(function () {
    self._timeoutID = null;
    if (self._riseWatchID) {
      // Sensor not even rised echo line 
      clearWatch(self._riseWatchID);
      self._riseWatchID = null;
      cb(new Error('wrong connection'));
    } else {
      // Measure started, but we've got 
      // no echo within maximum roundtrip time frame 
      self._startTime = null;
      clearWatch(self._fallWatchID);
      self._fallWatchID = null;
      cb(new Error('timeout'));
    }
  }, C.MAX_ROUNDTRIP_MS);

  digitalPulse(self._trigPin, 1, 0.01);

  return this;
};

/* program */

E.on('init', function () {

  const servo = new ServoHW(D33);

  servo.write(90);

  pinMode(D2, "output"); D2.reset(); analogWrite(D2, 0);
  pinMode(D5, "output"); D5.reset(); analogWrite(D5, 0);

  Serial2.setup(115200, { tx: D4, rx: D15 });

  const US = new Ultrasonic({ trigPin: D12, echoPin: D14 });

  setInterval(function () {
    US.ping(function (err, value) {
      if (!err) {
        Serial2.print(value);
      }
    }, 'mm');
  }, 200);

  Serial2.on('data', function (data) {
    const a = parseInt(data.charCodeAt(0) * 0.71);
    const v = (data.charCodeAt(1) * 0.008) - 1;

    if (v > 0) { analogWrite(D2, v); analogWrite(D5, 0); }
    if (v === 0) { analogWrite(D2, 0); analogWrite(D5, 0); }
    if (v < 0) { analogWrite(D2, 0); analogWrite(D5, -1 * v); }

    servo.write(a);
  });

});