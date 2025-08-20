/**
 * Tax Calculator JavaScript
 * Handles all calculations and form interactions for the Nigerian tax calculator
 */

// Tax brackets configuration (Nigerian tax system)
const TAX_BRACKETS = [
  { min: 0, max: 300000, rate: 0.07, label: "First ₦300,000" },
  { min: 300000, max: 600000, rate: 0.11, label: "Next ₦300,000" },
  { min: 600000, max: 1100000, rate: 0.15, label: "Next ₦500,000" },
  { min: 1100000, max: 1600000, rate: 0.19, label: "Next ₦500,000" },
  { min: 1600000, max: 3200000, rate: 0.21, label: "Next ₦1,600,000" },
  {
    min: 3200000,
    max: Number.POSITIVE_INFINITY,
    rate: 0.24,
    label: "Amount Above ₦3,200,000",
  },
];

/**
 * Format number as Nigerian Naira currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₦0.00";
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
function parseCurrency(currencyString) {
  if (!currencyString) return 0;
  return Number.parseFloat(currencyString.replace(/[₦,]/g, "")) || 0;
}

/**
 * Get form input values
 * @returns {object} Object containing all form values
 */
function getFormValues() {
  return {
    basicSalary:
      Number.parseFloat(document.getElementById("basicSalary").value) || 0,
    housingAllowance:
      Number.parseFloat(document.getElementById("housingAllowance").value) || 0,
    transportAllowance:
      Number.parseFloat(document.getElementById("transportAllowance").value) ||
      0,
    leaveAllowance:
      Number.parseFloat(document.getElementById("leaveAllowance").value) || 0,
    mealsAllowance:
      Number.parseFloat(document.getElementById("mealsAllowance").value) || 0,
    energyAllowance:
      Number.parseFloat(document.getElementById("energyAllowance").value) || 0,
    otherAllowances:
      Number.parseFloat(document.getElementById("otherAllowances").value) || 0,
    lifeInsurance:
      Number.parseFloat(document.getElementById("lifeInsurance").value) || 0,
    tempDisabilityInsurance:
      Number.parseFloat(
        document.getElementById("tempDisabilityInsurance").value
      ) || 0,
    permDisabilityInsurance:
      Number.parseFloat(
        document.getElementById("permDisabilityInsurance").value
      ) || 0,
    rentPaid: Number.parseFloat(document.getElementById("rentPaid").value) || 0,
    pensionContribution:
      Number.parseFloat(document.getElementById("pensionContribution").value) ||
      0,
    pensionEnabled: document.getElementById("pensionToggle").checked,
  };
}

/**
 * Calculate Annual Net Salary (ANS)
 * @param {object} values - Form values object
 * @returns {number} Annual Net Salary
 */
function calculateANS(values) {
  const grossSalary =
    values.basicSalary +
    values.housingAllowance +
    values.transportAllowance +
    values.leaveAllowance +
    values.mealsAllowance +
    values.energyAllowance +
    values.otherAllowances;

  const statutoryDeductions =
    values.lifeInsurance +
    values.tempDisabilityInsurance +
    values.permDisabilityInsurance +
    values.rentPaid;

  // Add pension contribution if enabled
  let pensionDeduction = 0;
  if (values.pensionEnabled) {
    // 8% of (Basic + Housing + Transport)
    const pensionBase =
      values.basicSalary + values.housingAllowance + values.transportAllowance;
    pensionDeduction = pensionBase * 0.08;

    // Update pension input field with calculated value
    document.getElementById("pensionContribution").value =
      pensionDeduction.toFixed(2);
  } else {
    pensionDeduction = values.pensionContribution;
  }

  return grossSalary - statutoryDeductions - pensionDeduction;
}

/**
 * Calculate Annual Taxable Income (ATI)
 * @param {number} ans - Annual Net Salary
 * @returns {number} Annual Taxable Income
 */
function calculateATI(ans) {
  // Higher of NGN 200,000 or 1% of ANS
  const consolidatedRelief = Math.max(200000, ans * 0.01);

  // 20% of ANS
  const additionalRelief = ans * 0.2;

  // ATI = ANS - Consolidated Relief - Additional Relief
  return Math.max(0, ans - consolidatedRelief - additionalRelief);
}

/**
 * Calculate tax for each bracket
 * @param {number} ati - Annual Taxable Income
 * @returns {object} Tax breakdown by bracket
 */
function calculateTaxBreakdown(ati) {
  const breakdown = [];
  let remainingIncome = ati;
  let totalTax = 0;

  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome <= 0) {
      breakdown.push({
        bracket: bracket.label,
        rate: bracket.rate,
        taxableAmount: 0,
        taxAmount: 0,
      });
      continue;
    }

    const bracketSize = bracket.max - bracket.min;
    const taxableInThisBracket = Math.min(remainingIncome, bracketSize);
    const taxForThisBracket = taxableInThisBracket * bracket.rate;

    breakdown.push({
      bracket: bracket.label,
      rate: bracket.rate,
      taxableAmount: taxableInThisBracket,
      taxAmount: taxForThisBracket,
    });

    totalTax += taxForThisBracket;
    remainingIncome -= taxableInThisBracket;
  }

  return { breakdown, totalTax };
}

/**
 * Update the tax brackets table with calculated values
 * @param {array} breakdown - Tax breakdown array
 * @param {number} totalTax - Total tax amount
 */
