var myChacteristic;
var heart_rate_measurements;
var battery_service;
var battery_level;
var device;
var server;
var deviceList=[];





function log(text)
	{
	var textarea = document.getElementById('text');
	textarea.value += "\n" + text;
	textarea.scrollTop = textarea.scrollHeight;
    }



   async function disconnect(){
        log("Peer has disconnected.");
        server = await device.gatt.disconnect();
        }
    
async function connect() {
  
  
    

    // Set BLE scan filters
    let options = {
        filters: [
          {services: ["heart_rate"]}
         
        ],
        optionalServices: ["heart_rate"]
      
      }
    // Try to connect to a BLE device
    try {
		
		device  = await navigator.bluetooth.requestDevice(options);
        device.addEventListener('gattserverdisconnected', disconnect());
    log('> Name:             ' + device.name +' (' + device.id + ')');
    deviceList.push(device);
    if (deviceList[-1].name!==device.name){
      device.name=deviceList[-1].name;
     }
     else{
      device=device;
     }
   
    
		
		// Connect to GATT Server 
		log('Connecting to GATT Server...');
		server = await device.gatt.connect();
		log('Ready to communicate.');
		
		// Get Heart Rate service 
 		const heart_service = await server.getPrimaryService("heart_rate");
		log('Getting Service...'+heart_service);
		
		// Get Heart Rate Measurement characteristic 
		heart_rate_measurements = await heart_service.getCharacteristic("heart_rate_measurement");
		log('Getting Characteristics...'+heart_rate_measurements);
		
		// Show Disconnect Button
	//	document.getElementById("disconnect_card").style.display = "inline";

		// Set a callback to receive and print Notifications
		myCharacteristic = heart_rate_measurements;
		myCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
		await myCharacteristic.startNotifications();
		log('> Notifications started');
	

	} catch(error) {

      log('Failed: ' + error);
  
    }
   
    

}









async function connectWithBattery(){
    let options = {
      //  filters: [
     //    { services: ["battery_service"] }
    //    ],
       acceptAllDevices: true,
        optionalServices: ["battery_service"]
      }
      try {
		
     device  = await navigator.bluetooth.requestDevice(options);
    deviceList.push(device);
    
    
    device.addEventListener('gattserverdisconnected', disconnect());
    log('> Name:             ' + device.name +' (' + device.id + ')');
   
    
		
		// Connect to GATT Server 
		log('Connecting to GATT Server...');
		server = await device.gatt.connect();
		log('Ready to communicate.');
		
		// Get  Battery service 
 		const battery_service = await server.getPrimaryService("battery_service");
		log('Getting Service...'+battery_service);
		
		// Get BATTERY Measurement characteristic 
	    battery_level= await battery_service.getCharacteristic("battery_level");
		log('Getting Characteristics...'+battery_level);
		

		// Set a callback to receive and print Notifications
    myCharacteristic = battery_level; 
    myCharacteristic.addEventListener('characteristicvaluechanged',handleBatteryLevelChanged );
    

   await myCharacteristic.startNotifications();

      //////////////////////////////////////////////////
  //    let queue = Promise.resolve();
	//	  queue = queue.then(_ => battery_service.getCharacteristics()
//		.then(characteristics => {
//				characteristics.forEach(characteristic => {
//					writeCharacteristic = characteristic;
	//				writeCharacteristic.startNotifications();
//					resolve();
	//		}); // End enumerating characteristics
	//	})); // End queue
	 // End enumerating services
 // End Service exploration  


/////////////////////////////////////////////////////////////////
      log('> Notifications started');
      
      console.log(deviceList);
   
    
  

} catch(error) {

      log('Failed: ' + error);
  
    }
   }

  

   function handleBatteryLevelChanged(event) {
      
      
     // if (deviceList[-1]!==device){
     //   device=deviceList[-1];
     //  }
  
   // deviceList.reduce(index => index.name != device.name);
     
    let batteryLevel = event.target.value.getUint8(0);
    log('> Battery Level is ' + batteryLevel + '%' + '' + ' by the device' +' '+device.name);

     
    
    
  
     

    }




     function handleNotifications(event) {
        let value = event.target.value;
        console.log(value);
      
        let values = [];
     

      
       for (let i = 0; i < value.byteLength; i++) {
      
          values.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
        
          
       
        }
        log('> ' + values.join(' '));
       

        
    }

//////// get devices and ids if there are more devices
async function getDeviceIds() {
  let options = {
    filters: [
      {services: ["heart_rate"]},
     
    ],
    optionalServices: ["heart_rate"],
    
  }
  log('Getting existing permitted Bluetooth devices...');
  
  try{
  device = await navigator.bluetooth.requestDevice(options);
  device.addEventListener('gattserverdisconnected', disconnect());
  
  log('> Got ' + ' Bluetooth devices.');

    for (let dev in device.length) {
      log('  > ' + dev.name + ' (' + dev.id + ')');
    }

    log('Connecting to GATT Server...');
		server = await device.gatt.connect();
		log('Ready to communicate.');
  }
  catch(error) {

    log('Failed: ' + error)

  }
  
}

       