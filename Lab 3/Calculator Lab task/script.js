/**
 * ========================================================
 * CSE343 Web Development - Lab 3: Interactive iOS Calculator
 * Architecture based on Lab 3 slides:
 *   1. DOM: Node selection using getElementById & querySelector
 *   2. Event: Event Delegation with addEventListener and event object
 *   3. Logic: Modular pure functions & state management
 * ========================================================
 */

// --------------------------------------------------------
// 1. DOM: Select Nodes
// --------------------------------------------------------
const displayElement = document.getElementById('display');
const previousOperandElement = document.getElementById('previous-operand');
const keypadElement = document.getElementById('keypad');

// --------------------------------------------------------
// Calculator State
// --------------------------------------------------------
let currentOperand = '0';
let previousOperand = '';
let selectedOperator = undefined;
let shouldResetScreen = false;
let hasError = false;

// --------------------------------------------------------
// 2. Logic: Core Calculator Functions
// --------------------------------------------------------

/**
 * Resets the calculator to its initial clean state.
 */
function clearAll() {
    currentOperand = '0';
    previousOperand = '';
    selectedOperator = undefined;
    shouldResetScreen = false;
    hasError = false;
    clearActiveOperatorStyle();
    updateDisplay();
}

/**
 * Appends a digit (0-9) to the current operand.
 * @param {string} digit - The digit string to append.
 */
function appendNumber(digit) {
    if (hasError) {
        clearAll();
    }

    if (shouldResetScreen) {
        currentOperand = '';
        shouldResetScreen = false;
    }

    // Prevent duplicate leading zeros (e.g. "00" when current is "0")
    if (currentOperand === '0') {
        currentOperand = digit;
    } else {
        // Limit maximum input length to prevent display overflow
        if (currentOperand.length >= 10) return;
        currentOperand += digit;
    }

    updateDisplay();
}

/**
 * Appends double zeros ('00') if applicable.
 */
function appendDoubleZero() {
    if (hasError) {
        clearAll();
    }

    if (shouldResetScreen) {
        currentOperand = '0';
        shouldResetScreen = false;
        updateDisplay();
        return;
    }

    // Do nothing if already zero
    if (currentOperand === '0' || currentOperand === '') {
        currentOperand = '0';
    } else {
        if (currentOperand.length >= 9) return;
        currentOperand += '00';
    }

    updateDisplay();
}

/**
 * Appends a decimal point, ensuring only one decimal per number.
 */
function appendDecimal() {
    if (hasError) {
        clearAll();
    }

    if (shouldResetScreen) {
        currentOperand = '0';
        shouldResetScreen = false;
    }

    if (!currentOperand.includes('.')) {
        currentOperand = currentOperand === '' ? '0.' : currentOperand + '.';
    }

    updateDisplay();
}

/**
 * Converts current value to a percentage (divides by 100).
 */
function applyPercentage() {
    if (hasError || currentOperand === '' || currentOperand === 'Error') return;

    const parsed = parseFloat(currentOperand);
    if (!isNaN(parsed)) {
        // Divide by 100 and clean up floating point artifacts
        const result = parsed / 100;
        currentOperand = cleanFloat(result).toString();
        updateDisplay();
    }
}

/**
 * Sets the active arithmetic operator (+, -, ×, ÷).
 * If a previous operation is pending, computes the intermediate result.
 * @param {string} operator - The mathematical symbol.
 */
function chooseOperation(operator) {
    if (hasError) return;

    if (selectedOperator !== undefined && !shouldResetScreen) {
        compute();
    }

    selectedOperator = operator;
    previousOperand = currentOperand;
    shouldResetScreen = true;
    updateDisplay();
}

/**
 * Pure arithmetic helper that computes the result of two numbers.
 * @param {number} a - First operand
 * @param {string} op - Operator string
 * @param {number} b - Second operand
 * @returns {number|string} Result or "Error" on division by zero
 */
function calculate(a, op, b) {
    switch (op) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '×':
        case '*':
            return a * b;
        case '÷':
        case '/':
            if (b === 0) {
                return 'Error';
            }
            return a / b;
        default:
            return b;
    }
}

/**
 * Executes the pending calculation and updates state.
 */
