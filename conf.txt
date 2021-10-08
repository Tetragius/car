E.on('init', function() {
  Serial2.setConsole();
  var lcd = require("HD44780").connect(NodeMCU.D5, NodeMCU.D6, NodeMCU.D2, NodeMCU.D7, NodeMCU.D1, NodeMCU.D0);

  Serial1.setup(115200);
  Serial1.on('data', function (data) {
    lcd.setCursor(0, 1);
    lcd.print(data);
  });

  Serial1.print('AT+NAME?');

  lcd.print("Serial");
});

//

E.on('init', function() {
  // Serial2.setConsole();
  var s = require("servo").connect(NodeMCU.D5);
  s.move(0.9);
 
  var ss = new Serial();
  ss.setup(9600,{rx: NodeMCU.D7, tx: NodeMCU.D8});
  
  // Serial1.setup(115200);
  ss.on('data', function (data) {
    var pos = parseFloat(data);
    console.log(pos, data);
    if(!isNaN(pos)) s.move(pos); 
  });
});
///

E.on('init', function() {
  console.log('init complete');

  pinMode(B4, "output");
  B4.reset();
  var s = require("servo").connect(B4, { range: 2 });
  s.move(0.5);
  
  pinMode(B5, "output");
  B5.reset();
  analogWrite(B5, 0);

  Serial1.setup(9600);
  var cmd = "";
  Serial1.on('data', function (data) {
    cmd += data;
    var idx = cmd.indexOf("\r");
    while (idx >= 0) {
      var line = cmd.substr(0, idx);
      cmd = cmd.substr(idx + 1);
      if(line.startsWith('a')) {
        analogWrite(B5, line.substr(1) - 0);
        continue;
      }
      if(!isNaN(line - 0)) s.move(line - 0, 200);
      idx = cmd.indexOf("\r");
    }
  });

});

///

E.on('init', function() {
  console.log('init complete');

  pinMode(NodeMCU.D1, "output");
  NodeMCU.D1.reset();
  var s = require("servo").connect(NodeMCU.D1, { range: 2 });
  s.move(0.5);

  pinMode(NodeMCU.D2, "output");
  NodeMCU.D2.reset();
  analogWrite(NodeMCU.D2, 0);

  var sr = new Serial();

  sr.setup(9600, { tx:NodeMCU.D5, rx:NodeMCU.D6 });
  
  var cmd = "";
  sr.on('data', function (data) {
    cmd += data;
    var idx = cmd.indexOf("\r");
    console.log(cmd);
    while (idx >= 0) {
      var line = cmd.substr(0, idx);
      cmd = cmd.substr(idx + 1);
      if(line.startsWith('a')) {
        analogWrite(NodeMCU.D2, line.substr(1) - 0);
        continue;
      }
      if(!isNaN(line - 0)) s.move(line - 0, 200);
      idx = cmd.indexOf("\r");
    }
  });

});