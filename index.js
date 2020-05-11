const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const data = require('wine-pairing/src/data.json')
const Telegraf = require('telegraf')
const { Markup } = Telegraf

const bot = new Composer()

const TelegrafInlineMenu = require('telegraf-inline-menu')
const Keyboard = require('telegraf-keyboard');

bot.use(session())

const ingredients = data.ingredients.filter(ingredient => ingredient.id != null).map(a => a.label)

const menu = new TelegrafInlineMenu(ctx => `Hey ${ctx.from.first_name}!`)
menu.setCommand('start')

menu.select('I am excited!', ingredients, {
    setPage: (ctx, page) => {
        ctx.session.page = page
    },
    getCurrentPage: ctx => ctx.session.page,
    columns: 2,
    maxRows: 5
})
menu.pagination('page', {
    setPage: (ctx, page) => {
      ctx.session.page = page
    },
    getTotalPages: ctx => ctx.session.totalPages,
    getCurrentPage: ctx => ctx.session.page
})

bot.use(menu.init())

module.exports = bot