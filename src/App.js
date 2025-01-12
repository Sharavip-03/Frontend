const apiUrl = 'http://localhost:5000';  // Cambiar si el backend está en un puerto diferente

// Función para validar el formulario de login
function validarLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    let valid = true;

    if (!email) {
        document.getElementById('loginEmailError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('loginEmailError').style.display = 'none';
    }

    if (!password) {
        document.getElementById('loginPasswordError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('loginPasswordError').style.display = 'none';
    }

    if (valid) {
        login(email, password);
    }
}

// Iniciar sesión
function login(email, password) {
    fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, contrasena: password })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Verifica lo que devuelve el servidor
        if (data && data.mensaje === 'Inicio de sesión exitoso') {
            alert('Inicio de sesión exitoso');
            // Realiza las acciones después del login exitoso (por ejemplo, redirigir)
        } else {
            alert('Email o contraseña incorrectos');
        }
    })
    .catch(error => {
        console.error('Error en el login:', error);
        alert('Hubo un error en el proceso de inicio de sesión');
    });
}

// Función para validar el formulario de signup
function validarSignin(event) {
    event.preventDefault();

    const nombres = document.getElementById('signUpNombres').value;
    const apellidos = document.getElementById('signUpApellidos').value;
    const telefono = document.getElementById('signUpTelefono').value;
    const email = document.getElementById('signUpEmail').value;
    const tipo_doc = document.getElementById('signUpTipoDoc').value;
    const num_documento = document.getElementById('signUpDocumento').value;
    const direccion = document.getElementById('signUpDireccion').value;
    const contrasena = document.getElementById('signUpContrasena').value;
    const confirmContrasena = document.getElementById('signUpConfirmContrasena').value;

    let valid = true;

    // Validación de campos
    if (!nombres) {
        document.getElementById('signUpNombresError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('signUpNombresError').style.display = 'none';
    }

    if (!apellidos) {
        document.getElementById('signUpApellidosError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('signUpApellidosError').style.display = 'none';
    }

    if (!telefono) {
        document.getElementById('signUpTelefonoError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('signUpTelefonoError').style.display = 'none';
    }

    if (!email) {
        document.getElementById('signUpEmailError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('signUpEmailError').style.display = 'none';
    }

    if (!tipo_doc) {
        document.getElementById('signUpTipoDocError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('signUpTipoDocError').style.display = 'none';
    }

    if (!num_documento) {
        document.getElementById('signUpDocumentoError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('signUpDocumentoError').style.display = 'none';
    }

    if (!direccion) {
        document.getElementById('signUpDireccionError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('signUpDireccionError').style.display = 'none';
    }

    if (!contrasena || contrasena.length < 8) {
        document.getElementById('signUpContrasenaError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('signUpContrasenaError').style.display = 'none';
    }

    if (contrasena !== confirmContrasena) {
        document.getElementById('signUpConfirmContrasenaError').style.display = 'block';
        valid = false;
    } else {
        document.getElementById('signUpConfirmContrasenaError').style.display = 'none';
    }

    if (valid) {
        signin(nombres, apellidos, telefono, email, contrasena);
    }
}

// Crear cuenta
function signin(nombres, apellidos, telefono, email, tipo_doc, num_documento, direccion, contrasena) {
    fetch(`${apiUrl}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombres: nombres,
            apellidos: apellidos,
            telefono: telefono,
            email: email,
            tipo_doc: tipo_doc,
            num_documento: num_documento,
            direccion: direccion,
            contrasena: contrasena
        })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.mensaje);
            if (data.token_de_acceso) {
                alert('Usuario creado exitosamente');
                localStorage.setItem('token', data.token_de_acceso);  // Guarda el token en el localStorage
                document.getElementById('signinForm').style.display = 'none';
                document.getElementById('loginForm').style.display = 'block';
            }
        })
        .catch(error => console.error('Error en el signup:', error));
}

// Event listeners para los formularios
document.getElementById('login').addEventListener('submit', validarLogin);
document.getElementById('signin').addEventListener('submit', validarSignUp);