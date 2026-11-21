// Pro rata holiday calculator (Section 10.3).
import { addYears, addDays, daysInclusive, diffDays, maxISO, minISO, compareISO, isISODate, formatShort } from '../dates.js';

export const STATUTORY_WEEKS = 5.6;
export const STATUTORY_CAP = 28;
// Usual number of bank and public holidays a year in each UK nation.
export const NATIONS = {
  ew: { label: 'England and Wales', short: 'England & Wales', bankHolidays: 8 },
  sc: { label: 'Scotland', short: 'Scotland', bankHolidays: 9 },
  ni: { label: 'Northern Ireland', short: 'N. Ireland', bankHolidays: 10 },
};
export const BANK_HOLIDAYS = NATIONS.ew.bankHolidays;

export function roundUpHalf(x) {
  return Math.ceil(x * 2 - 1e-9) / 2;
}

function fmt(n) {
  return (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '');
}

/**
 * inputs: {
 *   entitlement, includesBankHolidays, fullTimeDays, employeeDays,
 *   yearStart (ISO, needed for part-year), startDate?, leaveDate?,
 *   nation? ('ew' | 'sc' | 'ni', default 'ew')
 * }
 */
export function calculateHoliday(inputs) {
  const errors = {};
  const entitlement = Number(inputs.entitlement);
  const ftDays = Number(inputs.fullTimeDays ?? 5);
  const empDays = Number(inputs.employeeDays);
  if (!(entitlement > 0 && entitlement <= 366)) errors.entitlement = 'Enter the full-time entitlement in days.';
  if (!(ftDays > 0 && ftDays <= 7)) errors.fullTimeDays = 'Enter between 0.5 and 7 days.';
  if (!(empDays >= 0.5 && empDays <= 7) || Math.round(empDays * 2) !== empDays * 2) errors.employeeDays = 'Enter between 0.5 and 7 days, in half days.';
  if (empDays > ftDays && !errors.employeeDays && !errors.fullTimeDays) errors.employeeDays = "This can't be more than the full-time days.";

  const nation = NATIONS[inputs.nation] ? inputs.nation : 'ew';
  const { label: nationLabel, bankHolidays } = NATIONS[nation];
  const partYear = !!(inputs.startDate || inputs.leaveDate);
  let fraction = 1;
  let yearEnd = null;
  let employedFrom = null;
  let employedTo = null;
  let yearDays = null;
  let employedDays = null;
  if (partYear) {
    if (!isISODate(inputs.yearStart)) errors.yearStart = 'Enter the date the holiday year starts.';
    if (inputs.startDate && !isISODate(inputs.startDate)) errors.startDate = 'Enter a valid date.';
    if (inputs.leaveDate && !isISODate(inputs.leaveDate)) errors.leaveDate = 'Enter a valid date.';
    if (!Object.keys(errors).length) {
      yearEnd = addDays(addYears(inputs.yearStart, 1), -1);
      yearDays = daysInclusive(inputs.yearStart, yearEnd);
      employedFrom = inputs.startDate ? maxISO(inputs.startDate, inputs.yearStart) : inputs.yearStart;
      employedTo = inputs.leaveDate ? minISO(inputs.leaveDate, yearEnd) : yearEnd;
      if (inputs.startDate && compareISO(inputs.startDate, yearEnd) > 0) errors.startDate = 'This is after the end of the holiday year.';
      else if (inputs.leaveDate && compareISO(inputs.leaveDate, inputs.yearStart) < 0) errors.leaveDate = 'This is before the holiday year starts.';
      else if (compareISO(employedTo, employedFrom) < 0) errors.leaveDate = 'The leave date must be on or after the start date.';
      else {
        employedDays = daysInclusive(employedFrom, employedTo);
        fraction = employedDays / yearDays;
      }
    }
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const ratio = empDays / ftDays;
  const exact = entitlement * ratio * fraction;
  const rounded = roundUpHalf(exact);
  const statutoryFull = Math.min(STATUTORY_WEEKS * empDays, STATUTORY_CAP);
  const statutory = statutoryFull * fraction;
  // If the entitlement excludes bank holidays, they're given on top, so count them for the statutory check.
  const bankOnTop = inputs.includesBankHolidays ? 0 : bankHolidays * ratio * fraction;
  const totalForCheck = exact + bankOnTop;
  const belowStatutory = totalForCheck + 1e-9 < statutory;

  const steps = [];
  steps.push(`Full-time entitlement is ${fmt(entitlement)} days${inputs.includesBankHolidays ? ', including bank holidays' : ', plus bank holidays'}.`);
  if (ratio !== 1) steps.push(`They work ${fmt(empDays)} of ${fmt(ftDays)} full-time days, so ${fmt(entitlement)} × ${fmt(empDays)} ÷ ${fmt(ftDays)} = ${fmt(entitlement * ratio)} days for a full year.`);
  else steps.push('They work full time, so no part-time adjustment is needed.');
  if (partYear) steps.push(`They're employed for ${employedDays} of the ${yearDays} days in the holiday year (${formatShort(employedFrom)} to ${formatShort(employedTo)}), so ${fmt(entitlement * ratio)} × ${employedDays} ÷ ${yearDays} = ${fmt(exact)} days.`);
  steps.push(`Rounded up to the nearest half day: ${fmt(rounded)} days.`);
  steps.push(`Statutory minimum: 5.6 × ${fmt(empDays)} days = ${fmt(STATUTORY_WEEKS * empDays)}${STATUTORY_WEEKS * empDays > STATUTORY_CAP ? ', capped at 28' : ''}${partYear ? `, pro-rated to ${fmt(statutory)}` : ''} days (including bank holidays).`);
  if (!inputs.includesBankHolidays) steps.push(`For the statutory check, ${fmt(bankOnTop)} days of bank holidays are added on top (${bankHolidays} bank holidays in ${nationLabel}, pro-rated).`);

  return {
    ok: true,
    exact: Math.round(exact * 100) / 100,
    rounded,
    statutory: Math.round(statutory * 100) / 100,
    belowStatutory,
    bankHolidaysOnTop: Math.round(bankOnTop * 100) / 100,
    nation,
    bankHolidays,
    partYear,
    fraction,
    steps,
  };
}
