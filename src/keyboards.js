import {
    countries as data_countries, 
    countries_code,
    currencies as data_currencies
} from './data';

const banks = [
    ["Banesco", "Provincial"],
    ["Venezuela", "Bicentenario"], 
    ["Mercantil", "Tesoro", "BOD"],
    ["Return"]
];

const settings = [
    ["Bank", "Treshold"],
    ["Country", "Country Code", "Currency",]
];

const home = [
    ["Find", "Settings"],
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

module.exports = {
    banks,
    settings,
    home,
    country,
    country_codes,
    currencies
}