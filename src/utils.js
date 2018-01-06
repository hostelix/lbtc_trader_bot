import axios from 'axios';
import {
    banks,
    countries_code,
    countries,
    currencies
} from './data';

const get_data_localbitcoins = (url, pages) => {
	
    const payload = {
        fields: 'public_view,min_amount,max_amount,temp_price,bank_name,currency,location_string'
    };

    const options = {
        params: payload
    };

    return new Promise(function(resolve, reject) {
    
        axios.get(url, options).then((response)=>{

            let data = response.data;

            pages = pages.concat([data.data.ad_list]);

            let url_next_page = data.pagination.next;
            
            if(url_next_page){
                resolve(get_data_localbitcoins(url_next_page, pages));
            }
            else {
                resolve(pages);
            }
        })
        .catch((err)=>{
            reject(err);
        });
    });
}


const is_name_bank = (mesg) => {
    return banks.map(name_bank => name_bank.toLowerCase()).indexOf(mesg) !== -1;
}

const is_country_code = (mesg) => {
    return countries_code.map(c_country => c_country.toLowerCase()).indexOf(mesg) !== -1;
}

const is_country = (mesg) => {
    return countries.map(country => country.toLowerCase()).indexOf(mesg) !== -1;
}

const is_currency = (mesg) => {
    return currencies.map(currency => currency.toLowerCase()).indexOf(mesg) !== -1;
}

export {
    get_data_localbitcoins,
    is_name_bank,
    is_country_code,
    is_country,
    is_currency
}