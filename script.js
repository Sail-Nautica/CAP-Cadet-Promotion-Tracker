const SOON_DAYS = 14;
const EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-cadets-v1';
const DASHBOARD_SORT_DEFAULT = 'dueDate';
const BUILT_IN_REQUIREMENTS_CSV = `Achievement,Rank,Physical Fitness,Leadership,Drill,Aerospace Education,Character Development,Active Participation,Cadet Oath,Uniform,Leadership Expectations,Special Activity,SDAStaffServiceDate,SDAOralPresentationDate,SDATechnicalWritingAssignmentDate,SDATechnicalWritingAssignment
Achievement 1,C/Amn,Attempt,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Cadet Welcome Course,None,None,None,None
Achievement 2,C/A1C,Attempt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 3,C/SrA,Attempt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Wright Brothers,C/SSgt,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 4,C/TSgt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 5,C/MSgt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 6,C/SMSgt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 7,C/CMSgt,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 8,C/CMSgt',Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Pass,Essay & Speech,None,None,None,None
Billy Mitchell,C/2d Lt,Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,Encampment,None,None,None,None
Achievement 9,C/2d Lt',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 10,C/1st Lt,Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 11,C/1st Lt',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Amelia Earhart,C/Capt,Pass,Pass,None,None,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None
Achievement 12,C/Capt',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 13,C/Capt'',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 14,C/Maj,Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 15,C/Maj',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Achievement 16,C/Maj'',Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,Pass,Pass,Pass,Pass
Gen Ira C Eaker,C/Lt Col,Pass,None,None,None,Pass,Pass,Pass,Pass,Pass,"Officer Leadership Course, Speech, & Essay",None,None,None,None
Gen Carl A Spaatz,C/Col,Pass,Pass,None,Pass,Pass,Pass,Pass,Pass,Pass,None,None,None,None,None`;

let cadets = [];
let requirements = parseCSV(BUILT_IN_REQUIREMENTS_CSV);
let excludedCadetKeys = loadExcludedCadets();
let loadedFileName = '';
let dashboardSorts = {
  overdue: DASHBOARD_SORT_DEFAULT,
  soon: DASHBOARD_SORT_DEFAULT,
  ready: DASHBOARD_SORT_DEFAULT
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
  document.getElementById('requirementsView').classList.toggle('hidden', btn.dataset.view !== 'requirements');
}));

document.getElementById('searchInput').addEventListener('input', renderAllCadets);
document.getElementById('statusFilter').addEventListener('change', renderAllCadets);
document.getElementById('achievementFilter').addEventListener('change', renderAllCadets);
document.querySelectorAll('.dashboard-sort').forEach(select => {
  select.value = dashboardSorts[select.dataset.section] || DASHBOARD_SORT_DEFAULT;
  select.addEventListener('change', handleDashboardSortChange);
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
  if (!button) return;

  const key = clean(button.dataset.key);
  if (!key) return;

  if (button.dataset.action === 'exclude') {
    excludedCadetKeys.add(key);
    persistExcludedCadets();
    renderAll();
    setStatusMessage('Cadet excluded from the main dashboard.', 'info');
    return;
  }

  if (button.dataset.action === 'include') {
    excludedCadetKeys.delete(key);
    persistExcludedCadets();
    renderAll();
    setStatusMessage('Cadet re-added to the main dashboard.', 'success');
  }
}

function handleDashboardSortChange(event) {
  const section = clean(event.target.dataset.section);
  if (!section) return;

  dashboardSorts[section] = event.target.value || DASHBOARD_SORT_DEFAULT;
  renderDashboardTables();
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
  const requirementRow = requirements.find(row => clean(row.Achievement).toLowerCase() === achievement.toLowerCase()) || {};
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

function renderAllCadets() {
  let rows = [...cadets];
  const query = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const achievement = document.getElementById('achievementFilter').value;

  if (query) {
    rows = rows.filter(cadet =>
      [cadet.name, cadet.capid, cadet.email, cadet.achievement].join(' ').toLowerCase().includes(query)
    );
  }
  if (status !== 'all') rows = rows.filter(cadet => cadet.status === status);
  if (achievement !== 'all') rows = rows.filter(cadet => cadet.achievement === achievement);

  rows.sort((left, right) => (left.dueDate || 0) - (right.dueDate || 0));
  renderCadetTable(document.getElementById('allTable'), rows, {
    compact: false,
    emptyMessage: 'No cadets match this view.'
  });
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
  const select = document.getElementById('achievementFilter');
  const currentValue = select.value;
  const achievements = [...new Set(cadets.map(cadet => cadet.achievement).filter(Boolean))]
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

function getDashboardCadets() {
  return cadets.filter(cadet => !excludedCadetKeys.has(cadet.key));
}

function getExcludedLoadedCadets() {
  return cadets.filter(cadet => excludedCadetKeys.has(cadet.key));
}

function loadExcludedCadets() {
  try {
    const stored = JSON.parse(localStorage.getItem(EXCLUDED_STORAGE_KEY) || '[]');
    return new Set(Array.isArray(stored) ? stored.map(value => clean(value)) : []);
  } catch (error) {
    console.warn('Unable to read stored dashboard exclusions.', error);
    return new Set();
  }
}

function persistExcludedCadets() {
  try {
    localStorage.setItem(EXCLUDED_STORAGE_KEY, JSON.stringify([...excludedCadetKeys]));
  } catch (error) {
    console.warn('Unable to save dashboard exclusions.', error);
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
