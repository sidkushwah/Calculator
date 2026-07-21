/* =========================================
   DOM ELEMENTS & STATE
   ========================================= */
const expressionDisplay = document.getElementById("expressionDisplay");
const resultDisplay = document.getElementById("resultDisplay");
const formulaModal = document.getElementById("formulaModal");
const searchInput = document.getElementById("formulaSearch");
const formulaListContainer = document.getElementById("formulaListContainer");

let currentExpression = "";
let isEvaluated = false;

/* =========================================
   FORMULA DATABASE (SMART ARCHITECTURE)
   ========================================= */
// If an item has an `action(val)`, it becomes a clickable calculator button.
// If it lacks an `action`, it renders as a beautiful reference block.

const formulaDB = [
    {
        category: "Basic & Algorithmic",
        items: [
            { name: "Factorial (n!)", notation: "n × (n-1) × ... × 1", action: (n) => factorialize(n) },
            { name: "Permutations (nPr)", notation: "n! / (n-r)!" },
            { name: "Combinations (nCr)", notation: "n! / [r!(n-r)!]" },
            { name: "Log Base Change", notation: "log_b(x) = ln(x)/ln(b)" },
            { name: "GCD (Euclidean)", notation: "GCD(a, b) = GCD(b, a mod b)" },
            { name: "LCM", notation: "LCM(a, b) = |a × b| / GCD(a, b)" },
            { name: "Compound Interest", notation: "A = P(1 + r/n)^(nt)" }
        ]
    },
    {
        category: "2D Area & Perimeter",
        items: [
            { name: "Circle Area", notation: "A = πr²", action: (r) => Math.PI * Math.pow(r, 2) },
            { name: "Circle Perimeter", notation: "P = 2πr", action: (r) => 2 * Math.PI * r },
            { name: "Triangle (Heron's)", notation: "A = √[s(s-a)(s-b)(s-c)]" },
            { name: "Trapezoid Area", notation: "A = [(a+b)/2] × h" },
            { name: "Regular Polygon", notation: "A = (n/4)s² × cot(π/n)" }
        ]
    },
    {
        category: "3D Surface Area & Volume",
        items: [
            { name: "Sphere Volume", notation: "V = (4/3)πr³", action: (r) => (4/3) * Math.PI * Math.pow(r, 3) },
            { name: "Sphere Surface Area", notation: "SA = 4πr²", action: (r) => 4 * Math.PI * Math.pow(r, 2) },
            { name: "Cylinder Volume", notation: "V = πr²h" },
            { name: "Cone Volume", notation: "V = (1/3)πr²h" },
            { name: "Pyramid Volume", notation: "V = (1/3)b²h" },
            { name: "Torus Volume", notation: "V = (πr²)(2πR)" }
        ]
    },
    {
        category: "Statistics & Data Sets",
        items: [
            { name: "Mean (μ / x̄)", notation: "(Σ x_i) / n" },
            { name: "Sample Variance (s²)", notation: "Σ(x_i - x̄)² / (n-1)" },
            { name: "Population Variance (σ²)", notation: "Σ(x_i - μ)² / n" },
            { name: "Standard Deviation (s)", notation: "√[ Σ(x_i - x̄)² / (n-1) ]" },
            { name: "Pearson Correlation (r)", notation: "Σ(x-x̄)(y-ȳ) / √[Σ(x-x̄)²Σ(y-ȳ)²]" }
        ]
    },
    {
        category: "Calculus, Physics & Engineering",
        items: [
            { name: "Numerical Deriv", notation: "f'(x) ≈ [f(x+h) - f(x-h)] / 2h" },
            { name: "Num Integral (Trap)", notation: "∫f(x) ≈ (Δx/2)[f(x_0) + 2f(...) + f(x_n)]" },
            { name: "Kinematics 1", notation: "v = u + at" },
            { name: "Kinematics 2", notation: "s = ut + (1/2)at²" },
            { name: "Electrical Power", notation: "P = IV = I²R = V²/R" },
            { name: "Parallel Resistors", notation: "1/R_eq = 1/R_1 + ... + 1/R_n" }
        ]
    },
    {
        category: "Trigonometry & Graphs",
        items: [
            { name: "Deg to Rad", notation: "rad = deg × (π/180)", action: (d) => d * (Math.PI / 180) },
            { name: "Rad to Deg", notation: "deg = rad × (180/π)", action: (r) => r * (180 / Math.PI) },
            { name: "Angle Addition (sin)", notation: "sin(A±B) = sinA cosB ± cosA sinB" },
            { name: "Cartesian to Polar", notation: "r = √(x²+y²), θ = arctan(y/x)" },
            { name: "Graph Density", notation: "D = 2|E| / [|V|(|V|-1)]" }
        ]
    },
    {
        category: "Essential Conversions",
        items: [
            { name: "Celsius to Fahrenheit", notation: "F = (C × 9/5) + 32", action: (c) => (c * 1.8) + 32 },
            { name: "Fahrenheit to Celsius", notation: "C = (F - 32) × 5/9", action: (f) => (f - 32) * (5/9) },
            { name: "Celsius to Kelvin", notation: "K = C + 273.15", action: (c) => c + 273.15 },
            { name: "Kilobytes to Bytes", notation: "Bytes = KB × 1024", action: (kb) => kb * 1024 },
            { name: "MPH to KM/H", notation: "km/h = mph × 1.60934", action: (mph) => mph * 1.60934 },
            { name: "KM/H to M/S", notation: "m/s = km/h ÷ 3.6", action: (kmh) => kmh / 3.6 }
        ]
    }
];

