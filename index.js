const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const data = require('wine-pairing/src/data.json')
const logic = require('wine-pairing/src/logic.js')
const Telegraf = require('telegraf')
const { Markup } = Telegraf

const bot = new Composer()
bot.use(session())

const main = data.ingredients.filter(ingredient => ingredient.type == "main")
const secondary = data.ingredients.filter(ingredient => ingredient.type == "secondary")
const prep = data.ingredients.filter(ingredient => ingredient.type == "prep")
const spice = data.ingredients.filter(ingredient => ingredient.type == "spice")

let keyboards = {1: createKeyboard(main), 2: createKeyboard(secondary), 3: createKeyboard(prep), 4: createKeyboard(spice)};

function createKeyboard(ingredients) {
    let buttons = ingredients.map(x => Markup.callbackButton(x.label))
    return Markup.keyboard(buttons).oneTime().resize().extra()
}

const stepTexts = {
    1: 'Hi! What are you eating? 😋\nI will find the right food and wine pairing for you 🍷',
    2: 'What are you having it with? 🤔',
    3: 'How is it prepared? 👨‍🍳',
    4: 'Any spices? 🌶'
}

bot.start((ctx) => {
    ctx.session.step = 1;
    ctx.session.selections = [];
    return ctx.reply(stepTexts[ctx.session.step], keyboards[ctx.session.step])
})
.command('start', (ctx) => {
    ctx.session.step = 1;
    return ctx.reply(stepTexts[ctx.session.step], keyboards[ctx.session.step])
})
.hears(/.+/, (ctx) => {
    let obj = data.ingredients.find(x => x.label == ctx.match[0])
    if(obj.hasOwnProperty("id")) {
        ctx.session.selections.push(obj.id)
        ctx.session.step++;
        if(ctx.session.step < 5) {
            // show next selection
            // JSON.stringify(ctx.session.selections)
            return ctx.reply(stepTexts[ctx.session.step], keyboards[ctx.session.step])
        }
        else {
            // show results
            ctx.session.selections = ctx.session.selections.filter(x => x); // remove null values
            let results = logic.rankWineTypes(ctx.session.selections);
            let resp = 'Try these wines 🍷\n\n';
            results.forEach(result => {
                resp += `*${result.name}* _like ${result.examples.join(', ')}_\n`;
                resp += `*${result.match}%* match\n`;
                if(result.perfectMatches.length) resp += `_Perfect with ${result.perfectMatches.join(' and ')}_\n\n`;
            });
            ctx.replyWithMarkdown(resp)
            return ctx.reply('Was this useful? Share me with your friends 👍', Markup.keyboard(['/start']).oneTime().resize().extra())
        }
    }
    else {
        return ctx.reply('Please select one from the keyboard', keyboards[ctx.session.step])
    }
})

module.exports = bot