function compute() {
    if (selectedOperator === undefined || shouldResetScreen) return;

    const prev = parseFloat(previousOperand);
    const curr = parseFloat(currentOperand);

    if (isNaN(prev) || isNaN(curr)) return;

    const result = calculate(prev, selectedOperator, curr);

    if (result === 'Error') {
        currentOperand = 'Error';
        hasError = true;
        previousOperand = '';
        selectedOperator = undefined;
    } else {
        currentOperand = cleanFloat(result).toString();
        previousOperand = '';
        selectedOperator = undefined;
        shouldResetScreen = true;
    }

    clearActiveOperatorStyle();
    updateDisplay();
}

/**
 * Fixes floating point precision issues (e.g., 0.1 + 0.2 = 0.30000000000000004).
 * @param {number} num 
 * @returns {number}
 */
function cleanFloat(num) {
    return parseFloat(Number(num).toPrecision(12));
}

/**
 * Removes highlighted styling from any operator buttons.
 */
function clearActiveOperatorStyle() {
    const operatorButtons = keypadElement.querySelectorAll('.btn-operator');
    operatorButtons.forEach((btn) => btn.classList.remove('is-active'));
}

/**
 * Highlights the currently active operator button on the keypad.
 */
function highlightActiveOperator() {
    clearActiveOperatorStyle();
    if (!selectedOperator || !shouldResetScreen) return;

    const buttons = keypadElement.querySelectorAll('[data-action="operator"]');
    buttons.forEach((btn) => {
        if (btn.dataset.operator === selectedOperator) {
            btn.classList.add('is-active');
        }
    });
}

/**
 * Formats a number string with thousands separators for readability,
 * while preserving decimals and negative signs.
 * @param {string} numStr 
 * @returns {string}
 */
function formatNumber(numStr) {
    if (numStr === '' || numStr === 'Error') return numStr;

    const parts = numStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    const formattedInteger = Number(integerPart).toLocaleString('en-US');

    if (decimalPart !== undefined) {
        return `${formattedInteger}.${decimalPart}`;
    }

    return formattedInteger;
}

/**
 * Updates DOM elements with current calculator state and adjusts font size dynamically.
 */
function updateDisplay() {
    if (hasError) {
        displayElement.textContent = 'Error';
        previousOperandElement.textContent = '';
        displayElement.style.fontSize = '3.5rem';
        return;
    }

    // Format display string
    const formatted = formatNumber(currentOperand);
    displayElement.textContent = formatted || '0';

    // Update previous operand banner
    if (selectedOperator) {
        previousOperandElement.textContent = `${formatNumber(previousOperand)} ${selectedOperator}`;
    } else {
        previousOperandElement.textContent = '';
    }

    // Adjust font size dynamically to avoid overflowing display
    const len = (formatted || '').length;
    if (len > 9) {
        displayElement.style.fontSize = '2.2rem';
    } else if (len > 6) {
        displayElement.style.fontSize = '2.8rem';
    } else {
        displayElement.style.fontSize = '3.8rem';
    }

    highlightActiveOperator();
}

// --------------------------------------------------------
// 3. Events: Delegation & Key Handling
// --------------------------------------------------------

/**
 * Event Delegation on Keypad:
 * Attaches a single listener to parent '#keypad' instead of individual listeners,
 * matching the technique taught in Lab 3 (Slide 21).
 */
keypadElement.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    // Digit click
    if (button.dataset.number !== undefined) {
        appendNumber(button.dataset.number);
        return;
    }

    // Action clicks
    const action = button.dataset.action;
    switch (action) {
        case 'clear':
            clearAll();
            break;
        case 'double-zero':
            appendDoubleZero();
            break;
        case 'decimal':
            appendDecimal();
            break;
        case 'percent':
            applyPercentage();
            break;
        case 'operator':
            chooseOperation(button.dataset.operator);
            break;
        case 'calculate':
            compute();
            break;
    }
});

/**
 * Keyboard Support:
 * Allows user to operate calculator via physical keyboard as well as mouse.
 */
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        appendNumber(key);
    } else if (key === '.') {
        appendDecimal();
    } else if (key === '+' || key === '-') {
        chooseOperation(key);
    } else if (key === '*') {
        chooseOperation('×');
    } else if (key === '/') {
        event.preventDefault(); // Prevent browser quick-find shortcut
        chooseOperation('÷');
    } else if (key === '%' || key === 'p') {
        applyPercentage();
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        compute();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearAll();
    } else if (key === 'Backspace') {
        // Backspace to delete last digit
        if (currentOperand.length > 1 && !shouldResetScreen && !hasError) {
            currentOperand = currentOperand.slice(0, -1);
        } else {
            currentOperand = '0';
        }
        updateDisplay();
    }
});

// Initialize on page load
updateDisplay();
