import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the structure of the database
interface AppDB extends DBSchema {
  employees: {
    key: string;
    value: {
      id?: string;
      name: string;
      role: string;
      fromDate: Date;
      toDate: Date;
    };
  };
  users: {
    key: string; // The key is the username (string)
    value: {
      username: string; // This must match the keyPath
      password: string;
    };
  };

}

// Initialize the database
export const initDB = async (): Promise<IDBPDatabase<AppDB>> => {
  return openDB<AppDB>('employee_app_db', 1, {
    upgrade(db) {
      // Create the 'employees' object store if it doesn't exist
      if (!db.objectStoreNames.contains('employees')) {
        db.createObjectStore('employees', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }

      // Create the 'users' object store if it doesn't exist
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', {
          keyPath: 'username', // The keyPath is now 'username'
          autoIncrement: true,
        });
      }
    },
  });
};

// Get the database instance
export const getDB = async (): Promise<IDBPDatabase<AppDB>> => {
  return openDB<AppDB>('employee_app_db', 1);
};