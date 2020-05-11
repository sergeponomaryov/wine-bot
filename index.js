const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const data = require('wine-pairing/src/data.json')
const Telegraf = require('telegraf')
const { Markup } = Telegraf

const bot = new Composer()

const TelegrafInlineMenu = require('telegraf-inline-menu')
const Keyboard = require('telegraf-keyboard');

bot.use(session())

// const main = data.ingredients.filter(ingredient => ingredient.type == "main")
// const secondary = data.ingredients.filter(ingredient => ingredient.type == "secondary")
// const prep = data.ingredients.filter(ingredient => ingredient.type == "prep")
// const spice = data.ingredients.filter(ingredient => ingredient.type == "spice")

let buttons = [];
for (i = 0; i < main.length; i++) {
    buttons.push([Markup.callbackButton(main[i].label, (main[i].id !== null) ? main[i].id : "skip")])
}

const inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttons).oneTime().resize().extra()

let selection = [];
let step = 1;

bot.start((ctx) => {
    ctx.telegram.sendMessage(
        ctx.from.id,
        'Like?',
        inlineMessageRatingKeyboard)
})

module.exports = bot