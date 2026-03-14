import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_joy_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function swallowDuplicateColumn(err) {
  // ER_DUP_FIELDNAME = 1060
  return err && (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060);
}

// Initialize database (create DB if not exists, create users table)
export const initDB = async () => {
  try {
    const dbName = process.env.DB_NAME || 'event_joy_db';

    // Connect without database selected to create it if necessary
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    console.log(`Database '${dbName}' checked/created successfully.`);

    // Now switch to the pool which has the database selected and create tables
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createUsersTableQuery);
    console.log("Users table checked/created successfully.");

    // Add role column if missing (for admin/user separation)
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user';`);
      console.log("Users.role column added successfully.");
    } catch (err) {
      if (!swallowDuplicateColumn(err)) throw err;
    }

    const createEventsTableQuery = `
      CREATE TABLE IF NOT EXISTS events (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        event_date DATETIME NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        image_url TEXT NOT NULL,
        featured TINYINT(1) NOT NULL DEFAULT 0,
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_events_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `;

    const createRegistrationsTableQuery = `
      CREATE TABLE IF NOT EXISTS registrations (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        event_id CHAR(36) NOT NULL,
        status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
        num_persons INT NOT NULL DEFAULT 1,
        contact_name VARCHAR(255) NULL,
        contact_phone VARCHAR(50) NULL,
        contact_details TEXT NULL,
        payment_id BIGINT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_registrations_user_event (user_id, event_id),
        CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;

    const createPaymentsTableQuery = `
      CREATE TABLE IF NOT EXISTS payments (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        event_id CHAR(36) NOT NULL,
        provider ENUM('razorpay') NOT NULL,
        amount_paise INT NOT NULL,
        currency CHAR(3) NOT NULL DEFAULT 'INR',
        razorpay_order_id VARCHAR(100) NULL UNIQUE,
        razorpay_payment_id VARCHAR(100) NULL UNIQUE,
        razorpay_signature VARCHAR(255) NULL,
        status ENUM('created','paid','failed','refunded') NOT NULL DEFAULT 'created',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_payments_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;

    await pool.query(createEventsTableQuery);
    await pool.query(createRegistrationsTableQuery);
    await pool.query(createPaymentsTableQuery);

    // Add registrations.payment_id if missing (links pending registrations to payments)
    try {
      await pool.query('ALTER TABLE registrations ADD COLUMN payment_id BIGINT NULL;');
      console.log('Registrations.payment_id column added successfully.');
    } catch (err) {
      if (!swallowDuplicateColumn(err)) throw err;
    }

    // Add num_persons / contact columns if missing
    try {
      await pool.query('ALTER TABLE registrations ADD COLUMN num_persons INT NOT NULL DEFAULT 1;');
      console.log('Registrations.num_persons column added successfully.');
    } catch (err) {
      if (!swallowDuplicateColumn(err)) throw err;
    }
    try {
      await pool.query('ALTER TABLE registrations ADD COLUMN contact_name VARCHAR(255) NULL;');
      console.log('Registrations.contact_name column added successfully.');
    } catch (err) {
      if (!swallowDuplicateColumn(err)) throw err;
    }
    try {
      await pool.query('ALTER TABLE registrations ADD COLUMN contact_phone VARCHAR(50) NULL;');
      console.log('Registrations.contact_phone column added successfully.');
    } catch (err) {
      if (!swallowDuplicateColumn(err)) throw err;
    }
    try {
      await pool.query('ALTER TABLE registrations ADD COLUMN contact_details TEXT NULL;');
      console.log('Registrations.contact_details column added successfully.');
    } catch (err) {
      if (!swallowDuplicateColumn(err)) throw err;
    }
    console.log("Events/registrations/payments tables checked/created successfully.");

  } catch (error) {
    const msg =
      typeof error === "object" && error && "message" in error ? error.message : String(error);
    const code =
      typeof error === "object" && error && "code" in error ? ` (${error.code})` : "";
    console.error("Error initializing database:", `${msg || "Unknown error"}${code}`);
    // Note: If MySQL is not running or credentials are wrong, this will throw.
  }
};

export default pool;
