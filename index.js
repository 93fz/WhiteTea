let bot = require('discord.js-selfbot-v13');
let config = require('./config.js');
let words = require('./words.js');

let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let client = new bot.Client({
    checkUpdate: false
})

client.on('ready', async () => {
    console.log(`☕ | Connected to @${client.user.username}!`);
    
    let channel = client.channels.cache.get(config.channelId);
    let mudaePrefix = config.mudaePrefix;

    client.on('messageCreate', async (msg) => {
        if (msg.author.id !== '432610292342587392') return;
        if (msg.channelId !== config.channelId) return;

        if (msg.embeds?.[0]?.title === 'The Black Teaword will start!') {
            msg.react('✅');
            console.log(`☕ | Reacted to new BlackTea message.`);
            return;
        };

        if (msg.mentions.members.size && (msg.mentions.members.first()?.id === client.user.id) && msg.content.search('Type a word containing:') > -1) {
            await sleep(rndInt(config.delays.msgSend.min, config.delays.msgSend.max));

            (async function sendWord() {
                let pickFrom = words.filter(a => a.search(msg.content.split('**')[1].toLowerCase()) > -1);
		let word = pickFrom[rndInt(0, (pickFrom.length-1))];
                let sentMsg = await msg.channel.send(word)

                let filter = (reaction, user) => reaction.emoji.name === '✅' && user.id !== '432610292342587392';
                let collector = sentMsg.createReactionCollector(filter, { time: 3000 });

                collector.on('collect', (reaction, user) => {
                  words.splice(words.indexOf(sentMsg.content), 1);
                  console.log(`☕ | Prompt: ${msg.content.split('**')[1].toLowerCase()} | Sent: ${word}`)
                });
                    
                collector.on('end', async (collected) => {
                    if (collected.size < 1) await sendWord();
                });
            })();
        };
    });

    if (config.selfStart) {
        channel.send(`${mudaePrefix}blacktea`);
        await sleep(rndInt(config.delays.msgSend.min, config.delays.msgSend.max));
        channel.send(`${mudaePrefix}hp ${config.hp}`);
        await sleep(rndInt(config.delays.msgSend.min, config.delays.msgSend.max));
        channel.send(`${mudaePrefix}time ${config.time}`);
    };

    if (!config.alreadySent) {
        channel.messages.fetch({
	    limit: 100
	}).then((messages) => {
            let byMudae = messages.filter(a => a.author.id === '432610292342587392');
            let isBlackteaStart = byMudae.filter(a => a.embeds[0]?.title).filter(a => a.embeds[0].title === 'The Black Teaword will start!');
            isBlackteaStart.first().react('✅');
            console.log(`☕ | Reacted to new BlackTea message.`);
        });
    };
})

client.login(config.token);
