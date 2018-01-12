import {
    countries as data_countries,
    countries_code,
    currencies as data_currencies
} from './data';

import {
    COMMAND_START,
    COMMAND_SETTINGS,
    COMMAND_RETURN,
    COMMAND_CURRENCY,
    COMMAND_COUNTRY,
    COMMAND_BANK, COMMAND_COUNTRY_CODE
} from "./commands";

const banks = [
    ["Banesco", "Provincial"],
    ["Venezuela", "Bicentenario"],
    ["Mercantil", "Tesoro", "BOD"],
    ["Return"]
];

const settings = [
    [COMMAND_BANK, "Threshold"],
    [COMMAND_COUNTRY, COMMAND_COUNTRY_CODE, COMMAND_CURRENCY],
    [COMMAND_RETURN]
];

const home = [
    [COMMAND_START, COMMAND_SETTINGS],
];

const country = [
    data_countries.map(contry => contry.toLocaleUpperCase())
];

const country_codes = [
    countries_code.map(code => code.toLocaleUpperCase())
];

const currencies = [
    data_currencies.map(currency => currency.toLocaleUpperCase())
];

export default {
    banks,
    settings,
    home,
    country,
    country_codes,
    currencies
};