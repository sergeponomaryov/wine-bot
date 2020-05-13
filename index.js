require('dotenv').config()
const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const data = require('wine-pairing/src/data.json')
const logic = require('wine-pairing/src/logic.js')
const Telegraf = require('telegraf')
const { Markup } = Telegraf

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Schema = mongoose.Schema;
const userSchema = new Schema({chatId: Number, name: String, username: String, language: String, lastUsed: Number});
const User = mongoose.model("User", userSchema);

const main = data.ingredients.filter(ingredient => ingredient.type == "main")
const secondary = data.ingredients.filter(ingredient => ingredient.type == "secondary")
const prep = data.ingredients.filter(ingredient => ingredient.type == "prep")
const spice = data.ingredients.filter(ingredient => ingredient.type == "spice")

let keyboards = {1: createKeyboard(main), 2: createKeyboard(secondary), 3: createKeyboard(prep), 4: createKeyboard(spice)};

function createKeyboard(ingredients) {
    let buttons = ingredients.map(x => Markup.callbackButton(x.label))
    buttons.push("⏪ Back")
    return Markup.keyboard(buttons).oneTime().resize().extra()
}

const stepTexts = {
    1: 'Hi! What are you eating? 😋\nI will find the right food and wine pairing for you 🍷',
    2: 'What are you having it with? 🤔',
    3: 'How is it prepared? 👨‍🍳',
    4: 'Any spices? 🌶'
}

function logUser(ctx) {
    User.findOneAndUpdate({chatId: ctx.from.id}, {
        name: ctx.from.first_name + " " + ctx.from.last_name,
        username: ctx.from.username,
        language: ctx.from.language_code,
        lastUsed: Math.floor(Date.now() / 1000)
    }, {new: true, upsert: true}, function(err, data) {
        if (err) return console.error(err);
        else return true;
    });
}

bot.start((ctx) => {
    logUser(ctx);
    ctx.session.step = 1;
    ctx.session.selections = [];
    return ctx.reply(stepTexts[ctx.session.step], keyboards[ctx.session.step])
})
.command('start', (ctx) => {
    logUser(ctx);
    ctx.session.step = 1;
    ctx.session.selections = [];
    return ctx.reply(stepTexts[ctx.session.step], keyboards[ctx.session.step])
})
.command('help', (ctx) => {
    return ctx.replyWithMarkdown("Wine goes with food. The right pairing will bring out the best in both of them. The wrong one, and you won't taste either. It's not magic, it's chemistry. It has to do with acids and fats, sugars and spices, alcohols and tannins. But you don't have to know all that. I will help you. 😌\nThe way it works is you pick what you're eating, i.e. main dish, side, how it's prepared and spices, and it picks the best wine type match (e.g. Bold Reds, with examples of grapes) based on all of these, with the main ingredient having the most weight of course. It also shows which wine types matched with which ingredients. 🍷\n\nJust try it: /start\n\nI'm also available as a [website](https://wine.lisik.dev) and as an [Android app](https://play.google.com/store/apps/details?id=com.lisik.winepairing).\nIcon made by Freepik from www.flaticon.com\nTo contact the developer: @sergeponomaryov", {"disable_web_page_preview": true})
})
.command('back', (ctx) => {
    return back(ctx);
})
.hears('⏪ Back', (ctx) => {
    return back(ctx);
})
.on('text', (ctx) => {
    let obj = data.ingredients.find(x => x.label == ctx.message.text)
    if(obj && obj.hasOwnProperty("id")) {
        ctx.session.selections[ctx.session.step - 1] = obj.id; // zero based
        ctx.session.step++;
        if(ctx.session.step < 5) {
            // show next selection
            //let debug = JSON.stringify(ctx.session.selections)
            return ctx.reply(stepTexts[ctx.session.step], keyboards[ctx.session.step])
        }
        else {
            // show results
            ctx.session.selections = ctx.session.selections.filter(x => x); // remove null values
            let results = logic.rankWineTypes(ctx.session.selections);
            let resp = 'Try these wines 🍷';
            results.forEach(result => {
                resp += `\n\n*${result.name}* _like ${result.examples.join(', ')}_\n`;
                resp += `*${result.match}%* match`;
                if(result.perfectMatches.length) resp += `\n_Perfect with ${result.perfectMatches.join(' and ')}_`;
            });
            resp += '\n\nWas this useful? Share me with your friends, or /start over 👍'
            return ctx.replyWithMarkdown(resp, Markup.removeKeyboard().extra())
        }
    }
    else {
        return ctx.reply('Please select an option from the keyboard, or try from the /start 🙃')
    }
})

function back(ctx) {
    ctx.session.step--;
    ctx.session.selections[ctx.session.step - 1] = null; // zero based
    return ctx.reply(stepTexts[ctx.session.step], keyboards[ctx.session.step])
}

bot.launch()