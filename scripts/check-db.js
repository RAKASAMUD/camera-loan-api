// Tes koneksi EC2 -> RDS. Jalankan: npm run check-db
const pool = require('../src/db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS server_time, VERSION() AS mysql_version');
    console.log('Koneksi RDS berhasil:', rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Koneksi RDS gagal:', err.message);
    process.exit(1);
  }
})();
