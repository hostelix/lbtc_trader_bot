import TelegramBot from 'node-telegram-bot-api';
import {
    is_name_bank,
    is_country,
    is_country_code,
    is_currency,
    get_data_localbitcoins,
    is_command
} from './utils';
import config from '../config/config';
import keyboards from './keyboards';
import {
    ALL_COMMANDS,
    COMMAND_BANK,
    COMMAND_COUNTRY,
    COMMAND_RETURN,
    COMMAND_SETTINGS,
    COMMAND_CURRENCY,
    COMMAND_COUNTRY_CODE,
    COMMAND_THRESHOLD
} from './commands';

import DBservice from './db';

const db = new DBservice().getDB();

const bot = new TelegramBot(config.telegramToken, {polling: true});

const checkFieldsUser = (bot, chat_id, user) => {

    const fields = [
        {key: 'threshold', label: 'Threshold'},
        {key: 'bank_name', label: 'Bank Name'},
        {key: 'currency', label: 'Currency'},
        {key: 'country', label: 'Country'},
        {key: 'country_code', label: 'Country Code'}
    ];

    let invalid_fields = fields.filter((field) => {
        if (!user.hasOwnProperty(field.key)) {
            return field;
        }
    });

    if (invalid_fields.length > 0) {
        let mesg = '*The following parameters do not have an assigned value:*\n\n';

        invalid_fields.forEach((field) => {
            mesg += '`🚫 ' + field.label + '\n`';
        });
        bot.sendMessage(chat_id, mesg, {"parse_mode": "Markdown"});
    }
    return invalid_fields.length === 0;
};

const processSearch = (bot, message, user) => {

    bot.sendMessage(message.chat.id, "Consultando Datos en Localbitcoins");

    let pages = [];
    const url = `https://localbitcoins.com/sell-bitcoins-online/${user.country_code}/${user.country}/transfers-with-specific-bank/.json?`;

    get_data_localbitcoins(url, pages).then((res) => {
        let merge_pages = [].concat.apply([], res);

        let filter_pages = merge_pages.filter((item) => {
            return item.data.bank_name.toLowerCase().includes(user.bank_name)
                && item.data.currency === user.currency
                && Number(item.data.temp_price) >= Number(user.threshold)
        });

        if (filter_pages.length === 0) {
            bot.sendMessage(message.chat.id, "Lo sentimos no hemos encountrado ofertas");
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

            bot.sendMessage(message.chat.id, message, options);
        });
    });
};

const saveSettings = (db, chat_id, data) => {
    let user = db.get(config.collectionUsers)
        .find({chat_id: chat_id})
        .value();

    if (user) {
        db.get(config.collectionUsers)
            .find({chat_id: chat_id})
            .assign(data)
            .write();
    }
    else {
        db.get(config.collectionUsers)
            .push({
                chat_id: chat_id,
                ...data
            })
            .write();
    }
};

bot.onText(/\/start/, (msg) => {
    let user = db.get(config.collectionUsers)
        .find({chat_id: msg.chat.id})
        .value();

    if (user) {
        if (!checkFieldsUser(bot, msg.chat.id, user)) {
            return false;
        }
        processSearch(bot, msg, user);
    }
    else {
        bot.sendMessage(msg.chat.id, 'An unexpected error has occurred', {
            "reply_markup": {
                "keyboard": keyboards.home
            }
        });
    }
});


bot.on('message', (msg) => {
    const message = msg.text.toString().toLowerCase();

    //if (is_command(message, ALL_COMMANDS)) {
    if (message) {

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
            saveSettings(db, msg.chat.id, {bank_name: message});

            bot.sendMessage(msg.chat.id, `You have selected the bank: ${message.toUpperCase()}`, {
                "reply_markup": {
                    "keyboard": keyboards.home
                }
            });
        }

        if (is_country_code(message)) {
            saveSettings(db, msg.chat.id, {country_code: message});

            bot.sendMessage(msg.chat.id, `You have selected the Country Code: ${message.toUpperCase()}`, {
                "reply_markup": {
                    "keyboard": keyboards.home
                }
            });
        }

        if (is_country(message)) {
            saveSettings(db, msg.chat.id, {country: message});

            bot.sendMessage(msg.chat.id, `You have selected the country: ${message.toUpperCase()}`, {
                "reply_markup": {
                    "keyboard": keyboards.home
                }
            });
        }

        if (is_currency(message)) {
            saveSettings(db, msg.chat.id, {currency: message});

            bot.sendMessage(msg.chat.id, `You have selected the currency: ${message.toUpperCase()}`, {
                "reply_markup": {
                    "keyboard": keyboards.home
                }
            });
        }
    }
    else {
        bot.sendMessage(msg.chat.id, '?????');
    }
});

bot.on('polling_error', (error) => {
    console.log(error);
});


