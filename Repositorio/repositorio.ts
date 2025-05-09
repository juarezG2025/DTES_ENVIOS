import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Abrir conexión a la base de datos
export async function openDb() {
  return open({
    filename: './BD/configsData.sqlite',
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await openDb();
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT,
      iteracion INTEGER,
      fecha TEXT
    );
  `);
  
  return db;
}

export async function guardarRegistro(token: string|any, fecha: string) {
    const db = await openDb();
    
    await db.run(
      `INSERT INTO config (token, iteracion, fecha) VALUES (?, 1, ?)`,
      [token, fecha]
    );
    
    await db.close();
}

export async function obtenerToken(fecha: string) {
    const db = await openDb();
    const result = await db.get(
      `SELECT token 
       FROM config 
       WHERE fecha = ? 
       ORDER BY id DESC 
       LIMIT 1;`,
      [fecha]
    );
    
    await db.close();
    return result?.token;
}

export async function obtenerIteracion(fecha: string):Promise<number> {
    const db = await openDb();
    
    const result = await db.get(
      `SELECT iteracion FROM config WHERE fecha = ?`,
      [fecha]
    );
    
    await db.close();
    return result?.iteracion;
}

export async function editarItercion(iteracion :number,fecha:string) {
  const db = await openDb();
  
  await db.run(
    `UPDATE config SET iteracion = ? WHERE fecha = ?;`,
    [iteracion,fecha]
  );
  
  await db.close();
}