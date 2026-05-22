const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const app = express();

// 📂 BASE DE DATOS (Ruta para el disco persistente de Render)
const db = new sqlite3.Database('/data/betflix_mexico_v1.db');

const MI_CORREO = 'andreavalencia6012@gmail.com';
const MI_CLAVE = 'fpgorosihjkqgqjk'; 

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'betflix_mexico_ultra_secure_2026_MX_premium',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT UNIQUE, pass TEXT, rol TEXT, creado_por INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS correos (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, user_id INTEGER)");
    db.run("ALTER TABLE usuarios ADD COLUMN creado_por INTEGER", (err) => {});
    db.run("INSERT OR IGNORE INTO usuarios (user, pass, rol, creado_por) VALUES ('ruben', '123456', 'Administrador', NULL)");
});

// 🔥 ESTILOS PROFESIONALES Y MINIMALISTAS - REDISEÑO TOTAL 🔥
const CSS_MODERNO = `
<style>
    /* Importación de Fuente Profesional 'Inter' */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :root {
        --bg-deep: #050505;
        --bg-panel: rgba(18, 18, 18, 0.85);
        --bg-sidebar: #0a0a0a;
        --text-primary: #ffffff;
        --text-secondary: #a0a0a0;
        --mx-green: #00e676;
        --mx-green-dim: rgba(0, 230, 118, 0.1);
        --mx-red: #ff1744;
        --mx-red-dim: rgba(255, 23, 68, 0.1);
        --mx-white: #f5f5f5;
        --border-color: #262626;
    }

    @keyframes led-glow { 
        0% { border-color: var(--mx-green); box-shadow: 0 0 10px var(--mx-green-dim); } 
        33% { border-color: var(--mx-white); box-shadow: 0 0 10px rgba(255,255,255,0.1); } 
        66% { border-color: var(--mx-red); box-shadow: 0 0 10px var(--mx-red-dim); } 
        100% { border-color: var(--mx-green); box-shadow: 0 0 10px var(--mx-green-dim); } 
    }
    
    body { background: var(--bg-deep); color: var(--text-primary); font-family: 'Inter', sans-serif; margin: 0; padding: 0; box-sizing: border-box; overflow-x: hidden; }
    
    /* Sutiles gradientes de fondo profesional */
    body::after { content: ""; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 10% 10%, rgba(0, 230, 118, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(255, 23, 68, 0.05) 0%, transparent 40%); z-index: -1; }

    /* Cabecera Superior Minimalista */
    .top-header { background: rgba(10, 10, 10, 0.8); backdrop-filter: blur(10px); padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    .top-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 10px; }
    .top-header .brand-mx { background: linear-gradient(to right, var(--mx-green), var(--mx-white), var(--mx-red)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .top-header .user-badge { background: #1a1a1a; color: var(--text-secondary); padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; border: 1px solid #333; text-transform: uppercase; letter-spacing: 0.5px; }
    
    /* Estructura Dashboard */
    .dashboard-layout { display: flex; min-height: calc(100vh - 61px); }
    
    /* Sidebar Profesional */
    .sidebar { width: 280px; background: var(--bg-sidebar); padding: 30px 20px; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px; position: sticky; top: 61px; height: calc(100vh - 61px); box-sizing: border-box; }
    .sidebar-title { color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 20px 0 8px 15px; font-weight: 700; }
    
    .main-content { flex: 1; padding: 40px; background: transparent; overflow-y: auto; box-sizing: border-box; }
    
    /* Botones del Sidebar Elevados */
    .tab-btn { background: transparent; color: var(--text-secondary); border: none; padding: 12px 15px; border-radius: 8px; text-align: left; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 12px; width: 100%; box-sizing: border-box; }
    .tab-btn:hover { background: #141414; color: var(--text-primary); }
    .tab-btn.active { background: #1a1a1a; color: var(--mx-green); font-weight: 700; border-left: 3px solid var(--mx-green); border-radius: 2px 8px 8px 2px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
    
    /* Sección inferior del sidebar */
    .sidebar-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px; }

    /* Paneles de Contenido Minimalistas */
    .tab-panel { display: none; background: var(--bg-panel); backdrop-filter: blur(10px); padding: 40px; border-radius: 16px; border: 1px solid var(--border-color); animation: fadeIn 0.3s ease; max-width: 1000px; margin: 0 auto; box-shadow: 0 15px 50px rgba(0,0,0,0.6); box-sizing: border-box; }
    .tab-panel.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* Encabezados de Panel Limpios */
    .panel-header { border-bottom: 1px solid var(--border-color); padding-bottom: 20px; margin-bottom: 30px; }
    .panel-header h3 { margin: 0; color: var(--text-primary); font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .panel-header p { margin: 8px 0 0 0; color: var(--text-secondary); font-size: 14px; font-weight: 400; line-height: 1.5; }

    /* Entradas de Formulario Profesionales */
    input, select, textarea { width: 100%; padding: 14px 16px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #333; background: rgba(0,0,0,0.3); color: var(--text-primary); box-sizing: border-box; font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif; transition: 0.2s; }
    input:focus, select:focus, textarea:focus { border-color: var(--mx-green); outline: none; background: rgba(0,0,0,0.5); box-shadow: 0 0 10px var(--mx-green-dim); }
    input::placeholder { color: #555; }
    
    /* Botones Profesionales */
    button.action-btn, .action-btn-link { color: white; border: none; padding: 14px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; width: 100%; box-sizing: border-box; text-transform: uppercase; font-size: 13px; font-family: 'Inter', sans-serif; transition: all 0.2s ease; letter-spacing: 0.5px; display: inline-flex; justify-content: center; align-items: center; text-decoration: none; }
    button.action-btn:hover, .action-btn-link:hover { opacity: 0.9; transform: translateY(-1px); }
    button.action-btn:active, .action-btn-link:active { transform: translateY(0); opacity: 1; }
    
    .btn-green-mx { background: linear-gradient(135deg, #00c853 0%, #008000 100%); color: #000; box-shadow: 0 4px 15px rgba(0,255,0,0.15); }
    .btn-white-mx { background: #fff; color: #000; box-shadow: 0 4px 15px rgba(255,255,255,0.15); }
    .btn-red-mx { background: linear-gradient(135deg, #ff1744 0%, #a00 100%); color: #fff; box-shadow: 0 4px 15px rgba(255,0,0,0.15); }
    
    /* Botones de Peligro del Sidebar */
    .danger-btn-sidebar { background: transparent; border: 1px solid #333; color: #666; padding: 10px 15px; text-align: center; border-radius: 8px; font-size: 11px; text-decoration: none; display: flex; align-items: center; gap: 10px; font-weight: 600; transition: 0.2s; text-transform: uppercase; letter-spacing: 0.5px; width: 100%; box-sizing: border-box; }
    .danger-btn-sidebar:hover { background: rgba(255, 23, 68, 0.05); border-color: var(--mx-red); color: var(--mx-red); }
    .danger-btn-sidebar.logout:hover { background: rgba(255, 255, 255, 0.05); border-color: var(--mx-white); color: var(--mx-white); }

    /* Carpetas de Usuarios Elevadas */
    .folder { background: #0d0d0d; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; margin-bottom: 15px; transition: 0.2s; }
    .folder:hover { border-color: #333; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
    .folder summary { padding: 18px 25px; font-weight: 600; font-size: 15px; color: var(--text-primary); cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
    .folder summary::-webkit-details-marker { display: none; }
    .folder summary .folder-arrow { color: #555; transition: 0.2s; font-size: 12px; }
    .folder[open] summary .folder-arrow { transform: rotate(180deg); color: var(--mx-green); }
    
    .folder summary .user-count { font-size: 11px; background: #1a1a1a; color: var(--text-secondary); padding: 4px 10px; border-radius: 12px; border: 1px solid #333; font-weight: 500; }

    .folder-content { padding: 25px; background: #111; border-top: 1px solid var(--border-color); }

    /* Tarjetas de Clientes Minimalistas */
    .client-card { background: #080808; border: 1px solid var(--border-color); padding: 20px; margin-bottom: 15px; border-radius: 10px; position: relative; border-left: 3px solid; transition: 0.2s; }
    .client-card:hover { border-color: #333; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .client-card strong { font-size: 15px; font-weight: 600; }
    .del-btn { position: absolute; top: 20px; right: 20px; color: #444; text-decoration: none; font-weight: bold; font-size: 16px; transition: 0.2s; }
    .del-btn:hover { color: var(--mx-red); transform: scale(1.1); }
    
    .email-list { max-height: 150px; overflow-y: auto; background: #050505; padding: 10px; border-radius: 6px; margin-top: 15px; font-size: 13px; border: 1px solid #1a1a1a; }
    .email-item { display: flex; justify-content: space-between; border-bottom: 1px solid #111; padding: 8px 5px; color: #aaa; }
    .email-item:last-child { border-bottom: none; }
</style>

<script>
    function openTab(tabId) {
        // Ocultar todos los paneles
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        // Quitar estado activo de todos los botones
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        
        // Activar el seleccionado
        document.getElementById(tabId).classList.add('active');
        document.querySelector('[onclick="openTab(\\''+tabId+'\\')"]').classList.add('active');
        
        // Guardar en memoria
        localStorage.setItem('activeBetflixTab', tabId);
    }

    document.addEventListener('DOMContentLoaded', () => {
        let active = localStorage.getItem('activeBetflixTab') || 'panel-stream';
        openTab(active);
    });

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

app.use((req, res, next) => {
    const rutasAbiertas = ['/', '/login', '/logout'];
    if (rutasAbiertas.includes(req.path)) return next();
    if (req.session && req.session.uid) {
        db.get("SELECT id FROM usuarios WHERE id = ?", [req.session.uid], (err, row) => {
            if (!row) {
                req.session.destroy();
                return res.send("<script>alert('⛔ 🇲🇽 ACCESO DENEGADO \\n\\nTu cuenta ha sido eliminada.'); window.location='/';</script>");
            }
            next();
        });
    } else { return res.redirect('/'); }
});

// PANTALLA DE LOGIN - Rediseño Total Minimalista y Profesional
app.get('/', (req, res) => {
    const ESTILO_LOGIN = `
    <style>
        /* Importación de Fuente Profesional 'Inter' */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :root {
            --bg-deep: #050505;
            --bg-panel: rgba(15, 15, 15, 0.85);
            --text-primary: #ffffff;
            --text-secondary: #a0a0a0;
            --mx-green: #00e676;
            --mx-red: #ff1744;
            --mx-white: #f5f5f5;
        }

        body { background: var(--bg-deep); color: var(--text-primary); font-family: 'Inter', sans-serif; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; position: relative; }
        
        /* Sutiles gradientes de fondo profesional */
        body::after { content: ""; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 10% 10%, rgba(0, 230, 118, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 90%, rgba(255, 23, 68, 0.08) 0%, transparent 40%); z-index: -1; }
        
        .login-panel { position: relative; background: var(--bg-panel); backdrop-filter: blur(15px); padding: 60px 40px; border-radius: 20px; border: 1px solid #262626; animation: led-glow 5s infinite linear; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.7); }
        
        .logo-mx { font-size: 28px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; letter-spacing: -1px; }
        .logo-mx .green { color: var(--mx-green); } .logo-mx .white { color: var(--mx-white); } .logo-mx .red { color: var(--mx-red); }
        
        h2 { color: var(--text-secondary); margin-bottom: 35px; font-weight: 500; font-size: 14px; margin-top: 0; }
        
        input { width: 100%; padding: 16px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #333; background: rgba(0,0,0,0.3); color: white; box-sizing: border-box; font-size: 15px; font-weight: 500; transition: 0.2s; }
        input:focus { border-color: var(--mx-green); outline: none; background: rgba(0,0,0,0.5); box-shadow: 0 0 10px rgba(0,230,118,0.1); }
        input::placeholder { color: #555; }
        
        .btn-neon-green { background: linear-gradient(135deg, #00c853 0%, #008000 100%); color: #000; border: none; padding: 16px; border-radius: 8px; cursor: pointer; font-weight: 700; width: 100%; text-transform: uppercase; font-size: 14px; letter-spacing: 0.5px; border: 1px solid var(--mx-green); box-shadow: 0 4px 20px rgba(0,255,0,0.2); transition: all 0.2s ease; }
        .btn-neon-green:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 25px rgba(0,255,0,0.3); }
        .btn-neon-green:active { transform: translateY(0); }
    </style>
    `;
    res.send(`${ESTILO_LOGIN}
    <div class="login-panel">
        <div class="logo-mx"><span class="green">⚡ BET</span><span class="white">FLIX</span> <br><span class="red">M É X I C O</span></div>
        <h2>Acceso al Panel de Control Profesional</h2>
        <form action="/login" method="POST">
            <input name="user" placeholder="Nombre de Usuario" required>
            <input type="password" name="pass" placeholder="Contraseña" required>
            <button class="btn-neon-green">🔓 Iniciar Sesión</button>
        </form>
    </div>`);
});

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    db.get("SELECT * FROM usuarios WHERE user = ? AND pass = ?", [user, pass], (err, row) => {
        if (row) { req.session.uid = row.id; req.session.user = row.user; req.session.rol = row.rol; res.redirect('/dash'); } 
        else { res.send("<script>alert('⛔ Datos de acceso incorrectos.'); window.location='/';</script>"); }
    });
});

app.get('/admin/logout-todos', (req, res) => {
    if (req.session.user === 'ruben' || req.session.rol === 'Administrador') {
        req.sessionStore.clear(() => res.send("<script>alert('✅ Se ha cerrado la sesión de TODOS los usuarios conectados.'); window.location='/';</script>"));
    } else { res.redirect('/dash'); }
});

app.get('/admin/nuke-database', (req, res) => {
    if (req.session.user === 'ruben' || req.session.rol === 'Administrador') {
        db.run("DELETE FROM correos", [], () => {
            db.run("DELETE FROM usuarios WHERE user != 'ruben'", [], () => {
                res.send("<script>alert('💥 BASE DE DATOS REINICIADA MUNICIPALMENTE. Todos los datos han sido borrados.'); window.location='/dash';</script>");
            });
        });
    } else { res.redirect('/dash'); }
});

app.get('/dash', (req, res) => {
    const esAdminPrincipal = (req.session.user === 'ruben' || req.session.rol === 'Administrador');
    const esSubAdmin = (req.session.rol === 'Subadministrador');

    if (esAdminPrincipal || esSubAdmin) {
        
        let query = esAdminPrincipal ? "SELECT * FROM usuarios WHERE user != 'ruben'" : "SELECT * FROM usuarios WHERE creado_por = ? OR id = ?";
        let params = esAdminPrincipal ? [] : [req.session.uid, req.session.uid];

        db.all(query, params, (err, usuarios) => {
            db.all("SELECT * FROM correos", [], (err, correos) => {
                
                let subadmins = usuarios.filter(u => u.rol === 'Subadministrador');
                let clientes = usuarios.filter(u => u.rol === 'Cliente');
                if (esSubAdmin) subadmins = usuarios.filter(u => u.id === req.session.uid);

                let htmlUsuarios = "";
                
                subadmins.forEach(sub => {
                    let clientesDelSub = clientes.filter(c => c.creado_por === sub.id);
                    htmlUsuarios += `
                    <details class="folder item-folder">
                        <summary>
                            <span>📁 ${sub.user.toUpperCase()} <span style="font-size:11px; color:#666; font-weight:500;">(Subadmin)</span></span>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span class="user-count">${clientesDelSub.length} usuarios</span>
                                <span class="folder-arrow">▼</span>
                            </div>
                        </summary>
                        <div class="folder-content">
                            <a href="/admin/del-user/${sub.id}" class="action-btn-link btn-red-mx" style="margin-bottom:25px; padding: 10px; font-size:11px;" onclick="return confirm('⚠️ Borrar a ${sub.user.toUpperCase()} borrará a sus clientes. ¿Seguro?')">❌ ELIMINAR SUBADMINISTRADOR Y DATOS</a>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">`;
                            
                            clientesDelSub.forEach(cli => {
                                let correosDelCli = correos.filter(c => c.user_id === cli.id);
                                htmlUsuarios += `
                                <div class="client-card item-client" style="border-left-color: var(--mx-green);">
                                    <strong style="color: var(--mx-green);">👤 ${cli.user}</strong>
                                    <a href="/admin/del-user/${cli.id}" class="del-btn" onclick="return confirm('¿Borrar cliente?')">×</a>
                                    <form action="/admin/add-mail-masivo" method="POST" style="margin-top:15px; display:flex; gap:8px;">
                                        <input type="hidden" name="uid" value="${cli.id}">
                                        <input name="emails" placeholder="Pega correos..." style="padding:10px; margin:0; font-size:13px;">
                                        <button class="action-btn btn-green-mx" style="width:auto; padding:10px 15px; font-size:12px;">📥</button>
                                    </form>
                                    <div class="email-list">`;
                                        correosDelCli.forEach(m => {
                                            htmlUsuarios += `<div class="email-item"><span>${m.email}</span> <a href="/admin/del-mail/${m.id}" style="color:#f00; text-decoration:none;">×</a></div>`;
                                        });
                                htmlUsuarios += `</div></div>`;
                            });
                    htmlUsuarios += `</div></details>`;
                });

                if (esAdminPrincipal) {
                    let clientesDirectos = clientes.filter(c => !c.creado_por);
                    if(clientesDirectos.length > 0) {
                        htmlUsuarios += `<h4 style="color:var(--text-primary); margin-top:40px; border-bottom:1px solid var(--border-color); padding-bottom:12px; font-size:16px; font-weight:600;">👤 Clientes Directos (BETFLIX MEXICO)</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">`;
                        clientesDirectos.forEach(cli => {
                            let correosDelCli = correos.filter(c => c.user_id === cli.id);
                            htmlUsuarios += `
                            <div class="client-card item-client" style="border-left-color: var(--mx-red);">
                                <strong style="color: var(--mx-red);">👤 ${cli.user}</strong>
                                <a href="/admin/del-user/${cli.id}" class="del-btn" onclick="return confirm('¿Borrar cliente?')">×</a>
                                <form action="/admin/add-mail-masivo" method="POST" style="margin-top:15px; display:flex; gap:8px;">
                                    <input type="hidden" name="uid" value="${cli.id}">
                                    <input name="emails" placeholder="Pega correos..." style="padding:10px; margin:0; font-size:13px;">
                                    <button class="action-btn btn-red-mx" style="width:auto; padding:10px 15px; font-size:12px;">📥</button>
                                </form>
                                <div class="email-list">`;
                                    correosDelCli.forEach(m => {
                                        htmlUsuarios += `<div class="email-item"><span>${m.email}</span> <a href="/admin/del-mail/${m.id}" style="color:#f00; text-decoration:none;">×</a></div>`;
                                    });
                            htmlUsuarios += `</div></div>`;
                        });
                        htmlUsuarios += `</div>`;
                    }
                }

                // ESTRUCTURA HTML FINAL PROFESIONAL (Con Sidebar y los nuevos nombres limpios)
                res.send(`
                ${CSS_MODERNO}
                <div class="top-header">
                    <h2><span class="brand-mx">⚡ BET</span>FLIX</h2>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <span class="user-badge">${req.session.user} | ${req.session.rol}</span>
                        <a href="/logout" style="color:var(--text-secondary); text-decoration:none; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">SALIR</a>
                    </div>
                </div>
                
                <div class="dashboard-layout">
                    <div class="sidebar">
                        <div class="sidebar-title">Herramientas</div>
                        <button class="tab-btn" onclick="openTab('panel-stream')">📨 Leer Correos</button>
                        <button class="tab-btn" onclick="openTab('panel-buscar')">🔎 Buscar Dueño</button>
                        
                        <div class="sidebar-title" style="margin-top:20px;">Gestión</div>
                        <button class="tab-btn" onclick="openTab('panel-registrar')">➕ Crear Usuario</button>
                        <button class="tab-btn" onclick="openTab('panel-usuarios')">👥 Base de Usuarios</button>
                        
                        <div class="sidebar-footer">
                        ${esAdminPrincipal ? `
                            <a href="/admin/logout-todos" class="danger-btn-sidebar logout" onclick="return confirm('Cerrar sesión de TODOS?')">🛑 Desconectar Todos</a>
                            <a href="/admin/nuke-database" class="danger-btn-sidebar" onclick="return confirm('⚠️ FORMATAR BASE DE DATOS MUNICIPAL. SEGURO?')">💥 Formatear Sistema</a>
                        ` : ''}
                        </div>
                    </div>

                    <div class="main-content">
                        
                        <div id="panel-stream" class="tab-panel">
                            <div class="panel-header">
                                <h3>📨 Leer Correos de Plataformas</h3>
                                <p>Extracción IMAP en tiempo real para Netflix, Disney+, etc.</p>
                            </div>
                            <form action="/buscar" method="POST">
                                <input name="email_search" placeholder="Introduce el correo a buscar..." required style="border-color: #444; background: rgba(255,255,255,0.03);">
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 10px;">
                                    <button type="submit" name="accion" value="mensaje" class="action-btn btn-green-mx">📩 Leer Mensaje</button>
                                    <button type="submit" name="accion" value="pais" class="action-btn btn-white-mx">🌍 Analizar País</button>
                                    <button type="submit" name="accion" value="ip" class="action-btn btn-red-mx">📡 Buscar IP</button>
                                </div>
                            </form>
                        </div>

                        <div id="panel-buscar" class="tab-panel">
                            <div class="panel-header">
                                <h3>🔎 Buscar Dueño de Cuenta</h3>
                                <p>Rastreo local para identificar qué cliente tiene asignado un correo.</p>
                            </div>
                            <input type="text" id="buscadorLocal" onkeyup="buscarCorreoLocal(); openTab('panel-usuarios');" placeholder="Escribe un correo o nombre para filtrar..." style="border-color:#ffaa00;">
                            <p style="color:#555; font-size:13px; text-align:center; font-style:italic;">Al escribir, el sistema saltará automáticamente a la Base de Usuarios para mostrarte el resultado.</p>
                        </div>

                        <div id="panel-registrar" class="tab-panel">
                            <div class="panel-header">
                                <h3>➕ Crear Nuevo Usuario</h3>
                                <p>Alta de clientes normales o subadministradores.</p>
                            </div>
                            <form action="/admin/crear" method="POST">
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                                    <input name="n" placeholder="Nombre de Usuario" required>
                                    <input name="c" placeholder="Contraseña de Acceso" required>
                                </div>
                                <select name="r">
                                    <option value="Cliente">Perfil: Cliente Normal</option>
                                    ${esAdminPrincipal ? '<option value="Subadministrador">Perfil: Subadministrador</option>' : ''}
                                </select>
                                <button class="action-btn btn-white-mx" style="margin-top:10px;">Confirmar y Crear</button>
                            </form>
                        </div>

                        <div id="panel-usuarios" class="tab-panel">
                            <div class="panel-header">
                                <h3>👥 Base de Usuarios MUNICIPAL</h3>
                                <p>Gestión centralizada de subadmins, clientes y correos asignados.</p>
                            </div>
                            ${htmlUsuarios || '<p style="color:#555; text-align:center; font-style:italic; font-size:14px; margin-top:40px;">No hay usuarios registrados en el sistema.</p>'}
                        </div>

                    </div>
                </div>
                </body>`);
            });
        });

    } else {
        // VISTA CLIENTE NORMAL - Elevada y Profesional
        res.send(`
        ${CSS_MODERNO}
        <div class="top-header">
            <h2><span class="brand-mx">⚡ BET</span>FLIX</h2>
            <div style="display:flex; align-items:center; gap:15px;">
                <span class="user-badge">${req.session.user}</span>
                <a href="/logout" style="color:var(--mx-red); text-decoration:none; font-weight:700; font-size:12px; text-transform:uppercase;">SALIR</a>
            </div>
        </div>
        <div style="padding: 60px 20px; display:flex; justify-content:center;">
            <div class="tab-panel active" style="margin: 0; width:100%; max-width:600px; display: block; padding: 40px;">
                <div class="panel-header" style="text-align:center;">
                    <h3>📨 Leer Correos de Plataformas</h3>
                    <p>Introduce el correo de streaming para extraer el mensaje.</p>
                </div>
                <form action="/buscar" method="POST">
                    <input name="email_search" placeholder="Correo a buscar..." required style="text-align:center; border-color: #444; background: rgba(255,255,255,0.03);">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px;">
                        <button type="submit" name="accion" value="mensaje" class="action-btn btn-green-mx">📩 Leer</button>
                        <button type="submit" name="accion" value="pais" class="action-btn btn-white-mx">🌍 País</button>
                        <button type="submit" name="accion" value="ip" class="action-btn btn-red-mx">📡 IP</button>
                    </div>
                </form>
            </div>
        </div></body>`);
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
        let insertados = 0, repetidos = [];
        list.forEach(m => {
            let correoLimpio = m.trim().toLowerCase();
            if (correosExistentes[correoLimpio]) repetidos.push(`${correoLimpio} (Asignado a: ${correosExistentes[correoLimpio]})`);
            else { stmt.run(correoLimpio, req.body.uid); insertados++; }
        });
        stmt.finalize(); 
        if (repetidos.length > 0) res.send(`<script>alert('✅ Se guardaron ${insertados} correos.\\n⚠️ Bloqueados (Ya existen):\\n${repetidos.slice(0,5).join('\\n')}...'); window.location='/dash';</script>'); 
        else res.redirect('/dash'); 
    });
});

app.get('/admin/del-user/:id', (req, res) => {
    db.run("DELETE FROM usuarios WHERE id = ?", [req.params.id], () => { db.run("DELETE FROM correos WHERE user_id = ?", [req.params.id], () => res.redirect('/dash')); });
});
app.get('/admin/del-mail/:id', (req, res) => { db.run("DELETE FROM correos WHERE id = ?", [req.params.id], () => res.redirect('/dash')); });

app.post('/buscar', async (req, res) => {
    const { email_search, accion } = req.body;
    const config = { imap: { user: MI_CORREO, password: MI_CLAVE, host: 'imap.gmail.com', port: 993, tls: true, tlsOptions: { rejectUnauthorized: false } } };
    
    try {
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');
        const messages = await connection.search([['TEXT', email_search.trim()]], { bodies: [''], struct: true });
        
        if (messages.length === 0) { 
            connection.end(); 
            return res.send(`<div style="background:#000; text-align:center; padding:40px; color:white; font-family: 'Inter', sans-serif;"><h2>❌ No se encontró ningún correo para:<br><span style="color:var(--mx-green);">${email_search}</span></h2><br><a href="/dash" style="color:var(--text-secondary); text-decoration:none; border: 1px solid #333; padding: 10px 20px; border-radius: 8px; font-size:13px; font-weight:600;">⬅ VOLVER AL PANEL</a></div>`); 
        }
        
        messages.sort((a, b) => b.attributes.uid - a.attributes.uid);
        const mail = await simpleParser(messages[0].parts.find(p => p.which === '').body);
        connection.end();

        const textoBruto = mail.text || String(mail.html).replace(/<[^>]*>?/gm, ' ') || "";
        const textoCorreo = textoBruto.toLowerCase();

        // MOTOR DE PAÍSES Y RENDERIZADO (Sin cambios lógicos)
        if (accion === 'pais') {
            let paisDetectado = null;
            const reglasPais = [ { id: "🇺🇸 Estados Unidos", keys: ['ee. uu.', 'usa', 'united states', 'los gatos', 'california', '1-866-', '1-844-', '1-800-', '1-888-', '1-877-'] }, { id: "🇫🇷 Francia", keys: ['france', 'francia', 'paris', 's.a.s.'] }, { id: "🇮🇳 India", keys: ['india', 'mumbai', 'maharashtra'] }, { id: "🇧🇷 Brasil", keys: ['brasil', 'brazil', 'alphaville', 'são paulo', '0800-'] }, { id: "🇨🇴 Colombia", keys: ['colombia', 'bogota', 'bogotá', '018000', '01 8000'] }, { id: "🇪🇸 España", keys: ['españa', 'spain', 'madrid', '900 ', '900-'] }, { id: "🇲🇽 México", keys: ['mexico', 'méxico', 'ciudad de méxico', '800-'] }, { id: "🇨🇱 Chile", keys: ['chile', 'santiago'] }, { id: "🇵🇪 Perú", keys: ['peru', 'perú', 'lima'] }, { id: "🇦🇷 Argentina", keys: ['argentina', 'buenos aires'] }, { id: "🇬🇧 Reino Unido", keys: ['uk', 'united kingdom', 'london'] }, { id: "🇳🇱 Holanda (Europa)", keys: ['netherlands', 'holanda', 'amsterdam'] }, { id: "🇩🇪 Alemania", keys: ['germany', 'alemania', 'berlin'] }, { id: "🇯🇵 Japón", keys: ['japan', 'japón', 'tokyo'] } ];
            for (let regla of reglasPais) { if (regla.keys.some(k => textoCorreo.includes(k))) { paisDetectado = regla.id; break; } }
            
            let htmlRes = paisDetectado ? `<div style="font-size: 50px; margin: 40px auto; padding: 30px; background:#fff; color:#000; border-radius:15px; display:inline-block; border-bottom: 5px solid #f00; border-top: 5px solid #0f0;">${paisDetectado}</div>` : `<div style="margin: 30px auto; padding: 20px; background:#222; border-radius:15px; display:inline-block; border: 1px solid #ffaa00;"><h3 style="color:#ffaa00; margin-top:0;">⚠️ País no detectado automáticamente</h3></div>`;
            return res.send(`<div style="background:#000; text-align:center; padding:15px;"><a href="/dash" style="color:#fff; text-decoration:none; border: 1px solid #fff; padding: 8px 15px; border-radius: 5px; font-family:'Inter', sans-serif;">⬅ VOLVER AL PANEL</a></div><div style="background:#111; color:white; padding: 40px; text-align:center; font-family:'Inter', sans-serif; min-height:100vh;"><h2>🌍 Análisis de País</h2><p>Correo: <strong style="color:var(--mx-green);">${email_search}</strong></p>${htmlRes}</div>`);
        }

        if (accion === 'ip') {
            const ipsEncontradas = textoCorreo.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g);
            let ipUnicas = ipsEncontradas ? [...new Set(ipsEncontradas)].filter(ip => !ip.startsWith('127.') && !ip.startsWith('10.') && !ip.startsWith('192.168.')) : [];
            let ipContenido = ipUnicas.length > 0 ? ipUnicas.map(ip => `<div style="font-size: 35px; color:#f00; margin:10px 0;">${ip}</div>`).join('') : `<div style="font-size: 20px; color:#f00; margin: 30px 0;">❌ No se detectó ninguna IP.</div>`;
            return res.send(`<div style="background:#000; text-align:center; padding:15px;"><a href="/dash" style="color:#fff; text-decoration:none; border: 1px solid #fff; padding: 8px 15px; border-radius: 5px; font-family:'Inter', sans-serif;">⬅ VOLVER AL PANEL</a></div><div style="background:#111; color:white; padding: 40px; text-align:center; font-family:'Inter', sans-serif; min-height:100vh;"><h2 style="color:#f00;">📡 Registro de IP</h2><p>Correo: <strong style="color:var(--mx-green);">${email_search}</strong></p><div style="margin: 40px auto; padding: 30px; background:#222; border-radius:15px; display:inline-block; border: 1px solid #f00;">${ipContenido}</div></div>`);
        }

        res.send(`<div style="background:#000; text-align:center; padding:15px;"><a href="/dash" style="color:#fff; text-decoration:none; border: 1px solid #fff; padding: 8px 15px; border-radius: 5px; font-family:'Inter', sans-serif;">⬅ VOLVER AL PANEL</a></div><div style="background:white; color:black; padding: 20px; margin: 0 auto; max-width: 800px; font-family:'Inter', sans-serif;">${mail.html || mail.text}</div>`);
    
    } catch (e) { res.send(`<div style="background:#000; text-align:center; padding:40px; color:white; font-family: 'Inter', sans-serif;"><h2>⚠️ Error de conexión IMAP MUNICIPAL</h2><p>${e.message}</p><br><a href="/dash" style="color:#fff; text-decoration:none; border: 1px solid #fff; padding: 10px 20px; border-radius: 8px;">⬅ VOLVER AL PANEL</a></div>`); }
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });
app.listen(process.env.PORT || 80);
