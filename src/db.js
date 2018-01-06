import config from '../config/config';
import Loki from 'lokijs';

class DBService {
    constructor() {
        this.DB = new Loki(config.pathDB);
        this.db_loaded = false;

        this.loadDB = this.loadDB.bind(this);
        this.insert = this.insert.bind(this);
    }

    databaseInitialize(db) {
        if (db.getCollection(config.collectionUsers) === null) {
            db.addCollection(config.collectionUsers);
        }
    }

    loadDB() {
        const thisParent = this;
        return new Promise((resolve, reject) => {
            if (!thisParent.db_loaded) {
                thisParent.DB.loadDatabase({}, function (e) {
                    if (e) {
                        reject(e);
                    } else {
                        thisParent.db_loaded = true;
                        thisParent.databaseInitialize(thisParent.DB);
                        resolve(thisParent.DB);
                    }
                });
            }
            else {
                resolve(thisParent.DB);
            }
        });
    }

    getCollection(name_collection) {
        return new Promise((resolve, reject) => {
            this.loadDB()
                .then(function (db) {
                    let collection = db.getCollection(name_collection);
                    resolve(collection);
                })
                .catch(function (e) {
                    reject(e);
                });
        });
    }

    insert(name_collection, data) {
        const thisParent = this;
        return new Promise((resolve, reject) => {
            thisParent.loadDB()
                .then(function (db) {
                    let collection = db.getCollection(name_collection);
                    if (collection) {
                        collection.insert(data);
                        
                        thisParent.DB.saveDatabase();
                        
                        resolve(collection);

                    } else {
                        reject(new Error(`Error, Not exist collection ${name_collection}`));
                    }
                })
                .catch(function (e) {
                    reject(e);
                });
        });
    }

    update(name_collection, data) {
        const thisParent = this;
        return new Promise((resolve, reject) => {
            thisParent.loadDB()
                .then(function (db) {
                    let collection = db.getCollection(name_collection);
                    if (collection) {
                        collection.update(data);
                        
                        thisParent.DB.saveDatabase();
                        
                        resolve(collection);

                    } else {
                        reject(new Error(`Error, Not exist collection ${name_collection}`));
                    }
                })
                .catch(function (e) {
                    reject(e);
                });
        });
    }
}

/*

var db = new loki('telegram_users.db', {
    autoload: true,
    autoloadCallback: databaseInitialize,
    autosave: true,
    autosaveInterval: 4000
});

function databaseInitialize() {
    var users = db.getCollection("users");
    if (users === null) {
        users = db.addCollection("users");
    }
}*/

export default DBService;
