const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const app = express();

// 📂 CAMBIO DE BASE DE DATOS Y COOKIE
const db = new sqlite3.Database('/data/betflix_mexico_v1.db');

// 🔥 CREDENCIALES MAESTRAS 🔥 (Mantenemos las mismas)
const MI_CORREO = 'andreavalencia6012@gmail.com';
const MI_CLAVE = 'fpgorosihjkqgqjk'; // Recuerda cambiar esto en producción por seguridad

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'betflix_mexico_ultra_secure_2026_MX', // Clave secreta personalizada
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT UNIQUE, pass TEXT, rol TEXT, creado_por INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS correos (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, user_id INTEGER)");
    db.run("ALTER TABLE usuarios ADD COLUMN creado_por INTEGER", (err) => {});
    // Admin principal se mantiene como 'ruben'
    db.run("INSERT OR IGNORE INTO usuarios (user, pass, rol, creado_por) VALUES ('ruben', '123456', 'Administrador', NULL)");
});

// 🔥 NUEVOS ESTILOS BETFLIX MEXICO (Estilo Bandera de México) 🔥
const CSS_MODERNO = `
<style>
    /* Animación de Neón Bandera (Verde - Blanco - Rojo) */
    @keyframes led-glow { 
        0% { border-color: #0f0; box-shadow: 0 0 15px #0f0; } /* Verde */
        33% { border-color: #fff; box-shadow: 0 0 15px #fff; } /* Blanco */
        66% { border-color: #f00; box-shadow: 0 0 15px #f00; } /* Rojo */
        100% { border-color: #0f0; box-shadow: 0 0 15px #0f0; } /* Verde */
    }
    
    body { background: #050505; color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; box-sizing: border-box; }
    
    /* Cabecera del Panel con Degradado Bandera */
    .header-panel { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; background: #111; padding: 15px 30px; border-radius: 15px; border-bottom: 3px solid; border-image: linear-gradient(to right, #0f0, #fff, #f00) 1; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(255,255,255,0.1); }
    
    .form-container { max-width: 800px; margin: 0 auto 30px auto; background: #111; padding: 20px; border-radius: 15px; border: 2px solid #0f0; box-shadow: 0 0 15px rgba(0,255,0,0.1); text-align: left; }
    
    input, select, textarea { width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #333; background: #000; color: white; box-sizing: border-box; font-size: 14px; }
    
    /* Botón de Neón Verde Bandera */
    button { color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; box-sizing: border-box; text-transform: uppercase; font-size: 14px; transition: 0.3s; border: 2px solid transparent; }
    button:hover { opacity: 0.8; }
    
    .btn-green-mx { background: linear-gradient(135deg, #0f0 0%, #008000 100%); border-color: #0f0; box-shadow: 0 0 10px rgba(0,255,0,0.3); }
    .btn-red { background: linear-gradient(135deg, #f00 0%, #800 100%); border-color: #f00; box-shadow: 0 0 10px rgba(255,0,0,0.3); }
    
    .folder { background: #111; border: 2px solid #0f0; border-radius: 15px; overflow: hidden; margin-bottom: 20px; }
    .folder summary { padding: 20px; font-weight: bold; font-size: 18px; color: #0f0; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
    .folder summary::-webkit-details-marker { display: none; }
    .folder-content { padding: 20px; background: #1a1a1a; border-top: 1px solid #333; cursor: default; }

    /* Tarjetas de Clientes Directos (Rojo Bandera) */
    .client-card { background: #000; border: 1px solid #333; padding: 15px; margin-bottom: 15px; border-radius: 10px; border-left: 4px solid #f00; position: relative; }
    .del-btn { position: absolute; top: 10px; right: 10px; color: #f00; text-decoration: none; font-weight: bold; font-size: 16px; }
    .email-list { max-height: 150px; overflow-y: auto; background: #080808; padding: 10px; border-radius: 5px; margin-top: 10px; font-size: 13px; }
    .email-item { display: flex; justify-content: space-between; border-bottom: 1px solid #222; padding: 6px 0; }
</style>
`;

// 🔥 GUARDIÁN DE SEGURIDAD 🔥 (Personalizado)
app.use((req, res, next) => {
    const rutasAbiertas = ['/', '/login', '/logout'];
    if (rutasAbiertas.includes(req.path)) return next();

    if (req.session && req.session.uid) {
        db.get("SELECT id FROM usuarios WHERE id = ?", [req.session.uid], (err, row) => {
            if (!row) {
                req.session.destroy();
                return res.send("<script>alert('⛔ 🇲🇽 ACCESO DENEGADO 🇲🇽 \\n\\nTu cuenta en BETFLIX MEXICO ha sido eliminada por el administrador.'); window.location='/';</script>");
            }
            next();
        });
    } else {
        return res.redirect('/');
    }
});

