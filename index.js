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
        // rewrite this india a bit
        let add = [`${ingredients[i].label}:${ingredients[i].id}`];
        if(ingredients[i+1] !== undefined) add.push(`${ingredients[i+1].label}:${ingredients[i+1].id}`);

        keyboard.add(add)
        i++;
    }
    return keyboard;
}

let selection = [];
let step = 1;

bot.start((ctx) => {
    ctx.reply('Simple Keyboard', keyboards[step].draw())
})
.on('callback_query', (ctx) => {
    step++;
    selection.push(ctx.callbackQuery.data)
    // change existing keyboard instead!
    ctx.reply('Simple Keyboard', keyboards[step].draw())
})

module.exports = bot