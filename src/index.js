import TelegramBot from 'node-telegram-bot-api';
import {
    is_name_bank,
    is_country,
    is_country_code,
    is_currency,
    get_data_localbitcoins
} from './utils';
import DBService from './db';
import config from '../config/config';
import keyboards from './keyboards';
import {
    COMMAND_BANK,
    COMMAND_COUNTRY,
    COMMAND_RETURN,
    COMMAND_SETTINGS,
    COMMAND_CURRENCY,
    COMMAND_COUNTRY_CODE,
    COMMAND_THRESHOLD
} from './commands';


const bot = new TelegramBot(config.telegramToken, {polling: true});

const treshold = 1750000000

const bank_name = 'banesco'

const currency = 'VEF'

const country = 'venezuela'

const countrycode = 've'

const url = `https://localbitcoins.com/sell-bitcoins-online/${countrycode}/${country}/transfers-with-specific-bank/.json?`;

let pages = []

const DB = new DBService();

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(msg.chat.id, "Consultando Datos en Localbitcoins");

    get_data_localbitcoins(url, pages).then((res) => {

        let merge_pages = [].concat.apply([], res);

        DB.getCollection(config.collectionUsers).then((collection) => {
            let user = collection.findOne({"chat_id": {$aeq: msg.chat.id}});

            if (user) {

                const {bank_name, currency, threshold} = user;

                let filter_pages = merge_pages.filter((item) => {
                    return item.data.bank_name.toLowerCase().includes(user.bank_name)
                        && item.data.currency === user.currency
                        && Number(item.data.temp_price) >= Number(treshold)
                });

                if (filter_pages.length === 0) {
                    bot.sendMessage(msg.chat.id, "Lo sentimos no hemos encountrado ofertas");
                }

                filter_pages.forEach((value) => {
                    const keyboard = {
                        "inline_keyboard": [
                            [
                                {"text": "Ver en Localbitcoins", "url": value.actions.public_view},
                            ]
                        ]
                    };

                    const options = {
                        "reply_markup": JSON.stringify(keyboard),
                        "parse_mode": "HTML"
                    };

                    let message =
                        `<b>${value.data.bank_name}</b>\n<em>MININO: ${value.data.min_amount} ${value.data.currency}</em>\n<em>MAXIMO: ${value.data.max_amount} ${value.data.currency}</em>\n<em>Locacion: ${value.data.location_string}</em>\n<code>PRECIO: ${value.data.temp_price} ${value.data.currency} / BTC</code>`;

                    bot.smsg_lowerendMessage(msg.chat.id, message, options);
                });

            }
            else {
                bot.sendMessage(msg.chat.id, 'The parameters have not been selected', {
                    "reply_markup": {
                        "keyboard": keyboards.home
                    }
                });
            }
        });

    });
});


bot.on('message', (msg) => {

    const message = msg.text.toString().toLowerCase();

    if (message === COMMAND_BANK) {
        bot.sendMessage(msg.chat.id, "Choose an bank:", {
            "reply_markup": {
                "keyboard": keyboards.banks
            }
        });
    }

    if (message === COMMAND_RETURN) {
        bot.sendMessage(msg.chat.id, "Choose an option:", {
            "reply_markup": {
                "keyboard": keyboards.home
            }
        });
    }

    if (message === COMMAND_SETTINGS) {
        bot.sendMessage(msg.chat.id, "Choose an option:", {
            "reply_markup": {
                "keyboard": keyboards.settings
            }
        });
    }

    if (message === COMMAND_COUNTRY) {
        bot.sendMessage(msg.chat.id, "Choose an country:", {
            "reply_markup": {
                "keyboard": keyboards.country
            }
        });
    }

    if (message === COMMAND_COUNTRY_CODE) {
        bot.sendMessage(msg.chat.id, "Choose an country code:", {
            "reply_markup": {
                "keyboard": keyboards.country_codes
            }
        });
    }

    if (message === COMMAND_CURRENCY) {
        bot.sendMessage(msg.chat.id, "Choose an currency:", {
            "reply_markup": {
                "keyboard": keyboards.currencies
            }
        });
    }

    if (message === COMMAND_THRESHOLD) {
        bot.sendMessage(msg.chat.id, "Write threshold:");
    }


    if (is_name_bank(message)) {

        DB.getCollection(config.collectionUsers).then((collection) => {
            let user = collection.findOne({"chat_id": {$aeq: msg.chat.id}});

            if (user) {
                user.bank_name = message;
                DB.update(config.collectionUsers, user)
                    .then((col) => {
                        console.log("update", col);
                    });
            }
            else {
                DB.insert(config.collectionUsers, {
                    "chat_id": msg.chat.id,
                    "bank_name": message
                }).then((col) => {
                    console.log("insert", col);
                });
            }

            bot.sendMessage(msg.chat.id, `You have selected the bank: ${message.toUpperCase()}`, {
                "reply_markup": {
                    "keyboard": keyboards.home
                }
            });

        });
    }

    if (is_country_code(message)) {
    }

    if (is_country(message)) {
    }

    if (is_currency(message)) {
        DB.getCollection(config.collectionUsers).then((collection) => {
            let user = collection.findOne({"chat_id": {$aeq: msg.chat.id}});

            if (user) {
                user.currency = message;
                DB.update(config.collectionUsers, user)
                    .then((col) => {
                        console.log("update", col);
                    });
            }
            else {
                DB.insert(config.collectionUsers, {
                    "chat_id": msg.chat.id,
                    "currency": message
                }).then((col) => {
                    console.log("insert", col);
                });
            }

            bot.sendMessage(msg.chat.id, `You have selected the currency: ${message.toUpperCase()}`, {
                "reply_markup": {
                    "keyboard": keyboards.home
                }
            });

        });
    }
});

bot.on('polling_error', (error) => {
    console.log(error);
});


