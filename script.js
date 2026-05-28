const SOON_DAYS = 14;
const EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-cadets-v1';
const MILESTONE_EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-milestones-v1';
const SDA_EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-sdas-v1';
const DRILL_EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-drills-v1';
const UNIFORM_EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-uniforms-v1';
const DASHBOARD_SORT_DEFAULT = 'dueDate';
const DUE_SORT_DEFAULT = 'dueAsc';
const MILESTONE_ACHIEVEMENTS = [
  { achievement: 'Wright Brothers', label: 'Wright Brothers' },
  { achievement: 'Billy Mitchell', label: 'Mitchell' },
  { achievement: 'Amelia Earhart', label: 'Amelia' },
  { achievement: 'Gen Ira C Eaker', label: 'Eaker' },
  { achievement: 'Gen Carl A Spaatz', label: 'Spaatz' }
];
const SDA_REQUIREMENTS = [
  { requirementField: 'SDAStaffServiceDate', sourceField: 'StaffServiceDate', label: 'Staff Service' },
  { requirementField: 'SDAOralPresentationDate', sourceField: 'OralPresentationDate', label: 'Oral Presentation' },
  { requirementField: 'SDATechnicalWritingAssignmentDate', sourceField: 'TechnicalWritingAssignmentDate', label: 'Writing Date' },
  { requirementField: 'SDATechnicalWritingAssignment', sourceField: 'TechnicalWritingAssignment', label: 'Writing Assignment' }
];
const SDA_DISPLAY_REQUIREMENTS = SDA_REQUIREMENTS;
const MILESTONE_DISPLAY_CHECKS = [
  { sourceName: 'Physical Fitness', label: 'Physical Fitness' },
  { sourceName: 'Drill', label: 'Drill' },
  { sourceName: 'Leadership Test or Module', label: 'Leadership Test' },
  { sourceName: 'Aerospace Test or Module', label: 'Aerospace Test' },
  { sourceName: 'Uniform', label: 'Uniform' }
];
const BUILT_IN_REQUIREMENTS_CSV = `Achievement,Rank,Physical Fitness,Leadership,Drill,Aerospace Education,Character Development,Active Participation,Cadet Oath,Uniform,Leadership Expectations,Special Activity,SDAStaffServiceDate,SDAOralPresentationDate,SDATechnicalWritingAssignmentDate,SDATechnicalWritingAssignment
Achievement 1,C/Amn,Attempt,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Cadet Welcome Course,None,None,None,None
Achievement 2,C/A1C,Attempt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 3,C/SrA,Attempt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Wright Brothers,C/SSgt,Pass,Pass,Pass,None,None,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 4,C/TSgt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 5,C/MSgt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 6,C/SMSgt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 7,C/CMSgt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 8,C/CMSgt',Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Essay & Speech,None,None,None,None
Billy Mitchell,C/2d Lt,Pass,Pass,None,Pass,None,Pass,Pass,Pass,Pass,Encampment,None,None,None,None
Achievement 9,C/2d Lt',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 10,C/1st Lt,Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 11,C/1st Lt',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Amelia Earhart,C/Capt,Pass,Pass,None,None,None,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 12,C/Capt',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 13,C/Capt'',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 14,C/Maj,Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 15,C/Maj',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 16,C/Maj'',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Gen Ira C Eaker,C/Lt Col,Pass,None,None,None,None,Pass,Pass,Pass,Pass,"Officer Leadership Course, Speech, & Essay",None,None,None,None
Gen Carl A Spaatz,C/Col,Pass,Pass,None,Pass,None,Pass,Pass,Pass,Pass,None,None,None,None,None`;

let cadets = [];
let requirements = parseCSV(BUILT_IN_REQUIREMENTS_CSV);
let excludedCadetKeys = loadExcludedCadets();
let excludedMilestoneKeys = loadMilestoneExclusions();
let excludedSdaKeys = loadSdaExclusions();
let excludedDrillKeys = loadDrillExclusions();
let excludedUniformKeys = loadUniformExclusions();
let loadedFileName = '';
let dashboardSorts = {
  overdue: DASHBOARD_SORT_DEFAULT,
  soon: DASHBOARD_SORT_DEFAULT,
  ready: DASHBOARD_SORT_DEFAULT
};
let dueSorts = {
  milestone: DUE_SORT_DEFAULT,
  sda: DUE_SORT_DEFAULT,
  drill: DUE_SORT_DEFAULT,
  uniform: DUE_SORT_DEFAULT
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});
const today = startOfDay(new Date());

const cadetFileInput = document.getElementById('cadetFile');
const uploadPage = document.getElementById('uploadPage');
const dashboardPage = document.getElementById('dashboardPage');
const uploadDropZone = document.getElementById('uploadDropZone');
const uploadFileName = document.getElementById('uploadFileName');
const loadedReportName = document.getElementById('loadedReportName');

cadetFileInput.addEventListener('change', handleCadetFileChange);
document.getElementById('chooseFileButton').addEventListener('click', () => cadetFileInput.click());
document.getElementById('uploadAnotherButton').addEventListener('click', () => cadetFileInput.click());
document.addEventListener('click', handleActionClick);
uploadDropZone.addEventListener('dragenter', handleUploadDrag);
uploadDropZone.addEventListener('dragover', handleUploadDrag);
uploadDropZone.addEventListener('dragleave', handleUploadDrag);
uploadDropZone.addEventListener('drop', handleUploadDrop);

document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('dashboardView').classList.toggle('hidden', btn.dataset.view !== 'dashboard');
  document.getElementById('allView').classList.toggle('hidden', btn.dataset.view !== 'all');
  document.getElementById('milestonesView').classList.toggle('hidden', btn.dataset.view !== 'milestones');
  document.getElementById('requirementsView').classList.toggle('hidden', btn.dataset.view !== 'requirements');
}));

document.getElementById('searchInput').addEventListener('input', renderAllCadets);
document.getElementById('statusFilter').addEventListener('change', renderAllCadets);
document.getElementById('achievementFilter').addEventListener('change', renderAllCadets);
document.getElementById('drillSearchInput').addEventListener('input', renderDrillTests);
document.getElementById('drillStatusFilter').addEventListener('change', renderDrillTests);
document.getElementById('drillAchievementFilter').addEventListener('change', renderDrillTests);
document.getElementById('uniformSearchInput').addEventListener('input', renderUniformTests);
document.getElementById('uniformStatusFilter').addEventListener('change', renderUniformTests);
document.getElementById('uniformAchievementFilter').addEventListener('change', renderUniformTests);
document.getElementById('printMilestonesButton').addEventListener('click', handlePrintMilestonesReport);
window.addEventListener('afterprint', () => document.body.classList.remove('printing-report'));
document.querySelectorAll('.dashboard-sort').forEach(select => {
  select.value = dashboardSorts[select.dataset.section] || DASHBOARD_SORT_DEFAULT;
  select.addEventListener('change', handleDashboardSortChange);
});
document.querySelectorAll('.due-sort').forEach(select => {
  select.value = dueSorts[select.dataset.table] || DUE_SORT_DEFAULT;
  select.addEventListener('change', handleDueSortChange);
});

async function handleCadetFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  await processCadetFile(file);
  event.target.value = '';
}

async function processCadetFile(file) {
  const previousCadets = cadets;
  const previousFileName = loadedFileName;
  setSelectedFileName(file.name);

  try {
    setStatusMessage(`Loading ${file.name}...`, 'info');
    const rows = await loadCadetRows(file);
    validateCadetRows(rows);
    cadets = rows.map(analyzeCadet);
    loadedFileName = file.name;
    populateAchievementFilter();
    populateDrillAchievementFilter();
    populateUniformAchievementFilter();
    renderAll();
    showDashboard();

    const visibleCount = getDashboardCadets().length;
    setStatusMessage(
      `${cadets.length} cadets loaded from ${file.name}. ${visibleCount} currently shown on the main dashboard.`,
      'success'
    );
  } catch (error) {
    console.error(error);
    cadets = previousCadets;
    loadedFileName = previousFileName;
    populateAchievementFilter();
    populateDrillAchievementFilter();
    populateUniformAchievementFilter();
    renderAll();
    if (cadets.length) {
      showDashboard();
    } else {
      showUploadPage();
    }
    setStatusMessage(error.message || 'Unable to read that report.', 'error');
  }
}

