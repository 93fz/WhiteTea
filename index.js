console.clear();
console.log(`> WhiteTea has started!`);
console.log(`   > WARNING: recent errors cause WhiteTea to be unstable in long games.`);
console.log(`   > Enjoy the tool! Built by https://github.com/VillainsRule\n`);

import { Client } from 'discord.js-selfbot-v13';
import config from './config.js';
import words from './words.js';

let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let client = new Client({
    checkUpdate: false
});

if ((config.selfStart == config.alreadySent) && config.selfStart) {
    console.log(`> The config appears to have an issue.`);
    console.log(`   > Please make an issue on the Github for support.`);

    process.exit(0);
}

client.on('ready', async () => {
    console.log(`> Connected to @${client.user.username}!\n`);

    let channel = client.channels.cache.get(config.channelId);
    let bleedPrefix = config.bleedPrefix;

    client.on('messageCreate', async (msg) => {
        if (msg.author.id !== '432610292342587392') return;
        if (msg.channelId !== config.channelId) return;

        if (config.selfStart && msg.content?.includes('Another command is in activity, type $exitgame to stop it.')) {
            console.log(`> There is already an ongoing game. Quitting...`);
            process.exit(0);
        };

        if (msg.embeds?.[0]?.title === 'The Black Teaword will start!') {
            msg.react('✅');
            console.log(`> Reacted to new BlackTea message.`);
            return;
        };

        if (msg.mentions.members.size && (msg.mentions.members.first()?.id === client.user.id) && msg.content.search('Type a word containing:') > -1) {
            await sleep(rndInt(config.delays.msgSend.min, config.delays.msgSend.max));

            (async function sendWord() {
                let pickFrom = words.filter(a => a.search(msg.content.split('**')[1].toLowerCase()) > -1);
                let word = pickFrom[rndInt(0, (pickFrom.length - 1))];
                let sentMsg = await msg.channel.send(word)

                let collector = sentMsg.createReactionCollector({
                    filter: (reaction, user) => reaction.emoji.name === '✅' && user.id === '432610292342587392',
                    time: 5000
                });

                collector.on('collect', (reaction, user) => {
                    words.splice(words.indexOf(sentMsg.content), 1);
                    console.log(`> Prompt: ${msg.content.split('**')[1].toLowerCase()} | Sent: ${word}`);
                });

                collector.on('end', async (collected) => {
                    if (collected.size > 0) return;
                    console.log(`> Prompt: ${msg.content.split('**')[1].toLowerCase()} | word was not in db, skipping to new...`);
                    await sendWord();
                });
            })();
        };
    });

    if (config.selfStart) {
        channel.send(`${bleedPrefix}blacktea`);
        await sleep(rndInt(config.delays.msgSend.min, config.delays.msgSend.max));
        channel.send(`${bleedPrefix}hp ${config.hp}`);
        await sleep(rndInt(config.delays.msgSend.min, config.delays.msgSend.max));
        channel.send(`${bleedPrefix}time ${config.time}`);
        console.log(`> Sent the Self-Start mode messages.`);
    };

    if (config.alreadySent) {
        channel.messages.fetch({
            limit: 100
        }).then((messages) => {
            let byBleed = messages.filter(a => a.author.id === '432610292342587392');
            let isBlackteaStart = byBleed.filter(a => a.embeds[0]?.title).filter(a => a.embeds[0].title === 'The Black Teaword will start!');
            isBlackteaStart.first().react('✅');
            console.log(`> Reacted to new BlackTea message.`);
        });
    };
})

client.login(config.token).catch(err => {
    console.log(`> Critical Error: ${err.message} | Quitting process...\n`);
    process.exit(0);
});