/* Helper Math Functions */
function factorialize(num) {
    if (num < 0 || !Number.isInteger(num)) return NaN;
    if (num > 170) return Infinity; // Max safe JS float factorial
    if (num === 0 || num === 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    return result;
}

/* =========================================
   DYNAMIC UI RENDERING
   ========================================= */
function renderFormulas(query = "") {
    formulaListContainer.innerHTML = "";
    const q = query.toLowerCase();

    formulaDB.forEach(group => {
        // Filter items based on search query
        const filteredItems = group.items.filter(item => 
            item.name.toLowerCase().includes(q) || item.notation.toLowerCase().includes(q)
        );

        if (filteredItems.length > 0) {
            // Add Category Header
            const header = document.createElement("div");
            header.className = "formula-category-title";
            header.innerText = group.category;
            formulaListContainer.appendChild(header);

            // Add Items
            filteredItems.forEach(item => {
                const div = document.createElement("div");
                div.className = `formula-item ${item.action ? 'applicable' : 'reference'}`;
                
                let innerHTML = `
                    <div class="formula-title">${item.name}</div>
                    <div class="formula-desc">${item.notation}</div>
                `;

                if (item.action) {
                    innerHTML += `<div class="formula-hint">Tap to apply to current result</div>`;
                    div.onclick = () => executeDynamicFormula(item);
                } else {
                    innerHTML += `<div class="formula-ref-hint">Multi-variable (Reference Only)</div>`;
                }

                div.innerHTML = innerHTML;
                formulaListContainer.appendChild(div);
            });
        }
    });
}

function filterFormulas() {
    renderFormulas(searchInput.value);
}

function executeDynamicFormula(item) {
    // If there's an active uncalculated expression, evaluate it first
    if (currentExpression && !isEvaluated && !/[+×÷\-]$/.test(currentExpression)) {
        calculateResult();
    }

    let val = parseFloat(resultDisplay.innerText);
    if (isNaN(val)) {
        showToast("Enter a valid number first!");
        closeModal();
        return;
    }

    // Run the dynamic calc logic
    let result = item.action(val);
    
    if (isNaN(result) || result === Infinity) {
        showToast("Math Error (Limit/Negative)");
        closeModal();
        return;
    }

    // Update screen
    result = parseFloat(result.toFixed(6)); // Avoid float overflow
    expressionDisplay.innerText = `${item.name} (${val})`;
    currentExpression = result.toString();
    resultDisplay.innerText = currentExpression;
    isEvaluated = true;
    
    closeModal();
    showToast("Formula Applied!");
}

/* =========================================
   KEYPAD LOGIC
   ========================================= */
function appendChar(char) {
    if (isEvaluated) {
        if (/[0-9.]/.test(char)) currentExpression = "";
        isEvaluated = false;
    }
    if (char === '.' && currentExpression.endsWith('.')) return;
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

function calculateResult() {
    if (!currentExpression) return;
    try {
        let safeMath = currentExpression.replace(/×/g, '*').replace(/÷/g, '/');
        if (/[^0-9+\-*/.]/.test(safeMath)) throw new Error("Invalid Input");
        let result = eval(safeMath);
        if (result === Infinity || Number.isNaN(result)) throw new Error("Error");
        
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
   THEME, MODAL & UTILS
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

function openModal() {
    searchInput.value = ""; // clear search on open
    renderFormulas();       // render full list
    formulaModal.style.display = 'flex';
}

function closeModal() {
    formulaModal.style.display = 'none';
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

// Close modal if clicking outside
formulaModal.addEventListener('click', (e) => {
    if (e.target === formulaModal) closeModal();
});

// Boot empty setup
updateDisplay();
