#!/usr/bin/env node
/**
 * Database Setup Script for HMS
 * This script creates the hms_data database and runs the DDL.sql file
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  user: 'root',
  password: 'root123',
  socketPath: '/tmp/mysql.sock', // Use socket connection on macOS
  multipleStatements: true // Allow multiple SQL statements
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('Creating database hms_data...');
    await connection.query('CREATE DATABASE IF NOT EXISTS hms_data');
    console.log('✓ Database hms_data created successfully');
    
    console.log('Switching to hms_data database...');
    await connection.query('USE hms_data');
    console.log('✓ Using hms_data database');
    
    console.log('Reading DDL.sql file...');
    const ddlPath = path.join(__dirname, 'DDL.sql');
    const ddlSQL = fs.readFileSync(ddlPath, 'utf8');
    
    console.log('Executing DDL statements...');
    await connection.query(ddlSQL);
    console.log('✓ All tables created successfully');
    
    console.log('\n=== Database Setup Complete ===');
    console.log('Database name: hms_data');
    console.log('Host: localhost');
    console.log('User: root');
    console.log('All tables have been created in hms_data database');
    
  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection refused. Possible issues:');
      console.error('   1. MySQL server is not running');
      console.error('   2. MySQL is running on a different port');
      console.error('   3. MySQL is not listening on localhost');
      console.error('\n💡 To start MySQL on macOS:');
      console.error('   brew services start mysql');
      console.error('   OR');
      console.error('   mysql.server start');
      console.error('\n💡 To check MySQL status:');
      console.error('   brew services list | grep mysql');
      console.error('   OR');
      console.error('   mysqladmin -uroot -proot123 ping');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Access denied. Check your MySQL password.');
      console.error('   Current password: root123');
      console.error('   If your MySQL root password is different, please update setup_database.js');
    } else {
      console.error('\nFull error details:', error);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

setupDatabase();

