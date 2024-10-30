let financeData = JSON.parse(localStorage.getItem('financeData')) || [];
let incomeBudget = parseFloat(localStorage.getItem('incomeBudget')) || 0;
let expenseBudget = parseFloat(localStorage.getItem('expenseBudget')) || 0;

// Color palette for categories
const colorPalette = [
    'red', 'blue', 'yellow', 'cyan', 'purple', 'orange', 'darkorange',
    'green', 'blueviolet', 'limegreen', 'gold', 'mediumseagreen', 'crimson', 'pink'
];

// Function to get unique colors for categories
function getColor(index) {
    return colorPalette[index % colorPalette.length];     
}

// Function to sum amounts by category
function getCategoryTotals(entries) {
    const totals = {};
    entries.forEach(entry => {
        totals[entry.category] = (totals[entry.category] || 0) + parseFloat(entry.amount);
    });
    return totals;
}

// Function to update charts and savings overview
function updateCharts() {
    const incomeData = financeData.filter(entry => entry.type === 'income');
    const expenseData = financeData.filter(entry => entry.type === 'expense');

    const incomeTotals = getCategoryTotals(incomeData);
    const expenseTotals = getCategoryTotals(expenseData);

    const allCategories = [...new Set([...Object.keys(incomeTotals), ...Object.keys(expenseTotals)])];
    const allAmounts = allCategories.map(category => {
        return {
            category: category,
            income: incomeTotals[category] || 0,
            expense: expenseTotals[category] || 0
        };
    });

    // Get unique colors for all categories
    const categoryColors = allCategories.map((_, index) => getColor(index));

    // Pie Chart (Income vs Expenses)
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: allCategories,
            datasets: [{
                data: allAmounts.map(entry => entry.income + entry.expense),
                backgroundColor: categoryColors
            }]
        },
        options: { responsive: true }
    });

    // Bar Chart 
    const ctxBar = document.getElementById('barChart').getContext('2d');
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: allCategories,
            datasets: [
                {
                    label: 'Income',
                    data: allAmounts.map(entry => entry.income),
                    backgroundColor: categoryColors,
                    borderColor: 'blue',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: allAmounts.map(entry => entry.expense),
                    backgroundColor: categoryColors,
                    borderColor: 'red',
                    borderWidth: 1
                }
            ]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    // Update Monthly Savings Overview
    const totalIncome = incomeData.reduce((acc, entry) => acc + parseFloat(entry.amount), 0);
    const totalExpenses = expenseData.reduce((acc, entry) => acc + parseFloat(entry.amount), 0);
    const savings = totalIncome - totalExpenses;
    document.getElementById('monthlySavings').textContent = `Savings: ${savings.toFixed(2)} USD`;

    // Update Budget Status
    const budgetMessage = document.getElementById('budgetMessage');
    if (incomeBudget && expenseBudget) {
        budgetMessage.textContent = totalIncome >= incomeBudget && totalExpenses > expenseBudget
            ? 'Overspent on both income and expenses'
            : totalIncome >= incomeBudget
            ? 'Overspent on income'
            : totalExpenses > expenseBudget
            ? 'Overspent on expenses'
            : 'On budget for both income and expenses';
    } else {
        budgetMessage.textContent = 'Set your budget to see the status';
    }
}

// Function to add a new entry
function addEntry() {
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;

    if (type && category && amount && date) {
        financeData.push({ type, category, amount, date });
        localStorage.setItem('financeData', JSON.stringify(financeData));
        updateCharts();
        document.getElementById('financeForm').reset();
    } else {
        alert('Please fill all fields');
    }
}

// Function to set monthly budgets
function setMonthlyBudget() {
    incomeBudget = parseFloat(document.getElementById('incomeBudget').value) || 0;
    expenseBudget = parseFloat(document.getElementById('expenseBudget').value) || 0;
    localStorage.setItem('incomeBudget', incomeBudget);
    localStorage.setItem('expenseBudget', expenseBudget);
    updateCharts();
}

// Function to clear local storage and reset everything
function clearLocalStorage() {
    localStorage.removeItem('financeData');
    localStorage.removeItem('incomeBudget');
    localStorage.removeItem('expenseBudget');
    financeData = [];
    incomeBudget = 0;
    expenseBudget = 0;

    // Update charts and savings overview
    updateCharts();
    document.getElementById('monthlySavings').textContent = 'Savings: 0.00 USD';
    document.getElementById('budgetMessage').textContent = 'Set your budget to see the status';
}

// Event listeners
document.getElementById('addEntryBtn').addEventListener('click', addEntry);
document.getElementById('setBudgetBtn').addEventListener('click', setMonthlyBudget);
document.getElementById('clearDataBtn').addEventListener('click', clearLocalStorage);

// Initialize on page load
window.onload = updateCharts;
