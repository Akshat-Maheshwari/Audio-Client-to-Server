var socket = io();

const stopBtn = document.querySelector(".stop");

function handleSuccess(stream){
    const options = {mimeType: 'audio/webm'};
    const mediaRecorder = new MediaRecorder(stream,options);
    mediaRecorder.addEventListener('dataavailable', function(e){
        if(e.data.size >0){
            socket.emit("audioBlob",e.data);
        }
    })

    stopBtn.addEventListener('click',function(){
        mediaRecorder.stop()
        socket.emit('stop');
    })
    mediaRecorder.start(250);
}

navigator.mediaDevices.getUserMedia({audio:true, video:false}).then(handleSuccess)