function handleUploadDrag(event) {
  event.preventDefault();
  event.stopPropagation();
  uploadDropZone.classList.toggle('drag-over', event.type === 'dragenter' || event.type === 'dragover');
}

async function handleUploadDrop(event) {
  handleUploadDrag(event);
  const file = event.dataTransfer.files[0];
  if (file) await processCadetFile(file);
}

async function loadCadetRows(file) {
  const lowerName = clean(file.name).toLowerCase();

  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
    if (!window.XLSX) {
      throw new Error('Excel support did not load. Refresh the page and try again, or upload a CSV export.');
    }

    const workbook = window.XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) {
      throw new Error('The uploaded workbook does not contain any sheets.');
    }

    const csvText = window.XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet], { blankrows: false });
    return parseCSV(csvText);
  }

  if (lowerName.endsWith('.csv')) {
    return parseCSV(await file.text());
  }

  throw new Error('Upload a cadet full-track report in CSV or XLSX format.');
}

function validateCadetRows(rows) {
  if (!rows.length) {
    throw new Error('That file did not contain any cadet rows.');
  }

  const headers = new Set(Object.keys(rows[0]).map(header => clean(header)));
  const hasCadetName = headers.has('NameFirst') || headers.has('NameLast');

  if (!headers.has('AchvName') || !headers.has('CAPID') || !hasCadetName) {
    throw new Error('That file does not look like a cadet full-track report. Upload the export with CAPID, cadet name, and achievement columns.');
  }
}

function handleActionClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;

  const action = clean(button.dataset.action);
  if (action === 'bulk-exclude-milestone') {
    bulkExcludeMilestone(button.dataset.achievement);
    return;
  }

  if (action === 'bulk-include-milestone') {
    bulkIncludeMilestone(button.dataset.achievement);
    return;
  }

  const key = clean(button.dataset.key);
  if (!key) return;

  if (action === 'exclude') {
    excludedCadetKeys.add(key);
    persistExcludedCadets();
    renderAll();
    setStatusMessage('Cadet excluded from the main dashboard.', 'info');
    return;
  }

  if (action === 'include') {
    excludedCadetKeys.delete(key);
    persistExcludedCadets();
    renderAll();
    setStatusMessage('Cadet re-added to the main dashboard.', 'success');
    return;
  }

  if (action === 'exclude-milestone') {
    excludedMilestoneKeys.add(key);
    persistMilestoneExclusions();
    renderAll();
    setStatusMessage('Cadet excluded from milestone tests.', 'info');
    return;
  }

  if (action === 'include-milestone') {
    excludedMilestoneKeys.delete(key);
    persistMilestoneExclusions();
    renderAll();
    setStatusMessage('Cadet re-added to milestone tests.', 'success');
    return;
  }

  if (action === 'exclude-sda') {
    excludedSdaKeys.add(key);
    persistSdaExclusions();
    renderAll();
    setStatusMessage('Cadet excluded from SDA requirements.', 'info');
    return;
  }

  if (action === 'include-sda') {
    excludedSdaKeys.delete(key);
    persistSdaExclusions();
    renderAll();
    setStatusMessage('Cadet re-added to SDA requirements.', 'success');
    return;
  }

  if (action === 'exclude-drill') {
    excludedDrillKeys.add(key);
    persistDrillExclusions();
    renderAll();
    setStatusMessage('Cadet excluded from drill tests.', 'info');
    return;
  }

  if (action === 'include-drill') {
    excludedDrillKeys.delete(key);
    persistDrillExclusions();
    renderAll();
    setStatusMessage('Cadet re-added to drill tests.', 'success');
    return;
  }

  if (action === 'exclude-uniform') {
    excludedUniformKeys.add(key);
    persistUniformExclusions();
    renderAll();
    setStatusMessage('Cadet excluded from uniform tests.', 'info');
    return;
  }

  if (action === 'include-uniform') {
    excludedUniformKeys.delete(key);
    persistUniformExclusions();
    renderAll();
    setStatusMessage('Cadet re-added to uniform tests.', 'success');
  }
}

function bulkExcludeMilestone(achievement) {
  const visibleRows = getVisibleMilestoneRows()
    .filter(cadet => clean(cadet.achievement).toLowerCase() === clean(achievement).toLowerCase());

  if (!visibleRows.length) {
    setStatusMessage('No shown cadets are available to exclude for that milestone.', 'info');
    return;
  }

  visibleRows.forEach(cadet => excludedMilestoneKeys.add(cadet.key));
  persistMilestoneExclusions();
  renderAll();
  setStatusMessage(`${formatCadetCount(visibleRows.length)} excluded from ${milestoneLabel(achievement) || achievement}.`, 'info');
}

function bulkIncludeMilestone(achievement) {
  const excludedRows = getExcludedMilestoneCadets()
    .filter(cadet => clean(cadet.achievement).toLowerCase() === clean(achievement).toLowerCase());

  if (!excludedRows.length) {
    setStatusMessage('No excluded cadets are available to re-add for that milestone.', 'info');
    return;
  }

  excludedRows.forEach(cadet => excludedMilestoneKeys.delete(cadet.key));
  persistMilestoneExclusions();
  renderAll();
  setStatusMessage(`${formatCadetCount(excludedRows.length)} re-added to ${milestoneLabel(achievement) || achievement}.`, 'success');
}

function handleDashboardSortChange(event) {
  const section = clean(event.target.dataset.section);
  if (!section) return;

  dashboardSorts[section] = event.target.value || DASHBOARD_SORT_DEFAULT;
  renderDashboardTables();
}

function handleDueSortChange(event) {
  const table = clean(event.target.dataset.table);
  if (!table) return;

  dueSorts[table] = event.target.value || DUE_SORT_DEFAULT;
  if (table === 'drill') {
    renderDrillTests();
    return;
  }

  if (table === 'uniform') {
    renderUniformTests();
    return;
  }

  renderMilestonesAndSdas();
}