function updateTaxTable(breakdown, totalTax) {
  const tableRows = document.querySelectorAll(".tax-table tbody tr");

  breakdown.forEach((item, index) => {
    if (index < tableRows.length - 1) {
      // Exclude total row
      const row = tableRows[index];
      const taxableAmountCell = row.querySelector(".taxable-amount");
      const taxAmountCell = row.querySelector(".tax-amount");

      if (item.taxableAmount > 0) {
        taxableAmountCell.textContent = formatCurrency(item.taxableAmount);
        taxAmountCell.textContent = formatCurrency(item.taxAmount);
      } else {
        taxableAmountCell.textContent = "—";
        taxAmountCell.textContent = "—";
      }
    }
  });

  // Update total row
  const totalRow = tableRows[tableRows.length - 1];
  const totalTaxableCell = totalRow.querySelector(".taxable-amount strong");
  const totalTaxCell = totalRow.querySelector(".tax-amount strong");

  const totalTaxableAmount = breakdown.reduce(
    (sum, item) => sum + item.taxableAmount,
    0
  );
  totalTaxableCell.textContent = formatCurrency(totalTaxableAmount);
  totalTaxCell.textContent = formatCurrency(totalTax);
}

/**
 * Update all result fields
 * @param {object} results - Calculation results object
 */
function updateResults(results) {
  // Update main result cards
  document.getElementById("ansResult").value = formatCurrency(results.ans);
  document.getElementById("atiResult").value = formatCurrency(results.ati);

  // Update final results
  document.getElementById("annualTaxResult").value = formatCurrency(
    results.annualTax
  );
  document.getElementById("anstResult").value = formatCurrency(results.anst);
  document.getElementById("mnstResult").value = formatCurrency(results.mnst);
  document.getElementById("mnsResult").value = formatCurrency(results.mns);
  document.getElementById("monthlyTaxResult").value = formatCurrency(
    results.monthlyTax
  );
}

/**
 * Main calculation function
 * Orchestrates all tax calculations and updates the UI
 */
function calculateTax() {
  try {
    // Get form values
    const values = getFormValues();

    // Validate required fields
    if (
      !values.basicSalary ||
      !values.housingAllowance ||
      !values.transportAllowance
    ) {
      alert(
        "Please fill in all required fields (Basic Salary, Housing Allowance, and Transport Allowance)"
      );
      return;
    }

    // Calculate ANS (Annual Net Salary)
    const ans = calculateANS(values);

    // Calculate ATI (Annual Taxable Income)
    const ati = calculateATI(ans);

    // Calculate tax breakdown
    const { breakdown, totalTax } = calculateTaxBreakdown(ati);

    // Calculate final results
    const results = {
      ans: ans,
      ati: ati,
      annualTax: totalTax,
      anst: ans - totalTax, // Annual Net Salary After Tax
      mnst: (ans - totalTax) / 12, // Monthly Net Salary After Tax
      mns: ans / 12, // Monthly Net Salary
      monthlyTax: totalTax / 12, // Monthly Tax
    };

    // Update UI
    updateTaxTable(breakdown, totalTax);
    updateResults(results);

    // Smooth scroll to results (on mobile)
    if (window.innerWidth < 992) {
      document.querySelector(".results-container").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  } catch (error) {
    console.error("Error calculating tax:", error);
    alert(
      "An error occurred while calculating tax. Please check your inputs and try again."
    );
  }
}

/**
 * Auto-calculate pension contribution when toggle is enabled
 */
function updatePensionContribution() {
  const pensionToggle = document.getElementById("pensionToggle");
  const pensionInput = document.getElementById("pensionContribution");

  if (pensionToggle.checked) {
    const basicSalary =
      Number.parseFloat(document.getElementById("basicSalary").value) || 0;
    const housingAllowance =
      Number.parseFloat(document.getElementById("housingAllowance").value) || 0;
    const transportAllowance =
      Number.parseFloat(document.getElementById("transportAllowance").value) ||
      0;

    const pensionBase = basicSalary + housingAllowance + transportAllowance;
    const pensionAmount = pensionBase * 0.08;

    pensionInput.value = pensionAmount.toFixed(2);
    pensionInput.readOnly = true;
  } else {
    pensionInput.readOnly = false;
    pensionInput.value = "";
  }
}

/**
 * Initialize event listeners when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  // Pension toggle event listener
  const pensionToggle = document.getElementById("pensionToggle");
  pensionToggle.addEventListener("change", updatePensionContribution);

  // Auto-update pension when relevant fields change
  const pensionRelatedFields = [
    "basicSalary",
    "housingAllowance",
    "transportAllowance",
  ];
  pensionRelatedFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.addEventListener("input", () => {
      if (document.getElementById("pensionToggle").checked) {
        updatePensionContribution();
      }
    });
  });

  // Initialize pension calculation
  updatePensionContribution();

  // Add keyboard shortcut for calculation (Ctrl/Cmd + Enter)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      calculateTax();
    }
  });

  // Form validation on submit
  const form = document.getElementById("taxCalculatorForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateTax();
  });
});

/**
 * Reset form and results
 */
function resetCalculator() {
  // Reset form
  document.getElementById("taxCalculatorForm").reset();

  // Reset results
  const resultInputs = document.querySelectorAll(
    ".result-input, .result-input-final"
  );
  resultInputs.forEach((input) => {
    input.value = "";
  });

  // Reset tax table
  const taxableCells = document.querySelectorAll(".taxable-amount");
  const taxCells = document.querySelectorAll(".tax-amount");

  taxableCells.forEach((cell) => {
    if (!cell.querySelector("strong")) {
      cell.textContent = "—";
    }
  });

  taxCells.forEach((cell) => {
    if (!cell.querySelector("strong")) {
      cell.textContent = "—";
    }
  });

  // Reset total row
  document.querySelector(".taxable-amount strong").textContent = "—";
  document.querySelector(".tax-amount strong").textContent = "—";

  // Reset pension calculation
  updatePensionContribution();
}

// Export functions for testing (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateANS,
    calculateATI,
    calculateTaxBreakdown,
    formatCurrency,
    parseCurrency,
  };
}