// 🔥 PAGINA DE INICIO DE SESIÓN ESTILO NETFLIX/BETFLIX (Fondo de Collage y Neón) 🔥
app.get('/', (req, res) => {
    // Recreamos el estilo visual con collage y neón de la bandera
    const ESTILO_LOGIN = `
    <style>
        body { background: #050505; color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; position: relative; }
        
        /* Fondo de collage adaptado con neón bandera */
        body::before { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url('https://imgur.com/your_mexico_collage_background.jpg'); background-size: cover; background-position: center; filter: blur(5px) brightness(0.3); opacity: 0.6; z-index: -1; }
        
        .login-panel { position: relative; background: rgba(0, 0, 0, 0.85); padding: 40px; border-radius: 20px; border: 3px solid; animation: led-glow 5s infinite linear; max-width: 450px; width: 90%; text-align: center; box-shadow: 0 0 30px rgba(255,255,255,0.1); }
        
        .logo-mx { font-size: 35px; font-weight: bold; margin-bottom: 25px; display: inline-block; }
        .logo-mx .green { color: #0f0; }
        .logo-mx .white { color: #fff; }
        .logo-mx .red { color: #f00; }
        
        h2 { color: white; margin-bottom: 25px; font-weight: normal; font-size: 18px; }
        
        input { width: 100%; padding: 15px; margin-bottom: 15px; border-radius: 8px; border: 2px solid #333; background: transparent; color: white; box-sizing: border-box; font-size: 16px; transition: 0.3s; }
        input:focus { border-color: #0f0; outline: none; box-shadow: 0 0 10px rgba(0,255,0,0.2); }
        input.password:focus { border-color: #f00; outline: none; box-shadow: 0 0 10px rgba(255,0,0,0.2); }
        
        .btn-neon-green { background: linear-gradient(135deg, #0f0 0%, #008000 100%); color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; box-sizing: border-box; text-transform: uppercase; font-size: 16px; transition: 0.3s; border: 2px solid #0f0; box-shadow: 0 0 15px rgba(0,255,0,0.4); }
        .btn-neon-green:hover { background: #008000; box-shadow: 0 0 25px rgba(0,255,0,0.6); }
        
        .forgot-pass { display: block; color: #aaa; text-decoration: none; margin-top: 20px; font-size: 14px; }
        .forgot-pass:hover { text-decoration: underline; color: white; }
    </style>
    `;

    res.send(`${ESTILO_LOGIN}
    <div class="login-panel">
        <div class="logo-mx">
            <span class="green">⚡ BET</span><span class="white">FLIX ⚡</span><br>
            <span class="red">M É X I C O</span>
        </div>
        <h2>Inicia sesión para gestionar tus cuentas</h2>
        <form action="/login" method="POST">
            <input name="user" placeholder="👤 Usuario" required>
            <input type="password" name="pass" class="password" placeholder="🔑 Contraseña" required>
            <button class="btn-neon-green">🔓 ENTRAR AL PANEL</button>
        </form>
        <a href="#" class="forgot-pass">¿Olvidaste tu contraseña?</a>
    </div>
    </body>`);
});

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    db.get("SELECT * FROM usuarios WHERE user = ? AND pass = ?", [user, pass], (err, row) => {
        if (row) {
            req.session.uid = row.id; req.session.user = row.user; req.session.rol = row.rol;
            res.redirect('/dash');
        } else { res.send("<script>alert('⛔🇲🇽 Datos incorrectos. Intenta de nuevo.'); window.location='/';</script>"); }
    });
});

app.get('/admin/logout-todos', (req, res) => {
    const esAdminPrincipal = (req.session.user === 'ruben' || req.session.rol === 'Administrador');
    if (esAdminPrincipal) {
        req.sessionStore.clear((err) => {
            res.send("<script>alert('✅ ¡BARRIDO COMPLETO MUNICIPAL! 🇲🇽 \\n\\nSe ha cerrado la sesión de TODOS los usuarios en BETFLIX MEXICO. Tendrás que volver a iniciar sesión.'); window.location='/';</script>");
        });
    } else {
        res.redirect('/dash');
    }
});

