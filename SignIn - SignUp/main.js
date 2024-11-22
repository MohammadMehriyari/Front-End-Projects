document.addEventListener("DOMContentLoaded", function () {
    const signInBtn = document.getElementById("signIn");
    const signUpBtn = document.getElementById("signUp");
    const fistForm = document.getElementById("form1");
    const secondForm = document.getElementById("form2");
    const container = document.querySelector(".container");

    // Password validation function
    function validatePassword(password) {
        const passwordRegex = /^[a-zA-Z].{7,}$/; // Updated regex
        return passwordRegex.test(password);
    }

    // Email validation function
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Real-time validation functions
    function realTimeEmailValidation(inputElement) {
        const tooltip = inputElement.nextElementSibling;

        inputElement.addEventListener("input", function () {
            const emailValue = inputElement.value.trim();

            if (emailValue === "") {
                tooltip.style.display = "none";
            } else if (validateEmail(emailValue)) {
                console.log("Valid email!");
                tooltip.style.display = "none";
            } else {
                console.error("Invalid email!");
                tooltip.style.display = "block";
            }
        });
    }

    function realTimePasswordValidation(inputElement) {
        const tooltip = inputElement.nextElementSibling;

        inputElement.addEventListener("input", function () {
            const passwordValue = inputElement.value.trim();

            if (passwordValue === "") {
                tooltip.style.display = "none";
            } else if (validatePassword(passwordValue)) {
                console.log("Valid password!");
                tooltip.style.display = "none";
            } else {
                console.error(
                    "Invalid password! Password must start with a letter and be at least 8 characters long."
                );
                tooltip.style.display = "block";
            }
        });
    }

    // Function to toggle password visibility
    function togglePasswordVisibility(icon) {
        const passwordInput =
            icon.previousElementSibling.previousElementSibling;

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        } else {
            passwordInput.type = "password";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        }
    }

    // Add event listeners for sign in and sign up
    signInBtn.addEventListener("click", () => {
        container.classList.remove("right-panel-active");
    });

    signUpBtn.addEventListener("click", () => {
        container.classList.add("right-panel-active");
    });

    fistForm.addEventListener("submit", (e) => {
        e.preventDefault();
        realTimeEmailValidation(fistForm.querySelector('input[type="email"]'));
        realTimePasswordValidation(
            fistForm.querySelector('input[type="password"]')
        );
    });

    secondForm.addEventListener("submit", (e) => {
        e.preventDefault();
        realTimeEmailValidation(
            secondForm.querySelector('input[type="email"]')
        );
        realTimePasswordValidation(
            secondForm.querySelector('input[type="password"]')
        );
    });

    // Initialize real-time validation for existing email inputs
    fistForm
        .querySelectorAll('input[type="email"]')
        .forEach(realTimeEmailValidation);
    secondForm
        .querySelectorAll('input[type="email"]')
        .forEach(realTimeEmailValidation);

    // Initialize real-time validation for existing password inputs
    fistForm
        .querySelectorAll('input[type="password"]')
        .forEach(realTimePasswordValidation);
    secondForm
        .querySelectorAll('input[type="password"]')
        .forEach(realTimePasswordValidation);

    // Add click event listener for password visibility toggle
    fistForm.querySelectorAll(".toggle-icon").forEach((icon) => {
        icon.addEventListener("click", () => togglePasswordVisibility(icon));
    });
    secondForm.querySelectorAll(".toggle-icon").forEach((icon) => {
        icon.addEventListener("click", () => togglePasswordVisibility(icon));
    });
});
