/**
 * Salary calculation formulas — Section 4.6 of backend prompt.
 * MUST match the client-side calculateSalaryComponents() in utils/constants.js exactly.
 */
export function calculateSalaryComponents(monthlyWage) {
  const M = parseFloat(monthlyWage);
  const basicSalary = M * 0.5;
  const hra = basicSalary * 0.5;
  const standardAllowance = 4167;
  const performanceBonus = basicSalary * 0.0833;
  const lta = basicSalary * 0.08333;
  const fixedAllowance = M - (basicSalary + hra + standardAllowance + performanceBonus + lta);
  const pfContribution = basicSalary * 0.12;
  const professionalTax = 200;
  const netPayable = M - pfContribution - professionalTax;

  // Assert balance (within rounding tolerance of 1 rupee)
  const componentSum = basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance;
  if (Math.abs(componentSum - M) > 1) {
    throw new Error(`Salary components (${componentSum}) do not balance to monthly wage (${M})`);
  }

  return {
    monthlyWage: M,
    basicSalary: round(basicSalary),
    hra: round(hra),
    standardAllowance: round(standardAllowance),
    performanceBonus: round(performanceBonus),
    lta: round(lta),
    fixedAllowance: round(fixedAllowance),
    pfContribution: round(pfContribution),
    professionalTax: round(professionalTax),
    netPayable: round(netPayable),
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}
