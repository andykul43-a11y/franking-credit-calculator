import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseService {
  constructor() {
    const dbPath = path.join(__dirname, '..', '..', 'tax_analyzer.db');
    this.db = new sqlite3.Database(dbPath);
  }

  static async initialize() {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
      await DatabaseService.instance.createTables();
    }
    return DatabaseService.instance;
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(`
          CREATE TABLE IF NOT EXISTS entities (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('Individual', 'Group', 'Trust')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        this.db.run(`
          CREATE TABLE IF NOT EXISTS tax_returns (
            id TEXT PRIMARY KEY,
            entity_id TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            tax_year TEXT NOT NULL,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            processed BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (entity_id) REFERENCES entities (id) ON DELETE CASCADE
          )
        `);

        this.db.run(`
          CREATE TABLE IF NOT EXISTS income_data (
            id TEXT PRIMARY KEY,
            tax_return_id TEXT NOT NULL,
            employment_income REAL DEFAULT 0,
            business_income REAL DEFAULT 0,
            dividend_income REAL DEFAULT 0,
            interest_income REAL DEFAULT 0,
            capital_gains REAL DEFAULT 0,
            rental_income REAL DEFAULT 0,
            trust_distributions REAL DEFAULT 0,
            other_income REAL DEFAULT 0,
            total_income REAL DEFAULT 0,
            taxable_income REAL DEFAULT 0,
            tax_payable REAL DEFAULT 0,
            franking_credits REAL DEFAULT 0,
            net_tax_payable REAL DEFAULT 0,
            extracted_text TEXT,
            ai_confidence REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tax_return_id) REFERENCES tax_returns (id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

export { DatabaseService };