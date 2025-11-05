#!/usr/bin/env node
/**
 * Database Backup Script for HMS
 * This script exports the hms_data database to a SQL file in the project folder
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

const DB_CONFIG = {
  user: 'root',
  password: 'root123',
  database: 'hms_data'
};

async function backupDatabase() {
  try {
    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                      new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const backupFilename = `database_backup_${timestamp}.sql`;
    const backupPath = path.join(__dirname, backupFilename);
    
    // Also create a latest backup file (overwrites previous latest)
    const latestBackupPath = path.join(__dirname, 'database_backup_latest.sql');
    
    console.log('Starting database backup...');
    console.log(`Database: ${DB_CONFIG.database}`);
    console.log(`User: ${DB_CONFIG.user}`);
    
    // Build mysqldump command
    // On macOS, try socket connection first, then fallback to TCP
    let dumpCommand = `mysqldump -u${DB_CONFIG.user} -p${DB_CONFIG.password}`;
    
    // Try to use socket path on macOS
    const socketPath = '/tmp/mysql.sock';
    if (process.platform === 'darwin' && fs.existsSync(socketPath)) {
      dumpCommand += ` --socket=${socketPath}`;
    }
    
    dumpCommand += ` ${DB_CONFIG.database} > "${backupPath}"`;
    
    console.log('Executing mysqldump...');
    await execPromise(dumpCommand, { maxBuffer: 10 * 1024 * 1024 }); // 10MB buffer
    
    // Check if backup file was created and has content
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file was not created');
    }
    
    const stats = fs.statSync(backupPath);
    if (stats.size === 0) {
      throw new Error('Backup file is empty - database might not exist or connection failed');
    }
    
    // Create a copy as latest backup
    fs.copyFileSync(backupPath, latestBackupPath);
    
    console.log('\n✓ Database backup completed successfully!');
    console.log(`✓ Backup saved to: ${backupFilename}`);
    console.log(`✓ Latest backup saved to: database_backup_latest.sql`);
    console.log(`✓ Backup size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Clean up old backups (keep last 10)
    console.log('\nCleaning up old backups...');
    const files = fs.readdirSync(__dirname)
      .filter(file => file.startsWith('database_backup_') && file.endsWith('.sql') && file !== 'database_backup_latest.sql')
      .map(file => ({
        name: file,
        path: path.join(__dirname, file),
        time: fs.statSync(path.join(__dirname, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length > 10) {
      const toDelete = files.slice(10);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`  Deleted old backup: ${file.name}`);
      });
    }
    
    console.log('\n=== Backup Complete ===');
    
  } catch (error) {
    console.error('\n❌ Error backing up database:', error.message);
    
    if (error.message.includes('command not found')) {
      console.error('\n⚠️  mysqldump command not found.');
      console.error('💡 Make sure MySQL is installed and mysqldump is in your PATH.');
      console.error('   On macOS, you may need to: brew install mysql-client');
    } else if (error.message.includes('Access denied')) {
      console.error('\n⚠️  Access denied. Check your MySQL credentials.');
      console.error('   Current password: root123');
    } else if (error.message.includes('Unknown database')) {
      console.error('\n⚠️  Database hms_data does not exist.');
      console.error('💡 Run: node setup_database.js');
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('connection')) {
      console.error('\n⚠️  Cannot connect to MySQL server.');
      console.error('💡 Make sure MySQL is running:');
      console.error('   brew services start mysql');
      console.error('   OR');
      console.error('   mysql.server start');
    }
    
    process.exit(1);
  }
}

backupDatabase();


