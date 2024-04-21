var myCharacteristic;
var deviceName;
let server;
const serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const txid="6e400002-b5a3-f393-e0a9-e50e24dcca9e"; 
const characteristicUuid = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

async function connect() {
  const device=await navigator.bluetooth.requestDevice({//filters: [{name:'Aria'}],
    acceptAllDevices:true,
  optionalServices: [serviceUuid]
});  
deviceName = device.name;
log("Connected to: " + deviceName);
server = await device.gatt.connect();
await bNotifications();
}    

async function bNotifications()
{
    const notificationservice=await server.getPrimaryService(serviceUuid);
    const txchar=await notificationservice.getCharacteristic(characteristicUuid);
    txchar.addEventListener('characteristicvaluechanged', handleNotifications); 
    txchar.startNotifications();
} 



function disconnect() {
    document.getElementById("input").value = "";
    document.getElementById("term").value = ""; 
}

function handleNotifications(event) {
  let value = event.target.value;
  console.log("obj:",value);
  var fulltext=new TextDecoder().decode(value);
//  if(fulltext==="\x1b[1;32m$aria:-\x1b[m")
//     {
//         fulltext="Aria>";
//     }
 const val=decodeAnsiColors(fulltext);
 
 log(val);
  console.log('> Received: ' ,val);
}

async function send() {
  var data = document.getElementById("input").value;
  log(data);
  const service = await server.getPrimaryService(serviceUuid);
  const characteristic = await service.getCharacteristic(txid);
  await characteristic.writeValue(str2ab(data+"\n"));
  document.getElementById("input").value = "";
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function log(str) {

    document.getElementById("term").value +="\n"+str;
}




function decodeAnsiColors(text) {
    // Define regular expressions for ANSI color codes
    const colorRegex = /\x1b\[(\d{1,2})(;(\d{1,2}))?m/g;
    const resetRegex = /\x1b\[0?m/g;

    // Replace ANSI color codes with equivalent CSS styles or remove them
    const decodedText = text.replace(colorRegex, (match, colorCode, _, intensityCode) => {
        // Map ANSI color codes to CSS color names or remove them
        switch (colorCode) {
            case '30': return 'black'; // Black
            case '31': return 'red'; // Red
            case '32': return 'green'; // Green
            case '33': return 'yellow'; // Yellow
            case '34': return 'blue'; // Blue
            case '35': return 'magenta'; // Magenta
            case '36': return 'cyan'; // Cyan
            case '37': return 'white'; // White
            default: return ''; // Invalid or unsupported color code
        }
    }).replace(resetRegex, ''); // Remove reset codes
    
    return decodedText;
}

const inputField = document.getElementById("input");
inputField.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    send(); // Call the send function when Enter key is pressed
  }
});

log("*Note: Please ensure that the experimental web features are ON");