function handlePrintMilestonesReport() {
  renderPrintableMilestonesReport();
  document.body.classList.add('printing-report');
  window.print();
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  text = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < text.length; i += 1) {
    const current = text[i];
    const next = text[i + 1];

    if (current === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (current === '"') {
      inQuotes = !inQuotes;
    } else if (current === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((current === '\n' || current === '\r') && !inQuotes) {
      if (current === '\r' && next === '\n') i += 1;
      row.push(cell.trim());
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += current;
    }
  }

  if (cell || row.length) {
    row.push(cell.trim());
    if (row.some(value => value !== '')) rows.push(row);
  }

  if (!rows.length) return [];

  const headers = rows[0].map(header => header.trim());
  return rows.slice(1).map(values => Object.fromEntries(
    headers.map((header, index) => [header, (values[index] ?? '').trim()])
  ));
}

function analyzeCadet(raw) {
  const achievement = clean(raw.AchvName);
  const requirementRow = findRequirementForAchievement(achievement);
  const rank = clean(requirementRow.Rank || requirementRow.Grade);
  const rankOrder = achievementOrder(achievement);
  const dueDate = parseDate(raw.NextApprovalDate) || addDays(parseDate(raw.AprDate) || parseDate(raw.JoinDate), 56);
  const checks = buildChecks(raw, requirementRow);
  const completed = checks.filter(check => check.done).length;
  const total = checks.length || 1;
  const missing = checks.filter(check => !check.done).map(check => check.name);
  const daysUntil = dueDate ? Math.ceil((startOfDay(dueDate) - today) / 86400000) : null;
  const ready = missing.length === 0;

  let status = 'Future';
  if (ready) status = 'Ready';
  else if (daysUntil !== null && daysUntil < 0) status = 'Overdue';
  else if (daysUntil !== null && daysUntil <= SOON_DAYS) status = 'Due Soon';
  else status = 'Not Ready';

  return {
    raw,
    key: cadetKey(raw),
    capid: raw.CAPID,
    name: `${clean(raw.NameFirst)} ${clean(raw.NameLast)}`.trim(),
    email: raw.Email,
    achievement,
    rank,
    rankOrder,
    milestoneLabel: milestoneLabel(achievement),
    dueDate,
    daysUntil,
    status,
    ready,
    checks,
    completed,
    total,
    missing,
    progress: Math.round((completed / total) * 100)
  };
}

function findRequirementForAchievement(achievement) {
  return requirements.find(row => clean(row.Achievement).toLowerCase() === clean(achievement).toLowerCase()) || {};
}

function buildChecks(cadet, requirementRow) {
  const checks = [];
  addCheck(checks, requirementRow['Physical Fitness'], 'Physical Fitness', hasValue(cadet.PhyFitTest));
  addCheck(
    checks,
    requirementRow.Leadership,
    'Leadership Test or Module',
    passScore(cadet.LeadLabDateP, cadet.LeadLabScore) || hasValue(cadet.LeadershipInteractiveDate)
  );
  addCheck(checks, requirementRow.Drill, 'Drill', hasValue(cadet.DrillDate) && number(cadet.DrillScore) > 0);
  addCheck(
    checks,
    requirementRow['Aerospace Education'],
    'Aerospace Test or Module',
    passScore(cadet.AEDateP, cadet.AEScore) || hasValue(cadet.AEInteractiveDate)
  );
  addCheck(checks, requirementRow['Character Development'], 'Character Development', hasValue(cadet.CharacterDevelopment));
  addCheck(
    checks,
    requirementRow['Active Participation'],
    'Active Participation',
    truthy(cadet.ActivePart) || hasValue(cadet.ActiveParticipationDate)
  );
  addCheck(checks, requirementRow['Cadet Oath'], 'Cadet Oath', truthy(cadet.CadetOath) || hasValue(cadet.CadetOathDate));
  addCheck(checks, requirementRow.Uniform, 'Uniform', hasValue(cadet.UniformDate));
  addCheck(
    checks,
    requirementRow['Leadership Expectations'],
    'Leadership Expectations',
    hasValue(cadet.LeadershipExpectationsDate)
  );
  addSpecialActivity(checks, requirementRow['Special Activity'], cadet);
  addCheck(checks, requirementRow.SDAStaffServiceDate, 'SDA Staff Service', hasValue(cadet.StaffServiceDate));
  addCheck(checks, requirementRow.SDAOralPresentationDate, 'SDA Oral Presentation', hasValue(cadet.OralPresentationDate));
  addCheck(
    checks,
    requirementRow.SDATechnicalWritingAssignmentDate,
    'SDA Technical Writing Date',
    hasValue(cadet.TechnicalWritingAssignmentDate)
  );
  addCheck(
    checks,
    requirementRow.SDATechnicalWritingAssignment,
    'SDA Technical Writing Assignment',
    hasValue(cadet.TechnicalWritingAssignment)
  );
  return checks;
}

function addCheck(checks, requirementValue, name, done) {
  if (hasValue(requirementValue)) checks.push({ name, done });
}

function addSpecialActivity(checks, requirementValue, cadet) {
  if (!hasValue(requirementValue)) return;

  const normalized = requirementValue.toLowerCase();
  if (normalized.includes('welcome')) {
    checks.push({ name: 'Cadet Welcome Course', done: hasValue(cadet.WelcomeCourseDate) });
  } else if (normalized.includes('essay') && normalized.includes('speech') && normalized.includes('officer')) {
    checks.push({ name: 'Officer Leadership Course / Special Activity', done: hasValue(cadet.SpecialActivityDate) });
  } else if (normalized.includes('essay') && normalized.includes('speech')) {
    checks.push({ name: 'Essay', done: hasValue(cadet.EssayDate) });
    checks.push({ name: 'Speech', done: hasValue(cadet.SpeechDate) });
  } else if (normalized.includes('encampment')) {
    checks.push({ name: 'Encampment', done: hasValue(cadet.SpecialActivityDate) });
  } else {
    checks.push({ name: requirementValue, done: hasValue(cadet.SpecialActivityDate) });
  }
}

function renderAll() {
  renderStats();
  renderDashboardTables();
  renderAllCadets();
  renderMilestonesAndSdas();
  renderDrillTests();
  renderUniformTests();
  renderExcludedCadets();
  renderRequirements();
}

function renderStats() {
  const dashboardCadets = getDashboardCadets();
  const excludedLoadedCadets = getExcludedLoadedCadets();
  const stats = [
    ['Cadets Loaded', cadets.length],
    ['Shown on Dashboard', dashboardCadets.length],
    ['Excluded', excludedLoadedCadets.length],
    ['Overdue', dashboardCadets.filter(cadet => cadet.status === 'Overdue').length],
    ['Due Soon', dashboardCadets.filter(cadet => cadet.status === 'Due Soon').length],
    ['Ready Now', dashboardCadets.filter(cadet => cadet.status === 'Ready').length],
    ['Avg. Complete', dashboardCadets.length ? `${Math.round(dashboardCadets.reduce((sum, cadet) => sum + cadet.progress, 0) / dashboardCadets.length)}%` : '0%']
  ];

  document.getElementById('stats').innerHTML = stats
    .map(([label, value]) => `<div class="stat"><div class="num">${value}</div><div class="label">${label}</div></div>`)
    .join('');
}

function renderDashboardTables() {
  const dashboardCadets = getDashboardCadets();
  const noDashboardCadets = cadets.length && !dashboardCadets.length;
  const overdue = sortDashboardRows(
    dashboardCadets.filter(cadet => cadet.status === 'Overdue'),
    dashboardSorts.overdue
  );
  const soon = sortDashboardRows(
    dashboardCadets.filter(cadet => cadet.status === 'Due Soon'),
    dashboardSorts.soon
  );
  const ready = sortDashboardRows(
    dashboardCadets.filter(cadet => cadet.status === 'Ready'),
    dashboardSorts.ready
  );

  setSectionCount('overdueCount', overdue.length);
  setSectionCount('soonCount', soon.length);
  setSectionCount('readyCount', ready.length);

  renderCadetTable(document.getElementById('overdueTable'), overdue, {
    compact: true,
    emptyMessage: noDashboardCadets ? 'All loaded cadets are currently excluded from the main dashboard.' : 'No overdue cadets.'
  });
  renderCadetTable(document.getElementById('soonTable'), soon, {
    compact: true,
    emptyMessage: noDashboardCadets ? 'All loaded cadets are currently excluded from the main dashboard.' : 'No cadets are due soon.'
  });
  renderCadetTable(document.getElementById('readyTable'), ready, {
    compact: true,
    emptyMessage: noDashboardCadets ? 'All loaded cadets are currently excluded from the main dashboard.' : 'No cadets are ready now.'
  });
}

function sortDashboardRows(rows, sortKey = DASHBOARD_SORT_DEFAULT) {
  const sorted = [...rows];

  sorted.sort((left, right) => {
    if (sortKey === 'name') {
      return compareText(left.name, right.name) || compareDueDate(left, right);
    }

    if (sortKey === 'rank') {
      return compareRank(left, right) || compareText(left.name, right.name);
    }

    if (sortKey === 'progress') {
      return (right.progress - left.progress) || compareDueDate(left, right) || compareText(left.name, right.name);
    }

    return compareDueDate(left, right) || compareText(left.name, right.name);
  });

  return sorted;
}

function sortPromotionRows(rows) {
  return [...rows].sort((left, right) =>
    compareRank(left, right) || compareDueDate(left, right) || compareText(left.name, right.name)
  );
}

function sortDueRows(rows, direction = DUE_SORT_DEFAULT) {
  return [...rows].sort((left, right) =>
    compareDueDateWithDirection(left, right, direction) || compareRank(left, right) || compareText(left.name, right.name)
  );
}

function renderAllCadets() {
  let rows = [...cadets];
  const query = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const achievement = document.getElementById('achievementFilter').value;

  if (query) {
    rows = rows.filter(cadet => matchesCadetSearch(cadet, query));
  }
  if (status !== 'all') rows = rows.filter(cadet => cadet.status === status);
  if (achievement !== 'all') rows = rows.filter(cadet => cadet.achievement === achievement);

  rows.sort((left, right) => (left.dueDate || 0) - (right.dueDate || 0));
  renderCadetTable(document.getElementById('allTable'), rows, {
    compact: false,
    emptyMessage: 'No cadets match this view.'
  });
}

function renderMilestonesAndSdas() {
  const allMilestoneRows = getMilestoneRows();
  const milestoneRows = getVisibleMilestoneRows();
  const allSdaRows = getSdaRows();
  const sdaRows = getVisibleSdaRows();
  const excludedMilestones = getExcludedMilestoneCadets();
  const excludedSdas = getExcludedSdaCadets();

  setSectionCount('milestoneCount', milestoneRows.length);
  setSectionCount('sdaCount', sdaRows.length);
  document.getElementById('milestoneExcludedCount').textContent = `${excludedMilestones.length} excluded`;
  document.getElementById('sdaExcludedCount').textContent = `${excludedSdas.length} excluded`;
  renderMilestoneSummary(milestoneRows, allMilestoneRows);
  renderMilestoneTable(document.getElementById('milestoneTable'), milestoneRows, allMilestoneRows.length);
  renderSdaTable(document.getElementById('sdaTable'), sdaRows, allSdaRows.length);
  renderMilestoneSdaExclusions(excludedMilestones, excludedSdas);
}

function renderMilestoneSummary(rows, allRows) {
  const container = document.getElementById('milestoneSummary');
  container.innerHTML = MILESTONE_ACHIEVEMENTS
    .map(milestone => {
      const count = rows.filter(cadet => clean(cadet.achievement).toLowerCase() === milestone.achievement.toLowerCase()).length;
      const totalCount = allRows.filter(cadet => clean(cadet.achievement).toLowerCase() === milestone.achievement.toLowerCase()).length;
      const excludedCount = totalCount - count;
      const action = count ? 'bulk-exclude-milestone' : 'bulk-include-milestone';
      const buttonLabel = totalCount ? (count ? 'Exclude All Shown' : 'Re-add Excluded') : 'No Cadets';
      const buttonClass = count ? 'exclude' : 'include';
      const disabled = totalCount ? '' : 'disabled';
      return `<div class="summary-card">
        <div class="summary-num">${count}</div>
        <div class="summary-label">${esc(milestone.label)}${excludedCount ? ` | ${excludedCount} excluded` : ''}</div>
        <button class="action-chip ${buttonClass}" type="button" data-action="${action}" data-achievement="${esc(milestone.achievement)}" ${disabled}>${buttonLabel}</button>
      </div>`;
    })
    .join('');
}

function renderMilestoneTable(table, rows, totalRows) {
  if (!cadets.length) {
    table.innerHTML = '<tr><td class="empty">Upload a cadet full-track report to see milestone tests.</td></tr>';
    return;
  }

  if (!rows.length) {
    table.innerHTML = `<tr><td class="empty">${totalRows ? 'All loaded milestone cadets are currently excluded.' : 'No loaded cadets are currently working on milestone tests.'}</td></tr>`;
    return;
  }

  table.innerHTML = `<thead><tr>
      <th>Cadet</th>
      <th>Milestone</th>
      <th>Due</th>
      <th>Status</th>
      <th>Progress</th>
      <th>Requirements</th>
    </tr></thead><tbody>` +
    rows.map(cadet => `<tr>
      <td>
        <strong>${esc(cadet.name || 'Unknown')}</strong><br>
        <span class="note">CAPID ${esc(cadet.capid || '')}</span>
        <div class="cadet-actions"><button class="action-chip exclude" type="button" data-action="exclude-milestone" data-key="${esc(cadet.key)}">Exclude</button></div>
      </td>
      <td><strong class="achievement-name">${esc(cadet.achievement)}</strong>${cadet.rank ? `<br><span class="achievement-rank">${esc(cadet.rank)}</span>` : ''}</td>
      <td>${formatDate(cadet.dueDate)}<br><span class="note">${daysText(cadet.daysUntil)}</span></td>
      <td><span class="badge ${statusClass(cadet.status)}">${cadet.status}</span></td>
      <td><span class="progress"><span style="width:${cadet.progress}%"></span></span>${cadet.completed}/${cadet.total}</td>
      <td><div class="missing-list">${renderMilestoneRequirements(cadet)}</div></td>
    </tr>`).join('') +
    '</tbody>';
}

function renderSdaTable(table, rows, totalRows) {
  if (!cadets.length) {
    table.innerHTML = '<tr><td class="empty">Upload a cadet full-track report to see SDA requirements.</td></tr>';
    return;
  }

  if (!rows.length) {
    table.innerHTML = `<tr><td class="empty">${totalRows ? 'All loaded SDA cadets are currently excluded.' : 'No loaded cadets currently have SDA requirements.'}</td></tr>`;
    return;
  }

  table.innerHTML = `<thead><tr>
      <th>Cadet</th>
      <th>Achievement</th>
      <th>Due</th>
      ${SDA_DISPLAY_REQUIREMENTS.map(item => `<th>${esc(item.label)}</th>`).join('')}
    </tr></thead><tbody>` +
    rows.map(cadet => `<tr>
      <td>
        <strong>${esc(cadet.name || 'Unknown')}</strong><br>
        <span class="note">CAPID ${esc(cadet.capid || '')}</span>
        <div class="cadet-actions"><button class="action-chip exclude" type="button" data-action="exclude-sda" data-key="${esc(cadet.key)}">Exclude</button></div>
      </td>
      <td><strong class="achievement-name">${esc(cadet.achievement || 'Unknown')}</strong>${cadet.rank ? `<br><span class="achievement-rank">${esc(cadet.rank)}</span>` : ''}</td>
      <td>${formatDate(cadet.dueDate)}<br><span class="note">${daysText(cadet.daysUntil)}</span></td>
      ${SDA_DISPLAY_REQUIREMENTS.map(item => `<td>${renderSdaCell(cadet, item)}</td>`).join('')}
    </tr>`).join('') +
    '</tbody>';
}

function renderSdaCell(cadet, item) {
  const status = getSdaRequirementStatus(cadet, item);
  if (!status.required) return '<span class="badge future">Not required</span>';

  const detail = status.done ? `<span class="cell-detail">${esc(status.value)}</span>` : '';
  return `<span class="badge ${status.done ? 'ready' : 'overdue'}">${status.label}</span>${detail}`;
}

function renderMilestoneRequirements(cadet) {
  const checks = getMilestoneRequirementChecks(cadet);

  if (!checks.length) return '<span class="badge future">No tracked items</span>';

  return checks
    .map(check => `<span class="pill ${check.done ? 'pill-complete' : 'pill-incomplete'}">${esc(check.name)}</span>`)
    .join('');
}

function renderDrillTests() {
  const rows = getVisibleDrillRows();
  const excludedDrills = getExcludedDrillCadets();

  setSectionCount('drillCount', rows.length);
  document.getElementById('drillExcludedCount').textContent = `${excludedDrills.length} excluded`;
  renderDrillTable(document.getElementById('drillTable'), rows);
  renderDrillExclusions(excludedDrills);
}

function renderDrillTable(table, rows) {
  if (!cadets.length) {
    table.innerHTML = '<tr><td class="empty">Upload a cadet full-track report to see drill tests.</td></tr>';
    return;
  }

  if (!rows.length) {
    table.innerHTML = '<tr><td class="empty">No cadets match the drill test filters.</td></tr>';
    return;
  }

  table.innerHTML = `<thead><tr>
      <th>Cadet</th>
      <th>Achievement</th>
      <th>Due</th>
      <th>Drill Status</th>
    </tr></thead><tbody>` +
    rows.map(cadet => `<tr>
      <td>
        <strong>${esc(cadet.name || 'Unknown')}</strong><br>
        <span class="note">CAPID ${esc(cadet.capid || '')}</span>
        <div class="cadet-actions"><button class="action-chip exclude" type="button" data-action="exclude-drill" data-key="${esc(cadet.key)}">Exclude</button></div>
      </td>
      <td><strong class="achievement-name">${esc(cadet.achievement || 'Unknown')}</strong>${cadet.rank ? `<br><span class="achievement-rank">${esc(cadet.rank)}</span>` : ''}</td>
      <td>${formatDate(cadet.dueDate)}<br><span class="note">${daysText(cadet.daysUntil)}</span></td>
      <td>${renderDrillStatus(cadet)}</td>
    </tr>`).join('') +
    '</tbody>';
}

function renderDrillStatus(cadet) {
  return hasCompleteDrillTest(cadet)
    ? '<span class="badge ready">Complete</span>'
    : '<span class="badge overdue">Needs Drill</span>';
}

function renderDrillExclusions(drillRows) {
  renderScopedExclusionList({
    containerId: 'excludedDrillsList',
    rows: drillRows,
    emptyMessage: 'No cadets are excluded from drill tests.',
    noDataMessage: 'Upload a cadet report to manage drill exclusions.',
    action: 'include-drill',
    buttonLabel: 'Re-add to Drills'
  });
}

function renderUniformTests() {
  const rows = getVisibleUniformRows();
  const excludedUniforms = getExcludedUniformCadets();

  setSectionCount('uniformCount', rows.length);
  document.getElementById('uniformExcludedCount').textContent = `${excludedUniforms.length} excluded`;
  renderUniformTable(document.getElementById('uniformTable'), rows);
  renderUniformExclusions(excludedUniforms);
}

function renderUniformTable(table, rows) {
  if (!cadets.length) {
    table.innerHTML = '<tr><td class="empty">Upload a cadet full-track report to see uniform tests.</td></tr>';
    return;
  }

  if (!rows.length) {
    table.innerHTML = '<tr><td class="empty">No cadets match the uniform test filters.</td></tr>';
    return;
  }

  table.innerHTML = `<thead><tr>
      <th>Cadet</th>
      <th>Achievement</th>
      <th>Due</th>
      <th>Uniform Status</th>
    </tr></thead><tbody>` +
    rows.map(cadet => `<tr>
      <td>
        <strong>${esc(cadet.name || 'Unknown')}</strong><br>
        <span class="note">CAPID ${esc(cadet.capid || '')}</span>
        <div class="cadet-actions"><button class="action-chip exclude" type="button" data-action="exclude-uniform" data-key="${esc(cadet.key)}">Exclude</button></div>
      </td>
      <td><strong class="achievement-name">${esc(cadet.achievement || 'Unknown')}</strong>${cadet.rank ? `<br><span class="achievement-rank">${esc(cadet.rank)}</span>` : ''}</td>
      <td>${formatDate(cadet.dueDate)}<br><span class="note">${daysText(cadet.daysUntil)}</span></td>
      <td>${renderUniformStatus(cadet)}</td>
    </tr>`).join('') +
    '</tbody>';
}

function renderUniformStatus(cadet) {
  return hasCompleteUniformTest(cadet)
    ? '<span class="badge ready">Complete</span>'
    : '<span class="badge overdue">Needs Uniform</span>';
}

function renderUniformExclusions(uniformRows) {
  renderScopedExclusionList({
    containerId: 'excludedUniformsList',
    rows: uniformRows,
    emptyMessage: 'No cadets are excluded from uniform tests.',
    noDataMessage: 'Upload a cadet report to manage uniform exclusions.',
    action: 'include-uniform',
    buttonLabel: 'Re-add to Uniforms'
  });
}

function renderPrintableMilestonesReport() {
  const report = document.getElementById('milestonesPrintReport');
  const printedOn = dateFormatter.format(new Date());

  const milestoneRows = sortPrintableDueRows(getVisibleMilestoneRows()).map(cadet => [
    printCell(cadet.name || 'Unknown', hasHighlightedMilestonePrintRequirement(cadet) ? 'print-missing' : ''),
    cadet.achievement || 'Unknown',
    weeksFromDueText(cadet),
    getMissingMilestoneRequirementLabels(cadet).join(', ') || 'None',
    ...MILESTONE_DISPLAY_CHECKS.map(item => getCheckStatusPrintCell(cadet, item.sourceName))
  ]);
  const sdaRows = sortPrintableDueRows(getVisibleSdaRows()).map(cadet => [
    printCell(cadet.name || 'Unknown', hasHighlightedSdaPrintRequirement(cadet) ? 'print-missing' : ''),
    cadet.achievement || 'Unknown',
    weeksFromDueText(cadet),
    getMissingSdaRequirementLabels(cadet).join(', ') || 'None',
    ...SDA_DISPLAY_REQUIREMENTS.map(item => getSdaRequirementPrintCell(cadet, item))
  ]);
  const drillRows = sortPrintableDueRows(getVisibleDrillRows()).map(cadet => [
    cadet.name || 'Unknown',
    weeksFromDueText(cadet),
    getDrillTestRequiredLabel(cadet)
  ]);
  const uniformNames = getVisibleUniformRows().map(cadet => cadet.name || 'Unknown');

  report.innerHTML = `
    <div class="print-report-header">
      <h1>Milestones, SDAs, Drill & Uniform</h1>
      <p>${esc(loadedFileName || 'No report file loaded')} | Printed ${esc(printedOn)}</p>
    </div>
    ${renderPrintTable(
      'Milestones',
      ['Name', 'Promotion Name', 'Weeks From Due', 'Missing Items', ...MILESTONE_DISPLAY_CHECKS.map(item => item.label)],
      milestoneRows,
      'No milestone cadets are shown with the current exclusions.'
    )}
    ${renderPrintTable(
      'SDAs',
      ['Name', 'Achievement', 'Weeks From Due', 'Missing Items', ...SDA_DISPLAY_REQUIREMENTS.map(item => item.label)],
      sdaRows,
      'No SDA cadets are shown with the current exclusions.'
    )}
    ${renderPrintTable(
      'Drill',
      ['Name', 'Weeks From Due', 'Drill Test Required'],
      drillRows,
      'No drill cadets match the current filters and exclusions.'
    )}
    ${renderPrintNameColumns(
      'Uniform',
      uniformNames,
      'No uniform cadets match the current filters and exclusions.'
    )}
  `;
}

function renderPrintTable(title, headers, rows, emptyMessage) {
  return `<section class="print-section">
    <h2>${esc(title)}</h2>
    <table class="print-table">
      <thead><tr>${headers.map(header => `<th>${esc(header)}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.length
    ? rows.map(row => `<tr>${row.map(renderPrintCell).join('')}</tr>`).join('')
    : `<tr><td class="print-empty" colspan="${headers.length}">${esc(emptyMessage)}</td></tr>`}
      </tbody>
    </table>
  </section>`;
}

function renderPrintCell(cell) {
  const normalized = normalizePrintCell(cell);
  const classAttribute = normalized.className ? ` class="${esc(normalized.className)}"` : '';
  return `<td${classAttribute}>${esc(normalized.value)}</td>`;
}

function normalizePrintCell(cell) {
  if (cell && typeof cell === 'object' && !Array.isArray(cell)) {
    return {
      value: cell.value,
      className: clean(cell.className)
    };
  }

  return {
    value: cell,
    className: ''
  };
}

function printCell(value, className = '') {
  return { value, className };
}

function renderPrintNameColumns(title, names, emptyMessage) {
  const rows = [];
  for (let index = 0; index < names.length; index += 3) {
    rows.push(names.slice(index, index + 3));
  }

  return `<section class="print-section">
    <h2>${esc(title)}</h2>
    <table class="print-table print-name-columns">
      <thead><tr><th>Name</th><th>Name</th><th>Name</th></tr></thead>
      <tbody>
        ${rows.length
    ? rows.map(row => `<tr>${[0, 1, 2].map(index => `<td>${esc(row[index] || '')}</td>`).join('')}</tr>`).join('')
    : `<tr><td class="print-empty" colspan="3">${esc(emptyMessage)}</td></tr>`}
      </tbody>
    </table>
  </section>`;
}

function sortPrintableDueRows(rows) {
  return [...rows].sort((left, right) =>
    printableDuePriority(left) - printableDuePriority(right) ||
    compareDueDate(left, right) ||
    compareRank(left, right) ||
    compareText(left.name, right.name)
  );
}

function printableDuePriority(cadet) {
  if (!(cadet.dueDate instanceof Date)) return 2;
  return cadet.daysUntil < 0 ? 0 : 1;
}

function weeksFromDueText(cadet) {
  const days = cadet.daysUntil;
  if (days === null || days === undefined || Number.isNaN(days)) return 'No due date';
  if (days === 0) return 'Due this week';

  const weeks = Math.max(1, Math.ceil(Math.abs(days) / 7));
  const label = `${weeks} week${weeks === 1 ? '' : 's'}`;
  return days < 0 ? `${label} late` : `${label} away`;
}

function getCheckStatusLabel(cadet, sourceName) {
  const check = cadet.checks.find(candidate => candidate.name === sourceName);
  if (!check) return 'Not required';
  return check.done ? 'Complete' : 'Missing';
}

function getCheckStatusPrintCell(cadet, sourceName) {
  const label = getCheckStatusLabel(cadet, sourceName);
  const highlightMissing = isHighlightedMilestonePrintRequirement(sourceName);
  return printCell(label, label === 'Missing' && highlightMissing ? 'print-missing' : '');
}

function isCheckComplete(cadet, sourceName) {
  const check = cadet.checks.find(candidate => candidate.name === sourceName);
  return Boolean(check && check.done);
}

function getSdaRequirementStatusLabel(cadet, item) {
  if (!item) return 'Not required';

  const status = getSdaRequirementStatus(cadet, item);
  if (!status.required) return 'Not required';

  return status.label;
}

function getSdaRequirementPrintCell(cadet, item) {
  const label = getSdaRequirementStatusLabel(cadet, item);
  const highlightMissing = isHighlightedSdaPrintRequirement(item);
  return printCell(label, label === 'Missing' && highlightMissing ? 'print-missing' : '');
}

function hasHighlightedMilestonePrintRequirement(cadet) {
  return MILESTONE_DISPLAY_CHECKS.some(item =>
    isHighlightedMilestonePrintRequirement(item.sourceName) &&
    getCheckStatusLabel(cadet, item.sourceName) === 'Missing'
  );
}

function hasHighlightedSdaPrintRequirement(cadet) {
  return SDA_DISPLAY_REQUIREMENTS.some(item =>
    isHighlightedSdaPrintRequirement(item) &&
    getSdaRequirementStatusLabel(cadet, item) === 'Missing'
  );
}

function isHighlightedMilestonePrintRequirement(sourceName) {
  return ['Aerospace Test or Module', 'Leadership Test or Module'].includes(sourceName);
}

function isHighlightedSdaPrintRequirement(item) {
  return item.sourceField === 'OralPresentationDate';
}

function getSdaRequirementStatus(cadet, item) {
  const requirementRow = findRequirementForAchievement(cadet.achievement);
  const required = hasValue(requirementRow[item.requirementField]);
  const value = clean(cadet.raw[item.sourceField]);

  return {
    required,
    done: required && hasValue(value),
    value,
    label: required && hasValue(value) ? 'Complete' : 'Missing'
  };
}

function getMilestoneRequirementChecks(cadet) {
  const featuredChecks = MILESTONE_DISPLAY_CHECKS
    .map(item => {
      const check = cadet.checks.find(candidate => candidate.name === item.sourceName);
      return check ? { ...check, name: item.label, sourceName: item.sourceName } : null;
    })
    .filter(Boolean);
  const featuredNames = new Set(featuredChecks.map(check => check.sourceName));
  const extraChecks = cadet.checks.filter(check => !featuredNames.has(check.name));

  return [...featuredChecks, ...extraChecks];
}

function getMissingMilestoneRequirementLabels(cadet) {
  return getMilestoneRequirementChecks(cadet)
    .filter(check => !check.done)
    .map(check => check.name);
}

function getMissingSdaRequirementLabels(cadet) {
  return SDA_REQUIREMENTS
    .filter(item => {
      const status = getSdaRequirementStatus(cadet, item);
      return status.required && !status.done;
    })
    .map(item => item.label);
}

function getDrillTestRequiredLabel(cadet) {
  const achievement = clean(cadet.achievement);

  if (achievement.toLowerCase() === 'wright brothers') {
    return isCheckComplete(cadet, 'Leadership Test or Module')
      ? 'Wright Brothers Drill Test'
      : 'Wright Brothers Leadership Test Must Be Completed First';
  }

  const match = achievement.match(/Achievement\s+(\d+)/i);
  if (match) return `Drill Test ${match[1]}`;

  return achievement ? `${achievement} Drill Test` : 'Drill Test';
}

function renderMilestoneSdaExclusions(milestoneRows, sdaRows) {
  renderScopedExclusionList({
    containerId: 'excludedMilestonesList',
    rows: milestoneRows,
    emptyMessage: 'No cadets are excluded from milestone tests.',
    noDataMessage: 'Upload a cadet report to manage milestone exclusions.',
    action: 'include-milestone',
    buttonLabel: 'Re-add to Milestones'
  });
  renderScopedExclusionList({
    containerId: 'excludedSdasList',
    rows: sdaRows,
    emptyMessage: 'No cadets are excluded from SDA requirements.',
    noDataMessage: 'Upload a cadet report to manage SDA exclusions.',
    action: 'include-sda',
    buttonLabel: 'Re-add to SDAs'
  });
}

function renderScopedExclusionList({ containerId, rows, emptyMessage, noDataMessage, action, buttonLabel }) {
  const container = document.getElementById(containerId);

  if (!cadets.length) {
    container.innerHTML = `<div class="empty">${esc(noDataMessage)}</div>`;
    return;
  }

  if (!rows.length) {
    container.innerHTML = `<div class="empty">${esc(emptyMessage)}</div>`;
    return;
  }

  container.innerHTML = rows
    .map(cadet => `<div class="excluded-item">
      <div class="excluded-meta">
        <strong>${esc(cadet.name || 'Unknown')}</strong>
        <span class="note">${esc(cadet.achievement || 'Unknown')} | CAPID ${esc(cadet.capid || '')}</span>
      </div>
      <button class="action-chip include" type="button" data-action="${esc(action)}" data-key="${esc(cadet.key)}">${esc(buttonLabel)}</button>
    </div>`)
    .join('');
}

function renderCadetTable(table, rows, options = {}) {
  const { compact = false, emptyMessage = 'No cadets match this view.' } = options;

  if (!cadets.length) {
    table.innerHTML = '<tr><td class="empty">Upload a cadet full-track report to begin.</td></tr>';
    return;
  }

  if (!rows.length) {
    table.innerHTML = `<tr><td class="empty">${esc(emptyMessage)}</td></tr>`;
    return;
  }

  table.innerHTML = `<thead><tr>
      <th>Cadet</th>
      <th>Working On</th>
      <th>Due</th>
      <th>Status</th>
      <th>Progress</th>
      <th>Requirements</th>
      ${compact ? '' : '<th>Email</th>'}
    </tr></thead><tbody>` +
    rows.map(cadet => `<tr>
      <td>
        <strong>${esc(cadet.name || 'Unknown')}</strong><br>
        <span class="note">CAPID ${esc(cadet.capid || '')}</span>
        <div class="cadet-actions">${renderActionButton(cadet, compact)}</div>
      </td>
      <td>
        <strong class="achievement-name">${esc(cadet.achievement || 'Unknown')}</strong>
        ${cadet.rank ? `<br><span class="achievement-rank">${esc(cadet.rank)}</span>` : ''}
      </td>
      <td>${formatDate(cadet.dueDate)}<br><span class="note">${daysText(cadet.daysUntil)}</span></td>
      <td><span class="badge ${statusClass(cadet.status)}">${cadet.status}</span></td>
      <td><span class="progress"><span style="width:${cadet.progress}%"></span></span>${cadet.completed}/${cadet.total}</td>
      <td><div class="missing-list">${renderMissing(cadet)}</div></td>
      ${compact ? '' : `<td>${esc(cadet.email || '')}</td>`}
    </tr>`).join('') +
    '</tbody>';
}

function renderMissing(cadet) {
  if (!cadet.checks.length) return '<span class="badge future">No tracked items</span>';

  const orderedChecks = [
    ...cadet.checks.filter(check => !check.done),
    ...cadet.checks.filter(check => check.done)
  ];

  return orderedChecks
    .map(check => `<span class="pill ${check.done ? 'pill-complete' : 'pill-incomplete'}">${esc(check.name)}</span>`)
    .join('');
}

function renderActionButton(cadet, compact) {
  const excluded = excludedCadetKeys.has(cadet.key);

  if (compact) {
    return `<button class="action-chip exclude" type="button" data-action="exclude" data-key="${esc(cadet.key)}">Exclude</button>`;
  }

  if (excluded) {
    return `<button class="action-chip include" type="button" data-action="include" data-key="${esc(cadet.key)}">Re-add</button>`;
  }

  return `<button class="action-chip exclude" type="button" data-action="exclude" data-key="${esc(cadet.key)}">Exclude</button>`;
}

function renderExcludedCadets() {
  const container = document.getElementById('excludedCadetsList');
  const excludedCadets = getExcludedLoadedCadets()
    .sort((left, right) => left.name.localeCompare(right.name) || left.achievement.localeCompare(right.achievement));

  document.getElementById('excludedCount').textContent = `${excludedCadets.length} excluded`;

  if (!cadets.length) {
    container.innerHTML = '<div class="empty">Upload a cadet report to manage dashboard exclusions.</div>';
    return;
  }

  if (!excludedCadets.length) {
    container.innerHTML = '<div class="empty">No cadets are excluded from the main dashboard.</div>';
    return;
  }

  container.innerHTML = excludedCadets
    .map(cadet => `<div class="excluded-item">
      <div class="excluded-meta">
        <strong>${esc(cadet.name || 'Unknown')}</strong>
        <span class="note">${esc(cadet.achievement || 'Unknown')} | CAPID ${esc(cadet.capid || '')}</span>
      </div>
      <button class="action-chip include" type="button" data-action="include" data-key="${esc(cadet.key)}">Re-add to Dashboard</button>
    </div>`)
    .join('');
}

function compareDueDate(left, right) {
  return normalizedDateValue(left.dueDate) - normalizedDateValue(right.dueDate);
}

function compareDueDateWithDirection(left, right, direction = DUE_SORT_DEFAULT) {
  const leftValue = normalizedDateValue(left.dueDate);
  const rightValue = normalizedDateValue(right.dueDate);

  if (leftValue === rightValue) return 0;
  if (leftValue === Number.MAX_SAFE_INTEGER) return 1;
  if (rightValue === Number.MAX_SAFE_INTEGER) return -1;
  return direction === 'dueDesc' ? rightValue - leftValue : leftValue - rightValue;
}

function compareRank(left, right) {
  return (left.rankOrder - right.rankOrder) || compareText(left.rank, right.rank);
}

function compareText(left, right) {
  return clean(left).localeCompare(clean(right), undefined, { sensitivity: 'base' });
}

function normalizedDateValue(date) {
  return date instanceof Date ? date.getTime() : Number.MAX_SAFE_INTEGER;
}

function setSectionCount(elementId, count) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = formatCadetCount(count);
}

function renderRequirements() {
  const table = document.getElementById('requirementsTable');
  if (!requirements.length) {
    table.innerHTML = '<tr><td class="empty">No requirements loaded.</td></tr>';
    return;
  }

  const headers = Object.keys(requirements[0]);
  table.innerHTML = `<thead><tr>${headers.map(header => `<th>${esc(header)}</th>`).join('')}</tr></thead><tbody>` +
    requirements.map(row => `<tr>${headers.map(header => `<td>${esc(row[header] || '')}</td>`).join('')}</tr>`).join('') +
    '</tbody>';
}

function populateAchievementFilter() {
  populateAchievementSelect('achievementFilter', cadets);
}

function populateDrillAchievementFilter() {
  populateAchievementSelect('drillAchievementFilter', cadets.filter(requiresDrill));
}

function populateUniformAchievementFilter() {
  populateAchievementSelect('uniformAchievementFilter', cadets.filter(requiresUniform));
}

function populateAchievementSelect(selectId, rows) {
  const select = document.getElementById(selectId);
  const currentValue = select.value;
  const achievements = [...new Set(rows.map(cadet => cadet.achievement).filter(Boolean))]
    .sort((left, right) => achievementOrder(left) - achievementOrder(right) || left.localeCompare(right));

  select.innerHTML = '<option value="all">All achievements</option>' +
    achievements.map(achievement => `<option value="${esc(achievement)}">${esc(achievement)}</option>`).join('');
  select.value = achievements.includes(currentValue) ? currentValue : 'all';
}

function achievementOrder(achievement) {
  const order = requirements.map(row => clean(row.Achievement).toLowerCase());
  const index = order.indexOf(clean(achievement).toLowerCase());
  if (index >= 0) return index;

  const match = achievement.match(/Achievement\s+(\d+)/i);
  const numberValue = Number.parseInt(match ? match[1] : '', 10);
  return Number.isFinite(numberValue) ? numberValue : 999;
}

function milestoneLabel(achievement) {
  const milestone = MILESTONE_ACHIEVEMENTS.find(item =>
    item.achievement.toLowerCase() === clean(achievement).toLowerCase()
  );
  return milestone ? milestone.label : '';
}

function requiresSda(cadet) {
  const requirementRow = findRequirementForAchievement(cadet.achievement);
  return SDA_REQUIREMENTS.some(item => hasValue(requirementRow[item.requirementField]));
}

function requiresDrill(cadet) {
  const requirementRow = findRequirementForAchievement(cadet.achievement);
  return hasValue(requirementRow.Drill);
}

function requiresUniform(cadet) {
  const requirementRow = findRequirementForAchievement(cadet.achievement);
  return hasValue(requirementRow.Uniform);
}

function hasMissingDrillTest(cadet) {
  return requiresDrill(cadet) && !hasCompleteDrillTest(cadet);
}

function hasCompleteDrillTest(cadet) {
  return hasValue(cadet.raw.DrillDate) && number(cadet.raw.DrillScore) > 0;
}

function hasMissingUniformTest(cadet) {
  return requiresUniform(cadet) && !hasCompleteUniformTest(cadet);
}

function hasCompleteUniformTest(cadet) {
  return hasValue(cadet.raw.UniformDate);
}

function getMilestoneRows() {
  return sortPromotionRows(cadets.filter(cadet => cadet.milestoneLabel));
}

function getVisibleMilestoneRows() {
  return sortDueRows(
    getMilestoneRows().filter(cadet => !excludedMilestoneKeys.has(cadet.key)),
    dueSorts.milestone
  );
}

function getSdaRows() {
  return sortPromotionRows(cadets.filter(requiresSda));
}

function getVisibleSdaRows() {
  return sortDueRows(
    getSdaRows().filter(cadet => !excludedSdaKeys.has(cadet.key)),
    dueSorts.sda
  );
}

function getVisibleDrillRows() {
  let rows = cadets.filter(cadet => requiresDrill(cadet) && !excludedDrillKeys.has(cadet.key));
  const query = document.getElementById('drillSearchInput').value.toLowerCase();
  const drillStatus = document.getElementById('drillStatusFilter').value;
  const achievement = document.getElementById('drillAchievementFilter').value;

  if (query) {
    rows = rows.filter(cadet => matchesCadetSearch(cadet, query));
  }

  if (drillStatus === 'needs') rows = rows.filter(hasMissingDrillTest);
  if (drillStatus === 'complete') rows = rows.filter(hasCompleteDrillTest);
  if (achievement !== 'all') rows = rows.filter(cadet => cadet.achievement === achievement);

  return sortDueRows(rows, dueSorts.drill);
}

function getVisibleUniformRows() {
  let rows = cadets.filter(cadet => requiresUniform(cadet) && !excludedUniformKeys.has(cadet.key));
  const query = document.getElementById('uniformSearchInput').value.toLowerCase();
  const uniformStatus = document.getElementById('uniformStatusFilter').value;
  const achievement = document.getElementById('uniformAchievementFilter').value;

  if (query) {
    rows = rows.filter(cadet => matchesCadetSearch(cadet, query));
  }

  if (uniformStatus === 'needs') rows = rows.filter(hasMissingUniformTest);
  if (uniformStatus === 'complete') rows = rows.filter(hasCompleteUniformTest);
  if (achievement !== 'all') rows = rows.filter(cadet => cadet.achievement === achievement);

  return sortDueRows(rows, dueSorts.uniform);
}

function matchesCadetSearch(cadet, query) {
  return [cadet.name, cadet.capid, cadet.email, cadet.achievement]
    .join(' ')
    .toLowerCase()
    .includes(query);
}

function getExcludedMilestoneCadets() {
  return sortPromotionRows(cadets.filter(cadet => cadet.milestoneLabel && excludedMilestoneKeys.has(cadet.key)));
}

function getExcludedSdaCadets() {
  return sortPromotionRows(cadets.filter(cadet => requiresSda(cadet) && excludedSdaKeys.has(cadet.key)));
}

function getExcludedDrillCadets() {
  return sortPromotionRows(cadets.filter(cadet => requiresDrill(cadet) && excludedDrillKeys.has(cadet.key)));
}

function getExcludedUniformCadets() {
  return sortPromotionRows(cadets.filter(cadet => requiresUniform(cadet) && excludedUniformKeys.has(cadet.key)));
}

function getDashboardCadets() {
  return cadets.filter(cadet => !excludedCadetKeys.has(cadet.key));
}

function getExcludedLoadedCadets() {
  return cadets.filter(cadet => excludedCadetKeys.has(cadet.key));
}

function loadExcludedCadets() {
  return loadStoredSet(EXCLUDED_STORAGE_KEY, 'stored dashboard exclusions');
}

function loadMilestoneExclusions() {
  return loadStoredSet(MILESTONE_EXCLUDED_STORAGE_KEY, 'stored milestone exclusions');
}

function loadSdaExclusions() {
  return loadStoredSet(SDA_EXCLUDED_STORAGE_KEY, 'stored SDA exclusions');
}

function loadDrillExclusions() {
  return loadStoredSet(DRILL_EXCLUDED_STORAGE_KEY, 'stored drill exclusions');
}

function loadUniformExclusions() {
  return loadStoredSet(UNIFORM_EXCLUDED_STORAGE_KEY, 'stored uniform exclusions');
}

function loadStoredSet(storageKey, description) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return new Set(Array.isArray(stored) ? stored.map(value => clean(value)) : []);
  } catch (error) {
    console.warn(`Unable to read ${description}.`, error);
    return new Set();
  }
}

function persistExcludedCadets() {
  persistStoredSet(EXCLUDED_STORAGE_KEY, excludedCadetKeys, 'dashboard exclusions');
}

function persistMilestoneExclusions() {
  persistStoredSet(MILESTONE_EXCLUDED_STORAGE_KEY, excludedMilestoneKeys, 'milestone exclusions');
}

function persistSdaExclusions() {
  persistStoredSet(SDA_EXCLUDED_STORAGE_KEY, excludedSdaKeys, 'SDA exclusions');
}

function persistDrillExclusions() {
  persistStoredSet(DRILL_EXCLUDED_STORAGE_KEY, excludedDrillKeys, 'drill exclusions');
}

function persistUniformExclusions() {
  persistStoredSet(UNIFORM_EXCLUDED_STORAGE_KEY, excludedUniformKeys, 'uniform exclusions');
}

function persistStoredSet(storageKey, values, description) {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...values]));
  } catch (error) {
    console.warn(`Unable to save ${description}.`, error);
  }
}

function showDashboard() {
  uploadPage.classList.add('hidden');
  dashboardPage.classList.remove('hidden');
  loadedReportName.textContent = loadedFileName || 'Cadet report loaded';
}

function showUploadPage() {
  dashboardPage.classList.add('hidden');
  uploadPage.classList.remove('hidden');
  loadedReportName.textContent = 'No report loaded';
}

function setSelectedFileName(name) {
  uploadFileName.textContent = name ? `Selected: ${name}` : 'No file selected';
}

function setStatusMessage(message, tone) {
  document.querySelectorAll('[data-status-message]').forEach(banner => {
    banner.textContent = message;
    banner.className = `status-banner ${tone}`;
  });
}

function cadetKey(raw) {
  const capid = clean(raw.CAPID);
  if (capid) return `capid:${capid}`;

  return `fallback:${clean(raw.NameLast).toLowerCase()}|${clean(raw.NameFirst).toLowerCase()}|${clean(raw.AchvName).toLowerCase()}`;
}

function statusClass(status) {
  if (status === 'Overdue') return 'overdue';
  if (status === 'Due Soon') return 'soon';
  if (status === 'Ready') return 'ready';
  if (status === 'Future') return 'future';
  return 'notready';
}

function formatCadetCount(count) {
  return `${count} cadet${count === 1 ? '' : 's'}`;
}

function daysText(days) {
  if (days === null || days === undefined || Number.isNaN(days)) return 'No due date';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today';
  return `Due in ${days} days`;
}

function formatDate(date) {
  return date ? dateFormatter.format(date) : 'Unknown';
}

function parseDate(value) {
  value = clean(value);
  if (!hasValue(value)) return null;

  const nativeDate = new Date(value);
  if (!Number.isNaN(nativeDate.getTime())) return nativeDate;

  const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
  if (!match) return null;

  const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  return new Date(Number(match[3]), months[match[2].slice(0, 3).toLowerCase()], Number(match[1]));
}

function startOfDay(date) {
  return date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : null;
}

function addDays(date, days) {
  return date ? new Date(date.getFullYear(), date.getMonth(), date.getDate() + days) : null;
}

function passScore(date, score) {
  return hasValue(date) && number(score) >= 80;
}

function number(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function truthy(value) {
  return ['true', 'yes', 'y', '1', 'pass', 'passed', 'complete', 'completed'].includes(clean(value).toLowerCase());
}

function hasValue(value) {
  const normalized = clean(value).toLowerCase();
  return normalized !== '' && normalized !== 'nan' && normalized !== 'null' && normalized !== 'none' && normalized !== 'n/a';
}

function clean(value) {
  return (value ?? '').toString().trim();
}

function esc(value) {
  return clean(value).replace(/[&<>'"]/g, character => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]
  ));
}

renderAll();
