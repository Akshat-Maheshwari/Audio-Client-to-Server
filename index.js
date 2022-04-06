const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
// const { Deepgram } = require("@deepgram/sdk");
const FileReader = require('filereader');
const { File } = require('file-api');

// const API_KEY=null; /// enter the deepgram API key;
// const deepgram = new Deepgram(API_KEY);
// const deepgramLive = deepgram.transcription.live({ utterances: true, punctuate:true });

app.use(express.static("public"));
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html");
});

io.on("connection",(socket)=>{

    const fileStream = fs.createWriteStream('test.webm', {flags: 'a'});
    console.log("user connected");

    socket.on("audioBlob", (chunk)=>{
      // deepgramLive.send(chunk);
      const reader = new FileReader();
            reader.addEventListener('load', () => {
                const dataUrl = reader.result;
                const base64EncodedData = dataUrl.split(',')[1];
                const body = JSON.stringify(base64EncodedData);
                const data = body;
                const dataBuffer = Buffer.from(data, 'base64')
                fileStream.write(dataBuffer);
            });
            reader.readAsDataURL(new File({ 
              name: "audiochunk",   // required
              buffer: chunk
            })
            );
   })

    // let transcript = ''
    // deepgramLive.addListener('transcriptReceived', (data) => {
    //   const result = JSON.parse(data)
    //   const utterance = result.channel.alternatives[0].transcript
    //   if (result.is_final && utterance) {
    //     transcript += ' ' + utterance
    //     console.log(transcript)
    //   }
    // })
    

    socket.on("stop",()=>{
      setTimeout(() => {
        fileStream.close();
        ffmpeg('test.webm')
        .output('final.webm')
        .run()
       })
      }, 5000);
      
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
      
})

server.listen(3000,()=>{
    console.log('listening on port 3000');
})
