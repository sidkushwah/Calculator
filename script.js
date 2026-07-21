/* =========================================
   DOM ELEMENTS
   ========================================= */
const expressionDisplay = document.getElementById("expressionDisplay");
const resultDisplay = document.getElementById("resultDisplay");
const formulaModal = document.getElementById("formulaModal");

let currentExpression = "";
let isEvaluated = false;

/* =========================================
   THEME LOGIC
   ========================================= */
if (localStorage.getItem('calcTheme') === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('themeToggleBtn').innerHTML = '🌙';
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    document.getElementById('themeToggleBtn').innerHTML = isLight ? '🌙' : '☀️';
    localStorage.setItem('calcTheme', isLight ? 'light' : 'dark');
}

/* =========================================
   KEYPAD LOGIC
   ========================================= */
function appendChar(char) {
    if (isEvaluated) {
        // If user types a number after equals, start fresh. If operator, continue calculation.
        if (/[0-9.]/.test(char)) {
            currentExpression = "";
        }
        isEvaluated = false;
    }
    
    // Prevent multiple decimals in a row
    if (char === '.' && currentExpression.endsWith('.')) return;
    
    // Prevent operator spamming (replace last operator)
    if (/[+×÷\-]/.test(char) && /[+×÷\-]$/.test(currentExpression)) {
        currentExpression = currentExpression.slice(0, -1);
    }

    currentExpression += char;
    updateDisplay();
}

function deleteLast() {
    if (isEvaluated) return clearAll();
    currentExpression = currentExpression.toString().slice(0, -1);
    updateDisplay();
}

function clearAll() {
    currentExpression = "";
    isEvaluated = false;
    expressionDisplay.innerText = "";
    resultDisplay.innerText = "0";
}

function updateDisplay() {
    resultDisplay.innerText = currentExpression || "0";
}

/* =========================================
   SAFE EVALUATION LOGIC
   ========================================= */
function calculateResult() {
    if (!currentExpression) return;

    try {
        // Format for JS math evaluation
        let safeMath = currentExpression.replace(/×/g, '*').replace(/÷/g, '/');
        
        // Final security check: only allow numbers and basic math operators
        if (/[^0-9+\-*/.]/.test(safeMath)) throw new Error("Invalid Input");

        // Calculate and round to prevent weird floating point bugs
        let result = eval(safeMath);
        
        if (result === Infinity || Number.isNaN(result)) throw new Error("Error");

        // Format length dynamically to fit screen
        result = parseFloat(result.toFixed(6));

        expressionDisplay.innerText = currentExpression + " =";
        currentExpression = result.toString();
        resultDisplay.innerText = currentExpression;
        isEvaluated = true;

    } catch (e) {
        resultDisplay.innerText = "Error";
        currentExpression = "";
        isEvaluated = true;
    }
}

/* =========================================
   MODAL & FORMULA LOGIC
   ========================================= */
function openModal() {
    // Force evaluation before applying a formula if it hasn't been evaluated
    if (currentExpression && !isEvaluated && !/[+×÷\-]$/.test(currentExpression)) {
        calculateResult();
    }
    formulaModal.style.display = 'flex';
}

function closeModal() {
    formulaModal.style.display = 'none';
}

function applyFormula(type) {
    let val = parseFloat(resultDisplay.innerText);
    
    if (isNaN(val)) {
        showToast("Enter a valid number first!");
        closeModal();
        return;
    }

    let result = 0;
    let formulaString = "";

    switch(type) {
        case 'c_to_f':
            result = (val * 1.8) + 32;
            formulaString = `Conv: ${val}°C → ${result.toFixed(2)}°F`;
            break;
        case 'km_to_mi':
            result = val * 0.621371;
            formulaString = `Conv: ${val}km → ${result.toFixed(2)}mi`;
            break;
        case 'cube_vol':
            result = Math.pow(val, 3);
            formulaString = `Cube Vol(${val}) = ${result.toFixed(2)}`;
            break;
        case 'circle_area':
            result = Math.PI * Math.pow(val, 2);
            formulaString = `Circle Area(r:${val}) = ${result.toFixed(2)}`;
            break;
        case 'variance':
            result = Math.pow(val, 2);
            formulaString = `${val}² = ${result.toFixed(2)}`;
            break;
        case 'sqrt':
            if (val < 0) {
                showToast("Cannot square root negative numbers");
                closeModal();
                return;
            }
            result = Math.sqrt(val);
            formulaString = `√${val} = ${result.toFixed(2)}`;
            break;
    }

    // Update UI safely
    result = parseFloat(result.toFixed(6));
    expressionDisplay.innerText = formulaString;
    currentExpression = result.toString();
    resultDisplay.innerText = currentExpression;
    isEvaluated = true;
    
    closeModal();
    showToast("Formula Applied!");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

// Close modal if clicking outside the card
formulaModal.addEventListener('click', (e) => {
    if (e.target === formulaModal) closeModal();
});