// 🔥 EL BOTÓN NUCLEAR: DESTRUYE TODOS LOS DATOS MENOS A RUBEN 🔥 (Personalizado)
app.get('/admin/nuke-database', (req, res) => {
    const esAdminPrincipal = (req.session.user === 'ruben' || req.session.rol === 'Administrador');
    if (esAdminPrincipal) {
        // 1. Borramos absolutamente todos los correos
        db.run("DELETE FROM correos", [], () => {
            // 2. Borramos todos los usuarios, subadmins y clientes (excepto a ruben)
            db.run("DELETE FROM usuarios WHERE user != 'ruben'", [], () => {
                res.send("<script>alert('💥💥 ¡ESTADO DE EMERGENCIA ACTIVADO MUNICIPAL! 🇲🇽 \\n\\nBASE DE DATOS FORMATEADA COMPLETAMENTE. \\n\\nSe han destruido todos los correos y usuarios fantasmas. El sistema de BETFLIX MEXICO está limpio.'); window.location='/dash';</script>");
            });
        });
    } else {
        res.redirect('/dash');
    }
});

app.get('/dash', (req, res) => {
    const esAdminPrincipal = (req.session.user === 'ruben' || req.session.rol === 'Administrador');
    const esSubAdmin = (req.session.rol === 'Subadministrador');

    if (esAdminPrincipal || esSubAdmin) {
        
        let extraAdminButtons = esAdminPrincipal ? `
            <a href="/admin/nuke-database" style="border: 1px solid #f00; background: linear-gradient(135deg, #f00 0%, #800 100%); color:#fff; text-decoration:none; padding: 8px 15px; border-radius: 8px; font-weight:bold; font-size:12px; text-transform:uppercase; box-shadow: 0 0 10px rgba(255,0,0,0.2);" onclick="return confirm('⚠️🇲🇽 PELIGRO EXTREMO NACIONAL: ¿Estás seguro de que quieres BORRAR A TODOS LOS USUARIOS Y CORREOS de BETFLIX MEXICO? Esto no se puede deshacer y empezarás desde cero.')">💥 FORMATAR BASE DE DATOS</a>
            <a href="/admin/logout-todos" style="border: 1px solid #f00; background: linear-gradient(135deg, #e50914 0%, #a00 100%); color:#fff; text-decoration:none; padding: 8px 15px; border-radius: 8px; font-weight:bold; font-size:12px; text-transform:uppercase;" onclick="return confirm('⚠️🇲🇽 ¿Seguro que quieres cerrar la sesión de TODOS los usuarios conectados al panel de BETFLIX MEXICO?')">🛑 CERRAR SESIÓN DE TODOS</a>
        ` : "";

        let htmlTop = `${CSS_MODERNO} 
        <div class="header-panel">
            <h2 style="margin:0; color:#0f0; text-shadow:0 0 10px #0f0; display:flex; align-items:center; gap:10px;">⚡ BETFLIX MEXICO | Rol: <span style="background:#0f0; color:#000; padding:4px 10px; border-radius:15px; font-size:12px; border: 1px solid transparent;">${req.session.user.toUpperCase()} - ${req.session.rol}</span></h2>
            <div style="display:flex; flex-wrap: wrap; gap: 10px; align-items:center;">
                ${extraAdminButtons}
                <a href="/logout" style="border: 1px solid #f00; color:#f00; text-decoration:none; padding: 8px 15px; border-radius: 8px; font-size:12px; font-weight:bold;">SALIR</a>
            </div>
        </div>

        <div class="form-container" style="text-align:center; border-color: #fff; box-shadow: 0 0 15px rgba(255,255,255,0.2);">
            <h3 style="margin-top:0; color:#fff; display:flex; align-items:center; gap:10px; justify-content:center;">🇲🇽 🔍 CONSULTA MULTI-STREAM MASTER BANDERA (IMAP)</h3>
            <form action="/buscar" method="POST">
                <input name="email_search" placeholder="Correo (Netflix, Disney+, etc) a buscar en tu bandeja..." required style="padding:15px; font-size:16px; border:2px solid #fff; text-align:center; background:transparent;">
                <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                    <button type="submit" name="accion" value="mensaje" class="btn-green-mx" style="flex:1; padding:15px; min-width:140px;">📩 LEER MENSAJE</button>
                    <button type="submit" name="accion" value="pais" style="background:#fff; color:#000; flex:1; padding:15px; min-width:140px; border: 2px solid #fff;">🌍 BUSCAR PAÍS</button>
                    <button type="submit" name="accion" value="ip" class="btn-red" style="flex:1; padding:15px; min-width:140px;">📡 BUSCAR IP</button>
                </div>
            </form>
        </div>

        <div class="form-container" style="text-align:center; border-color: #ffaa00; box-shadow: 0 0 15px rgba(255,170,0,0.2);">
            <h3 style="margin-top:0; color:#ffaa00;">🔎 BUSCAR DUEÑO DE CUENTA (FILTRO LOCAL BETFLIX)</h3>
            <input type="text" id="buscadorLocal" onkeyup="buscarCorreoLocal()" placeholder="Escribe el correo, subadmin o cliente para buscarlo abajo..." style="padding:15px; font-size:16px; border:2px solid #ffaa00; text-align:center; margin-bottom: 5px;">
            <p style="color:#aaa; font-size: 12px; margin: 0;">Filtra automáticamente la lista de carpetas para saber quién tiene un correo.</p>
        </div>

        <div class="form-container" style="border-color:#0f0;">
            <h3 style="margin-top:0; color:#0f0;">➕ Registrar Nuevo Cliente/Subadmin - BETFLIX MEXICO</h3>
            <form action="/admin/crear" method="POST" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <input name="n" placeholder="Usuario" required style="flex: 1; min-width: 150px; margin-bottom: 0;">
                <input name="c" placeholder="Contraseña" required style="flex: 1; min-width: 150px; margin-bottom: 0;">
                <select name="r" style="flex: 1; min-width: 150px; margin-bottom: 0;">
                    <option value="Cliente">Cliente</option>
                    ${esAdminPrincipal ? '<option value="Subadministrador">Subadministrador</option>' : ''}
                </select>
                <button class="btn-green-mx" style="flex: 1; min-width: 150px; margin-bottom: 0;">REGISTRAR</button>
            </form>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; width: 100%; box-sizing: border-box;">`;

        let query = esAdminPrincipal ? "SELECT * FROM usuarios WHERE user != 'ruben'" : "SELECT * FROM usuarios WHERE creado_por = ? OR id = ?";
        let params = esAdminPrincipal ? [] : [req.session.uid, req.session.uid];

        db.all(query, params, (err, usuarios) => {
            db.all("SELECT * FROM correos", [], (err, correos) => {
                
                let subadmins = usuarios.filter(u => u.rol === 'Subadministrador');
                let clientes = usuarios.filter(u => u.rol === 'Cliente');

                if (esSubAdmin) {
                    subadmins = usuarios.filter(u => u.id === req.session.uid);
                }

                let subadminsHtml = "";
                subadmins.forEach(sub => {
                    let clientesDelSub = clientes.filter(c => c.creado_por === sub.id);
                    subadminsHtml += `
                    <details class="folder item-folder" style="border-color:#0f0;">
                        <summary style="color:#0f0;">
                            <span>📁🇲🇽 SUBADMIN: <span style="color:#fff;">${sub.user.toUpperCase()}</span> 📌</span>
                            <span style="font-size:12px; background:#0f0; color:#000; padding:6px 12px; border-radius:15px;">${clientesDelSub.length} usuarios</span>
                        </summary>
                        <div class="folder-content">
                            <a href="/admin/del-user/${sub.id}" class="btn-red" style="padding:8px; border-radius:5px; font-size:13px; display:block; text-align:center; text-decoration:none; margin-bottom:20px; color:white; font-weight:bold;" onclick="return confirm('⚠️ ATENCIÓN PELIGRO REGIONAL: Borrar a ${sub.user.toUpperCase()} también borrará a TODOS sus clientes y correos asociados de BETFLIX MEXICO. ¿Estás seguro?')">❌ ELIMINAR A ESTE SUBADMINISTRADOR Y SUS DATOS</a>
                            
                            <h4 style="color:#0f0; border-bottom:1px solid #333; padding-bottom:10px;">👥 Lista de Clientes de ${sub.user}:</h4>`;
                            
                            clientesDelSub.forEach(cli => {
                                let correosDelCli = correos.filter(c => c.user_id === cli.id);
                                subadminsHtml += `
                                <div class="client-card item-client" style="border-left-color:#f0f;">
                                    <strong>👤 ${cli.user}</strong> <span style="font-size:12px; color:#aaa;">(Cliente)</span>
                                    <a href="/admin/del-user/${cli.id}" class="del-btn" onclick="return confirm('¿Borrar cliente y sus correos de BETFLIX MEXICO?')">❌</a>
                                    
                                    <form action="/admin/add-mail-masivo" method="POST" style="margin-top:10px;">
                                        <input type="hidden" name="uid" value="${cli.id}">
                                        <textarea name="emails" placeholder="Pega los correos aquí (Netflix, Disney, etc)..."></textarea>
                                        <button class="btn-green-mx" style="background:#f0f;">📥 Cargar Correos</button>
                                    </form>
                                    
                                    <div class="email-list">`;
                                        correosDelCli.forEach(m => {
                                            subadminsHtml += `<div class="email-item"><span>${m.email}</span> <a href="/admin/del-mail/${m.id}" style="color:#f00; text-decoration:none;">×</a></div>`;
                                        });
                                subadminsHtml += `</div></div>`;
                            });
                    subadminsHtml += `</div></details>`;
                });

                let clientesDirectosHtml = "";
                if (esAdminPrincipal) {
                    let clientesDirectos = clientes.filter(c => !c.creado_por);
                    clientesDirectosHtml += `
                    <div class="folderDirect" style="grid-column: 1 / -1;">
                        <h2 style="margin-top:30px; margin-bottom: 20px; border-left:5px solid #f00; padding-left:15px; color:white;">👤🇲🇽 CLIENTES DIRECTOS (BETFLIX MEXICO - Creados por ti)</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 15px;">`;
                        
                        clientesDirectos.forEach(cli => {
                            let correosDelCli = correos.filter(c => c.user_id === cli.id);
                            clientesDirectosHtml += `
                            <div class="client-card item-client" style="border-left-color:#f00;">
                                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                                    <strong style="font-size:16px; color:white;">👤 ${cli.user}</strong>
                                    <a href="/admin/del-user/${cli.id}" class="del-btn" onclick="return confirm('¿Borrar cliente y correos de BETFLIX MEXICO?')">❌</a>
                                </div>
                                <form action="/admin/add-mail-masivo" method="POST">
                                    <input type="hidden" name="uid" value="${cli.id}">
                                    <textarea name="emails" placeholder="Pega los correos aquí..." style="height:60px;"></textarea>
                                    <button class="btn-red" style="padding:8px; background:#f00;">📥 Cargar Correos</button>
                                </form>
                                <div class="email-list">`;
                                    correosDelCli.forEach(m => {
                                        clientesDirectosHtml += `<div class="email-item"><span>${m.email}</span> <a href="/admin/del-mail/${m.id}" style="color:#f00; text-decoration:none;">×</a></div>`;
                                    });
                            clientesDirectosHtml += `</div></div>`;
                        });
                    clientesDirectosHtml += `</div></div>`;
                }

                let scriptBusqueda = `
                <script>
                function buscarCorreoLocal() {
                    let input = document.getElementById('buscadorLocal').value.toLowerCase();
                    let folders = document.querySelectorAll('.item-folder');
                    let clients = document.querySelectorAll('.item-client');

                    if(input === '') {
                        folders.forEach(f => { f.style.display = ''; f.removeAttribute('open'); });
                        clients.forEach(c => c.style.display = '');
                        return;
                    }

                    clients.forEach(c => {
                        let text = c.innerText.toLowerCase();
                        c.style.display = text.includes(input) ? '' : 'none';
                    });

                    folders.forEach(f => {
                        let text = f.innerText.toLowerCase();
                        if(text.includes(input)) {
                            f.style.display = '';
                            f.setAttribute('open', 'true');
                        } else {
                            f.style.display = 'none';
                            f.removeAttribute('open');
                        }
                    });
                }
                </script>
                `;

                res.send(htmlTop + subadminsHtml + "</div>" + clientesDirectosHtml + "</div>" + scriptBusqueda + "</body>");
            });
        });

    } else {
        // VISTA PARA CLIENTES NORMALES
        let html = `${CSS_MODERNO} 
        <div class="header-panel">
            <h2 style="margin:0; color:#0f0;">BETFLIX MEXICO | 🔍 CONSULTA MULTI-STREAM BANDERA</h2>
            <a href="/logout" style="border: 1px solid #f00; color:#f00; text-decoration:none; padding: 8px 15px; border-radius: 8px;">SALIR</a>
        </div>
        <div class="form-container" style="text-align:center; max-width: 600px; border-color:#fff; box-shadow: 0 0 15px rgba(255,255,255,0.2);">
            <form action="/buscar" method="POST">
                <input name="email_search" placeholder="Correo (Netflix, Disney+, etc) a buscar..." required style="padding:15px; font-size:16px; border:2px solid #fff; text-align:center; background:transparent;">
                <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                    <button type="submit" name="accion" value="mensaje" class="btn-green-mx" style="flex:1; padding:15px; min-width:140px;">📩 LEER MENSAJE</button>
                    <button type="submit" name="accion" value="pais" style="background:#fff; color:#000; flex:1; padding:15px; min-width:140px; border: 2px solid #fff;">🌍 BUSCAR PAÍS</button>
                    <button type="submit" name="accion" value="ip" class="btn-red" style="flex:1; padding:15px; min-width:140px;">📡 BUSCAR IP</button>
                </div>
            </form>
            <p style="color:#666; margin-top:15px; font-size: 13px;">Ingresa el correo y presiona el botón de la información que deseas extraer.</p>
        </div></body>`;
        res.send(html);
    }
});

