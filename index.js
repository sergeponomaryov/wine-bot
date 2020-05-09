const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const data = require('wine-pairing/src/data.json')

const bot = new Composer()

const TelegrafInlineMenu = require('telegraf-inline-menu')
const Keyboard = require('telegraf-keyboard');

bot.use(session())

const main = data.ingredients.filter(ingredient => ingredient.type == "main")
const secondary = data.ingredients.filter(ingredient => ingredient.type == "secondary")
const prep = data.ingredients.filter(ingredient => ingredient.type == "prep")
const spice = data.ingredients.filter(ingredient => ingredient.type == "spice")

let keyboards = {1: createKeyboard(main), 2: createKeyboard(secondary), 3: createKeyboard(prep), 4: createKeyboard(spice)};

function createKeyboard(ingredients) {
    let keyboard = new Keyboard({inline: true});
    for (i = 0; i < ingredients.length; i++) {
        keyboard.add(`${ingredients[i].label}:${ingredients[i].id}`, `${ingredients[i+1].label}:${ingredients[i+1].id}`)
        i++;
    }
    return keyboard;
}

let selection = [];
//let keyboard = createKeyboard(main);

bot.start((ctx) => {
    ctx.reply('Simple Keyboard', keyboards[1].draw())
})
.hears('Main menu', ctx => {
    const keyboard = new Keyboard()
    keyboard.add('Back')
    ctx.reply('Main menu', keyboard.draw())
})
.hears('Back', (ctx) => {
    ctx.reply('Simple Keyboard', mainMenuKeyboard.draw())
})
.hears(['Help', '42'], (ctx) => {
    mainMenuKeyboard.rename('Help', '42')
    ctx.reply('Answer to the Ultimate Question of Life, the Universe, and Everything', mainMenuKeyboard.draw())
})
.hears(['india', 'bruh'], (ctx) => {
    ctx.reply('motheryucker doooont')
})
.hears('Inline Menu', (ctx) => {
    const keyboard = new Keyboard({
        inline: true,
        newline: true,
    })
    keyboard.add('Line 1:hello', 'Line 2:my', 'Line 3:friend')
    ctx.reply('Inline Keyboard', keyboard.draw())
})
.on('hello', (ctx) => {
    ctx.reply('motherclucker')
})
.on('callback_query', (ctx) => {
    selection.push(ctx.callbackQuery.data)
    ctx.reply(JSON.stringify(selection))
})

//bot.start(({ reply }) => reply('Welcome message'))
bot.help(({ reply }) => reply('bruh message'))
bot.settings(({ reply }) => reply('Bot settings'))

bot.command('date', ({ reply }) => reply(`Server time: ${Date()}`))

module.exports = bot