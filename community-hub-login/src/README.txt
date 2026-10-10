SETUP
1. Import your SQL into phpMyAdmin (database: login_system).
2. Copy the "api" folder to C:\xampp\htdocs\login_system\api  (start Apache + MySQL).
   If your MySQL root has a password, edit api/config.php.
3. In the "client" folder run:
     npm install
     npm run dev
4. Open http://localhost:5173
The seeded user francis / 123456 works and is upgraded to a hash on first login.
