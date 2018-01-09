import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import config from '../config/config';

const adapter = new FileSync(config.pathDB);

class DBService {
    constructor() {
        this.db = lowdb(adapter);

        if (!this.db.has(config.collectionUsers).value()) {
            this.db.set(config.collectionUsers, []).write();
        }
    }

    getDB() {
        return this.db;
    }
}

export default DBService;
