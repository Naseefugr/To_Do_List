document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    auth.onAuthStateChanged(user => {
        if (user) {
            // Check if the current page is index.html or admin.html and redirect to dashboard.html
            if (window.location.pathname.includes('index.html') || window.location.pathname.includes('admin.html')) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // If not logged in and on dashboard.html, redirect to index.html
            if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('admin.html')) {
                window.location.href = 'index.html';
            }
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm['loginEmail'].value;
            const password = loginForm['loginPassword'].value;
            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // Check if it's an admin login
                    if (email === "admin@gmail.com") { // Replace with your actual admin email
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "dashboard.html";
                    }
                })
                .catch(error => {
                    alert(error.message);
                });
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = signupForm['signupFullName'].value;
            const email = signupForm['signupEmail'].value;
            const password = signupForm['signupPassword'].value;
            const code = signupForm['signupCode'].value;

            if (code !== "AxbcDv95623") { // Entry code for regular users
                alert("Invalid Entry Code");
                return;
            }

            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    const user = userCredential.user;
                    return db.ref('users/' + user.uid).set({
                        fullName: fullName,
                        email: email,
                        code: code // Store the code for verification if needed, though not strictly secure for roles
                    });
                })
                .then(() => {
                    alert("Signup successful. Please log in.");
                    toggleForms(); // Assuming toggleForms switches between login/signup forms
                })
                .catch(error => {
                    alert(error.message);
                });
        });
    }
});

function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}