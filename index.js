const express = require('express');
const app = express();
const musicFolder = "/home/pi/Music";

let musicNotPlayed = [];
let musicPlayed = [];
let musicPlayerChild;
let isPlaying = false;

app.get('/', (req, res) => res.send(`Ready to play ${musicNotPlayed.length + musicPlayed.length} songs. Currently playing: ${isPlaying}`));
app.get('/play', (req, res) => {playMusic(); res.send('ok')});
app.get('/stop', (req, res) => {stopMusic(); res.send('ok')});
app.get('/pauseplay', (req, res) => {pauseOrPlaySong(); res.send('ok')});
app.get('/next', (req, res) => {nextSong(); res.send('ok')});

readSongs();
app.listen(3000, () => console.log('Raspberry pi music player listening on port 3000!'));

function readSongs(){
    let spawn = require('child_process').spawn;
    let child = spawn("ls", [musicFolder, "-1"]);

    child.stdout.on('data', function (buffer) { 
        let array = buffer.toString().split('\n');
        for(const prop in array){
            if(array[prop].trim()){
                musicNotPlayed.push(array[prop].trim());
            }
        }
    });
}

function playMusic(){
    if(isPlaying){
        pauseOrPlaySong();
    }else{
        beginSong();
    }
}

function pauseOrPlaySong(){
    musicPlayerChild.stdin.write("p");
}

function stopMusic(){
    isPlaying = false;
    musicPlayerChild.stdin.write("q");
}

function nextSong(){
    musicPlayerChild.stdin.write("q");
}

function beginSong(){
    if(musicNotPlayed.length === 0){
        musicNotPlayed = musicPlayed;
        musicPlayed = [];
    }
    let songIndex = getRandomInt(musicNotPlayed.length);
    let song = musicNotPlayed.splice(songIndex, 1);
    console.log(`index: ${songIndex} , song: ${song}`);
    musicPlayed.push(song);

    var spawn = require('child_process').spawn;
    musicPlayerChild = spawn("omxplayer", ["-o", "alsa", musicFolder + '/' + song]);
    isPlaying = true;

    musicPlayerChild.stdout.on('data', function (buffer) { console.log(buffer.toString()) });
    musicPlayerChild.stdout.on('end', function() { 
        if(isPlaying){
            beginSong();
        }
    });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}