app.post('/admin/crear', (req, res) => {
    let creado_por = (req.session.rol === 'Subadministrador') ? req.session.uid : null;
    db.run("INSERT INTO usuarios (user, pass, rol, creado_por) VALUES (?, ?, ?, ?)", [req.body.n, req.body.c, req.body.r, creado_por], () => res.redirect('/dash'));
});

app.post('/admin/add-mail-masivo', (req, res) => {
    const list = req.body.emails.split(/[\s,]+/).filter(e => e.includes('@'));
    
    db.all("SELECT c.email, COALESCE(u.user, 'Fantasma/Eliminado') as owner FROM correos c LEFT JOIN usuarios u ON c.user_id = u.id", [], (err, rows) => {
        
        const correosExistentes = {};
        rows.forEach(r => { correosExistentes[r.email.toLowerCase()] = r.owner; });
        
        const stmt = db.prepare("INSERT INTO correos (email, user_id) VALUES (?, ?)");
        
        let insertados = 0;
        let repetidos = [];

        list.forEach(m => {
            let correoLimpio = m.trim().toLowerCase();
            
            if (correosExistentes[correoLimpio]) {
                repetidos.push(`${correoLimpio} (Lo tiene: ${correosExistentes[correoLimpio]})`);
            } else {
                stmt.run(correoLimpio, req.body.uid);
                correosExistentes[correoLimpio] = "Asignado Ahora";
                insertados++;
            }
        });
        
        stmt.finalize(); 
        
        if (repetidos.length > 0) { 
            let msjAlert = `✅ Se guardaron ${insertados} correos nuevos en BETFLIX MEXICO.\\n\\n⚠️ Se bloquearon ${repetidos.length} correos que ya existen:\\n\\n`;
            let limiteMostrar = repetidos.slice(0, 8).join('\\n');
            msjAlert += limiteMostrar;
            if (repetidos.length > 8) msjAlert += `\\n... (y otros más)`;
            
            res.send(`<script>alert('${msjAlert}'); window.location='/dash';</script>`); 
        } else { 
            res.redirect('/dash'); 
        }
    });
});

