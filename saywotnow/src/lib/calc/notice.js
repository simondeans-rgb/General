// Notice period calculator (Section 10.4). UK statutory minimum notice.
import { addDays, addMonths, completedMonths, compareISO, isISODate } from '../dates.js';

export function statutoryWeeks(who, months) {
  if (months < 1) return 0;
  if (who === 'Employee') return 1;
  const years = Math.floor(months / 12);
  if (years < 2) return 1;
  return Math.min(years, 12);
}

/** The last day of a notice period. Notice starts the day after it's given. */
export function noticeEnd(givenISO, amount, unit) {
  if (!amount) return givenISO;
  return unit === 'months' ? addMonths(givenISO, amount) : addDays(givenISO, amount * 7);
}

function describe(amount, unit) {
  const u = unit === 'months' ? 'month' : 'week';
  return `${amount} ${u}${amount === 1 ? '' : 's'}`;
}

/**
 * inputs: { who: 'Employer'|'Employee', startDate, noticeDate, contractAmount?, contractUnit? ('weeks'|'months') }
 */
export function calculateNotice(inputs) {
  const errors = {};
  if (!['Employer', 'Employee'].includes(inputs.who)) errors.who = 'Choose who is giving notice.';
  if (!isISODate(inputs.startDate)) errors.startDate = 'Enter the employment start date.';
  if (!isISODate(inputs.noticeDate)) errors.noticeDate = 'Enter the date notice is given.';
  if (!errors.startDate && !errors.noticeDate && compareISO(inputs.noticeDate, inputs.startDate) < 0) errors.noticeDate = 'This must be on or after the start date.';
  const hasContract = inputs.contractAmount !== undefined && inputs.contractAmount !== null && inputs.contractAmount !== '';
  const cAmount = Number(inputs.contractAmount);
  const cUnit = inputs.contractUnit === 'months' ? 'months' : 'weeks';
  if (hasContract && !(Number.isInteger(cAmount) && cAmount >= 0 && cAmount <= 104)) errors.contractAmount = 'Enter a whole number.';
  if (Object.keys(errors).length) return { ok: false, errors };

  const months = completedMonths(inputs.startDate, inputs.noticeDate);
  const years = Math.floor(months / 12);
  const statWeeks = statutoryWeeks(inputs.who, months);
  const statEnd = noticeEnd(inputs.noticeDate, statWeeks, 'weeks');
  const contractEnd = hasContract ? noticeEnd(inputs.noticeDate, cAmount, cUnit) : null;

  let applies; let lastDay; let basis;
  if (inputs.who === 'Employer') {
    if (contractEnd && compareISO(contractEnd, statEnd) > 0) { applies = describe(cAmount, cUnit); lastDay = contractEnd; basis = 'contractual'; }
    else { applies = describe(statWeeks, 'weeks'); lastDay = statEnd; basis = contractEnd && compareISO(contractEnd, statEnd) === 0 ? 'both' : 'statutory'; }
  } else if (contractEnd) {
    applies = describe(cAmount, cUnit); lastDay = contractEnd; basis = 'contractual';
  } else {
    applies = describe(statWeeks, 'weeks'); lastDay = statEnd; basis = 'statutory';
  }

  return {
    ok: true,
    months,
    years,
    statutoryWeeks: statWeeks,
    statutory: describe(statWeeks, 'weeks'),
    contractual: hasContract ? describe(cAmount, cUnit) : null,
    applies,
    basis,
    lastDay,
    noticeStarts: addDays(inputs.noticeDate, 1),
    underOneMonth: months < 1,
  };
}
