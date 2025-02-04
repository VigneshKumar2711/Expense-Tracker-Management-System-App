let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentEditIndex = -1;

// Update the displayed totals
function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpenses += transaction.amount;
        }
    });

    const netIncome = totalIncome - totalExpenses;

    document.getElementById('total-income').textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('net-income').textContent = `₹${netIncome.toFixed(2)}`;
    displayTransactions();
}

// Display transactions on the page in a table
function displayTransactions() {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    transactions.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.classList.add(transaction.type);

        row.innerHTML = `
            <td>${transaction.description}</td>
            <td>₹${transaction.amount.toFixed(2)}</td>
            <td>${transaction.date}</td>
            <td>${transaction.category}</td>
            <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
            <td>
                <button class="edit-btn" onclick="editTransaction(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteTransaction(${index})">Delete</button>
            </td>
        `;
        transactionList.appendChild(row);
    });
}

// Add or Edit a transaction
function saveTransaction(description, amount, date, category, type) {
    if (currentEditIndex === -1) {
        const transaction = {
            description,
            amount: parseFloat(amount),
            date,
            category,
            type
        };
        transactions.push(transaction);
    } else {
        transactions[currentEditIndex] = {
            description,
            amount: parseFloat(amount),
            date,
            category,
            type
        };
        currentEditIndex = -1; // Reset the edit index after saving
    }
    localStorage.setItem('transactions', JSON.stringify(transactions)); // Save to localStorage
    updateSummary();
}

// Add or Edit transaction handler
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const description = document.getElementById('description').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const date = document.getElementById('date').value.trim();
    const category = document.getElementById('category').value;
    const type = document.getElementById('type').value;
    const errorMessage = document.getElementById('error-message');

    // Validate inputs
    if (!description || !amount || !date || !category || !type) {
        errorMessage.textContent = "All fields are required!";
        return;
    }

    errorMessage.textContent = ""; // Clear error message
    saveTransaction(description, amount, date, category, type);

    // Clear form inputs
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
    document.getElementById('category').value = '';
    document.getElementById('type').value = 'expense'; // Reset to default type (expense)
});

// Edit transaction
function editTransaction(index) {
    const transaction = transactions[index];
    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('date').value = transaction.date;
    document.getElementById('category').value = transaction.category;
    document.getElementById('type').value = transaction.type;

    currentEditIndex = index; // Set the current edit index
}

// Delete transaction
function deleteTransaction(index) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        transactions.splice(index, 1);
        localStorage.setItem('transactions', JSON.stringify(transactions)); // Save to localStorage
        updateSummary();
    }
}

// Export transactions as JSON
document.getElementById('export-button').addEventListener('click', function() {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transactions.json';
    link.click();
});

// Import transactions from JSON file
document.getElementById('import-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                    transactions = importedData;
                    localStorage.setItem('transactions', JSON.stringify(transactions)); // Save to localStorage
                    updateSummary();
                } else {
                    alert('Invalid file format.');
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please select a valid JSON file.');
    }
});

// Initialize summary and transactions on page load
updateSummary();
