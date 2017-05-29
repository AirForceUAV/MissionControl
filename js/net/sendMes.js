var forMc = require('./for_mc_pb.js');

var message = new messages.SendCommand();

proto.For_GCS.CommandCode = 1;
timestamp = getTimeStamp();


// Serializes to a UInt8Array.
bytes = message.serializeBinary();



function getTimeStamp(){

	var timestamp = new Date().getTime();

	return timestamp;
}