app.get('/admin/del-user/:id', (req, res) => {
    db.run("DELETE FROM usuarios WHERE id = ?", [req.params.id], () => { db.run("DELETE FROM correos WHERE user_id = ?", [req.params.id], () => res.redirect('/dash')); });
});
app.get('/admin/del-mail/:id', (req, res) => {
    db.run("DELETE FROM correos WHERE id = ?", [req.params.id], () => res.redirect('/dash'));
});

app.post('/buscar', async (req, res) => {
    const { email_search, accion } = req.body;
    // Mantenemos la configuración maestra de Gmail
    const config = { imap: { user: MI_CORREO, password: MI_CLAVE, host: 'imap.gmail.com', port: 993, tls: true, tlsOptions: { rejectUnauthorized: false } } };
    
    try {
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');
        const messages = await connection.search([['TEXT', email_search.trim()]], { bodies: [''], struct: true });
        
        if (messages.length === 0) { 
            connection.end(); 
            return res.send(`<div style="background:#000; text-align:center; padding:20px; color:white; font-family:sans-serif;"><h2>❌🇲🇽 No se encontró ningún correo para: ${email_search} en BETFLIX MEXICO</h2><br><a href="/dash" style="color:#0f0; font-weight:bold; text-decoration:none; border: 1px solid #0f0; padding: 10px; border-radius: 5px;">⬅ VOLVER AL PANEL</a></div>`); 
        }
        
        messages.sort((a, b) => b.attributes.uid - a.attributes.uid);
        const mail = await simpleParser(messages[0].parts.find(p => p.which === '').body);
        connection.end();

        const textoBruto = mail.text || String(mail.html).replace(/<[^>]*>?/gm, ' ') || "";
        const textoCorreo = textoBruto.toLowerCase();

        if (accion === 'pais') {
            // Mantenemos el filtro de países
            let paisDetectado = null;
            const reglasPais = [
                { id: "🇺🇸 Estados Unidos", keys: ['ee. uu.', 'usa', 'united states', 'los gatos', 'california', '1-866-', '1-844-', '1-800-', '1-888-', '1-877-'] },
                { id: "🇫🇷 Francia", keys: ['france', 'francia', 'paris', 's.a.s.', 'des questions'] },
                { id: "🇮🇳 India", keys: ['india', 'mumbai', 'maharashtra', 'llp', '000-800-'] },
                { id: "🇧🇷 Brasil", keys: ['brasil', 'brazil', 'alphaville', 'barueri', 'são paulo', '0800-', 'dúvidas?'] },
                { id: "🇨🇴 Colombia", keys: ['colombia', 'bogota', 'bogotá', '018000', '01 8000'] },
                { id: "🇪🇸 España", keys: ['españa', 'spain', 'madrid', '900 ', '900-'] },
                { id: "🇲🇽 México", keys: ['mexico', 'méxico', 'ciudad de méxico', '800-'] },
                { id: "🇨🇱 Chile", keys: ['chile', 'santiago'] },
                { id: "🇵🇪 Perú", keys: ['peru', 'perú', 'lima'] },
                { id: "🇦🇷 Argentina", keys: ['argentina', 'buenos aires', 'caba'] },
                { id: "🇬🇧 Reino Unido", keys: ['uk', 'united kingdom', 'reino unido', 'london', 'w1t'] },
                { id: "🇳🇱 Sede Europea (Holanda)", keys: ['netherlands', 'holanda', 'países bajos', 'amsterdam', 'international b.v.', 'b.v.'] },
                { id: "🇩🇪 Alemania", keys: ['germany', 'alemania', 'berlin', 'münchen', 'munich', 'fragen?'] },
                { id: "🇯🇵 Japón", keys: ['japan', 'japón', 'tokyo', 'kk'] },
                { id: "🇰🇷 Corea del Sur", keys: ['korea', 'corea', 'seoul'] },
                { id: "🇨🇦 Canadá", keys: ['canada', 'canadá', 'toronto', 'vancouver'] },
                { id: "🇦🇺 Australia", keys: ['australia', 'sydney', 'nsw', '1800-'] },
                { id: "🇿🇦 Sudáfrica", keys: ['south africa', 'sudáfrica', 'johannesburg'] },
                { id: "🇮🇹 Italia", keys: ['italy', 'italia', 'roma', 'milano', 'per domande'] },
                { id: "🇹🇷 Turquía", keys: ['turkey', 'turquía', 'istanbul', 'şişli'] },
                { id: "🇳🇬 Nigeria", keys: ['nigeria', 'lagos'] },
                { id: "🇵🇭 Filipinas", keys: ['philippines', 'filipinas', 'manila'] },
                { id: "🇸🇬 Singapur", keys: ['singapore', 'singapur'] },
                { id: "🇵🇹 Portugal", keys: ['portugal', 'lisboa', 'lisbon'] },
                { id: "🇨🇭 Suiza", keys: ['switzerland', 'suiza', 'zurich'] },
                { id: "🇸🇪 Suecia", keys: ['sweden', 'suecia', 'stockholm'] },
                { id: "🇵🇱 Polonia", keys: ['poland', 'polonia', 'warsaw', 'warszawa'] }
            ];

            for (let regla of reglasPais) {
                if (regla.keys.some(k => textoCorreo.includes(k))) {
                    paisDetectado = regla.id;
                    break;
                }
            }

            let htmlRes = "";
            if (paisDetectado) {
                // Color azul bandera para éxito de país
                htmlRes = `<div style="font-size: 50px; margin: 40px auto; padding: 30px; background:#fff; color:#000; border-radius:15px; display:inline-block; border: 3px solid transparent; border-image: linear-gradient(to right, #0f0, #f00) 1; box-shadow: 0 0 20px rgba(255,255,255,0.3);">${paisDetectado}</div>`;
            } else {
                let fallbackText = "No se pudo extraer la dirección municipal 🇲🇽. Por favor, lee el mensaje completo.";
                let matchRegex = textoBruto.match(/(?:¿Preguntas|Questions|Des questions|Per domande|Fragen|Dudas)[\s\S]{1,250}/i);
                if (matchRegex) fallbackText = matchRegex[0].trim();

                // Naranja para advertencia
                htmlRes = `
                <div style="margin: 30px auto; padding: 20px; background:#222; border-radius:15px; display:inline-block; border: 3px solid #ffaa00; box-shadow: 0 0 20px rgba(255,170,0,0.3); max-width: 600px;">
                    <h3 style="color:#ffaa00; margin-top:0;">⚠️🇲🇽 País no detectado automáticamente</h3>
                    <p style="color:#ddd; font-size: 16px;">Pero encontramos esta información en el correo de BETFLIX MEXICO para que lo identifiques tú mismo:</p>
                    <div style="background:#000; padding:15px; border-radius:8px; border:1px solid #444; color:#0f0; font-family:monospace; font-size:16px; text-align:left; white-space: pre-wrap;">${fallbackText}</div>
                </div>`;
            }

            return res.send(`
            <div style="background:#000; text-align:center; padding:15px;"><a href="/dash" style="color:#fff; text-decoration:none; font-weight:bold; border: 1px solid #fff; padding: 8px 15px; border-radius: 5px;">⬅ VOLVER AL PANEL DE BETFLIX MEXICO</a></div>
            <div style="background:#111; color:white; padding: 40px; text-align:center; font-family:sans-serif; min-height:100vh;">
                <h2 style="color:#fff; font-size:30px; margin-bottom: 5px; text-shadow:0 0 10px #fff;">🌍 País de la Cuenta MUNICIPAL</h2>
                <p style="font-size: 18px; color:#aaa; margin-top: 0;">Analizando: <strong style="color:#fff;">${email_search}</strong></p>
                ${htmlRes}
            </div>`);
        }

        if (accion === 'ip') {
            const ipRegex = /\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b/g;
            const ipsEncontradas = textoCorreo.match(ipRegex);
            
            let ipUnicas = ipsEncontradas ? [...new Set(ipsEncontradas)] : [];
            ipUnicas = ipUnicas.filter(ip => !ip.startsWith('127.') && !ip.startsWith('10.') && !ip.startsWith('192.168.'));

            let ipContenido = "";
            if (ipUnicas.length > 0) {
                // Color rojo bandera para IPs
                ipContenido = ipUnicas.map(ip => `<div style="font-size: 35px; color:#f00; margin:10px 0; letter-spacing: 2px;">${ip}</div>`).join('');
            } else {
                ipContenido = `<div style="font-size: 20px; color:#f00; margin: 30px 0;">❌🇲🇽 No se detectó ninguna IP en el último correo.</div>`;
            }

            return res.send(`
            <div style="background:#000; text-align:center; padding:15px;"><a href="/dash" style="color:#fff; text-decoration:none; font-weight:bold; border: 1px solid #fff; padding: 8px 15px; border-radius: 5px;">⬅ VOLVER AL PANEL DE BETFLIX MEXICO</a></div>
            <div style="background:#111; color:white; padding: 40px; text-align:center; font-family:sans-serif; min-height:100vh;">
                <h2 style="color:#f00; font-size:30px; margin-bottom: 5px; text-shadow:0 0 10px #f00;">📡 Registro de IP MUNICIPAL</h2>
                <p style="font-size: 18px; color:#aaa; margin-top: 0;">Analizando: <strong style="color:#fff;">${email_search}</strong></p>
                <div style="margin: 40px auto; padding: 30px; background:#222; border-radius:15px; display:inline-block; border: 3px solid #f00; min-width:300px; box-shadow: 0 0 20px rgba(255,0,0,0.3);">
                    ${ipContenido}
                </div>
            </div>`);
        }

        // Vista de mensaje en crudo (mantener fondo blanco para lectura)
        res.send(`<div style="background:#000; text-align:center; padding:15px;"><a href="/dash" style="color:#fff; text-decoration:none; font-weight:bold; border: 1px solid #fff; padding: 8px 15px; border-radius: 5px;">⬅ VOLVER AL PANEL DE BETFLIX MEXICO</a></div><div style="background:white; color:black; padding: 20px; margin: 0 auto; max-width: 800px;">${mail.html || mail.text}</div>`);
    
    } catch (e) { 
        res.send(`<div style="background:#000; text-align:center; padding:20px; color:white; font-family:sans-serif;"><h2>⚠️🇲🇽 Error de conexión MUNICIPAL en BETFLIX MEXICO.</h2><p>${e.message}</p><br><a href="/dash" style="color:#0f0; text-decoration:none;">⬅ VOLVER AL PANEL</a></div>`); 
    }
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });
app.listen(process.env.PORT || 80);
