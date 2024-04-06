export default {
    hp: '5', // between 1 and 21, if you're starting
    time: '42', // between 3 and 50, if you're starting
    channelId: '', // channel ID to play in
    token: '', // token to use
    selfStart: true, // if you should start the game (singleplayer), set to false to play publicly
    alreadySent: false, // set to true if the 'black teaword will start' embed has already been sent
    bleedPrefix: ',',
    delays: { // delays
        msgSend: {
            min: 500, // minimum time in ms
            max: 2000 // max time in ms
        }
    }
}
