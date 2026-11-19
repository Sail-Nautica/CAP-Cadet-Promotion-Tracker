const SOON_DAYS = 14;
const EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-cadets-v1';
const MILESTONE_EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-milestones-v1';
const SDA_EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-sdas-v1';
const DRILL_EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-drills-v1';
const UNIFORM_EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-uniforms-v1';
const CERTIFICATE_EXCLUDED_STORAGE_KEY = 'cap-dashboard-excluded-certificates-v1';
const ATTENDANCE_STORAGE_KEY = 'cap-dashboard-attendance-scanner-v1';
const SCANNER_MAX_KEY_GAP_MS = 60;
const DASHBOARD_SORT_DEFAULT = 'dueDate';
const DUE_SORT_DEFAULT = 'dueAsc';
const CHANGELOG = [
  {
    version: '0.9',
    date: 'November 19, 2026',
    title: 'Stalled Cadets Report',
    changes: [
      'Added a Stalled Cadets report to the Print Reports tab. It lists cadets who have held their grade at least a chosen number of days, 120 by default, longest first.',
      'Each stalled cadet shows when they last promoted, their latest requirement activity since then, and what they still need.',
      'The report counts the most common blockers, flags cadets with no activity since their last promotion, and separates cadets who have met every requirement and are only waiting on approval.',
      'The Stalled Cadets report can be printed.'
    ]
  },
  {
    version: '0.8',
    date: 'November 19, 2026',
    title: 'New Certificate Template',
    changes: [
      'Promotion certificates now follow the Promotion Certificates slide deck, with every ribbon, insignia, grade device, seal, and line placed where the deck puts it.',
      'Added achievement and milestone ribbons and the squadron patch to the certificates.',
      'Certificate text now uses the Merriweather typeface and the wording from the deck. A long cadet name or title shrinks to stay on one line.',
      'Printing waits for the certificate typeface and artwork to load before the print dialog opens.'
    ]
  },
  {
    version: '0.7',
    date: 'November 19, 2026',
    title: 'All Promotions Reports',
    changes: [
      'The full-track report can now be loaded as either the latest-only export or the all-promotions export. The type is detected automatically and shown when the report loads.',
      'With an all-promotions report, each cadet is tracked once at their highest achievement instead of appearing once per past achievement.',
      'With an all-promotions report, promotion certificates use the actual approval date of each promotion, and every promotion inside the lookahead window gets a certificate.',
      'A certificate with no known award date now prints without a date instead of printing "Unknown".'
    ]
  },
  {
    version: '0.6.1',
    date: 'September 1, 2026',
    title: 'Spaatz Criteria & Certificate Printing',
    changes: [
      'Spaatz completion is now based only on Physical Fitness, the Leadership test or module, and the Aerospace test or module. Active Participation, Cadet Oath, Uniform, and Leadership Expectations are no longer required for Spaatz, and the change applies everywhere those requirements are counted.',
      'A cadet who finishes every Spaatz requirement is now marked Completed instead of Ready, since there is no promotion after Spaatz. Completed cadets drop out of the overdue, due soon, and ready lists, get their own dashboard count, and can be filtered on the All Promotions page.',
      'A cadet with a completed Spaatz now gets a Spaatz promotion certificate instead of an Eaker one, printed without an award date. Dateless certificates are always included no matter how far back the lookahead window reaches.',
      'Printed promotion certificates now lead with one blank sheet, followed by one certificate per sheet with no cover page.',
      'Removed the page title, address, page number, and date printed along the edges of certificate pages.',
      'Centered each certificate on its page, and centered the artwork and wording vertically inside the certificate border.'
    ]
  },
  {
    version: '0.6',
    date: 'August 31, 2026',
    title: 'Promotion Certificates',
    changes: [
      'Added promotion certificate generation with official CAP insignia, grade devices, and seal artwork.',
      'Added a certificate picker with promotion presets, a custom promotion selector, and a lookahead window in months.',
      'Added a printable certificate report that lays out one certificate per page with enlisted and officer layouts.',
      'Added a Certificate Exclusions list so individual cadets can be skipped when building or printing certificates.'
    ]
  },
  {
    version: '0.5',
    date: 'June 24, 2026',
    title: 'Attendance Scanner',
    changes: [
      'Added an Attendance Scanner tab that accepts barcode scanner input anywhere in the dashboard.',
      'Added separate attendance lists for general attendance, missing forms, and missing uniforms.',
      'Added exporting and clearing for each attendance list.',
      'Added a Print Reports tab to hold the printable report builders.',
      'Attendance lists now persist between sessions.'
    ]
  },
  {
    version: '0.4.1',
    date: 'June 9, 2026',
    title: 'Print Fixes',
    changes: [
      'Fixed printed report layouts that broke across page boundaries.',
      'Removed the leftover duplicate dashboard file and unused print helpers.'
    ]
  },
  {
    version: '0.4',
    date: 'May 28, 2026',
    title: 'Printable Milestone Reports',
    changes: [
      'Added a printable milestones, SDA, drill, and uniform report.',
      'Added requirement status detail so missing items are named in printed output.',
      'Highlighted outstanding milestone and SDA requirements in printed reports.'
    ]
  },
  {
    version: '0.3',
    date: 'May 23, 2026',
    title: 'Consolidated Dashboard',
    changes: [
      'Consolidated the dashboard into a single page with tabbed views.',
      'Added the version badge to the page header.',
      'Cleaned up styling across the cards, tables, and status banners.'
    ]
  },
  {
    version: '0.2',
    date: 'May 22, 2026',
    title: 'Upload Page & Focus Sheets',
    changes: [
      'Added the Load Cadet Data upload page as the entry point to the dashboard.',
      'Added individual cadet focus sheets and the ability to print them.'
    ]
  },
  {
    version: '0.1',
    date: 'May 22, 2026',
    title: 'Initial Release',
    changes: [
      'Initial dashboard reading CAP cadet full-track CSV and Excel reports.',
      'Added overdue, upcoming, and ready promotion tracking with a requirements matrix.'
    ]
  }
];
const APP_VERSION = CHANGELOG[0].version;
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
const CERTIFICATE_MILESTONE_AND_CURRY_PROMOTIONS = [
  'Achievement 1',
  'Wright Brothers',
  'Billy Mitchell',
  'Amelia Earhart',
  'Gen Ira C Eaker',
  'Gen Carl A Spaatz'
];
// Certificates copy the Promotion Certificates slide deck: a 10in x 5.625in slide with
// every picture, text box and rule placed at the deck's coordinates, in inches.
const CERTIFICATE_ART = 'assets/certificates/';
const CERTIFICATE_FONT_FAMILY = "'Merriweather', Georgia, serif";
const CERTIFICATE_TEXT_BOX = { x: 2.487, w: 5.026, enlistedTop: 1.011, officerTop: 1.387 };
const CERTIFICATE_SEAL_AND_WINGS = [
  { src: 'seal.png', x: 7.513, y: 0.505, w: 2.344, h: 2.344 },
  { src: 'wings.png', x: 7.513, y: 2.776, w: 2.344, h: 2.344 }
];
// The squadron patch is cropped to drop the black frame around the scan.
const CERTIFICATE_PATCH_CROP = { l: 5.187, r: 5.845, t: 4.719, b: 5.232 };

function enlistedCertificate(title, rank, ribbon, ribbonY, insignia, insigniaY, insigniaH, x = 0.44) {
  return {
    title,
    rank,
    layout: 'enlisted',
    art: [
      { src: `ribbon-${ribbon}.png`, x, y: ribbonY, w: 1.749, h: 0.525 },
      { src: `insignia-${insignia}.png`, x, y: insigniaY, w: 1.749, h: insigniaH }
    ]
  };
}

function officerCertificate(title, rank, devices, patch, ribbon = null) {
  return {
    title,
    rank,
    layout: 'officer',
    art: [
      ...devices.map(([device, x, w]) => ({ src: `device-${device}.png`, x, y: 0, w, h: 1.387 })),
      ...(ribbon ? [{ src: `ribbon-${ribbon.name}.png`, x: patch.x, y: ribbon.y, w: 2.344, h: 0.703 }] : []),
      { src: 'squadron-patch.png', x: patch.x, y: patch.y, w: 2.344, h: 2.344, crop: CERTIFICATE_PATCH_CROP }
    ]
  };
}

const ONE_CIRCLE = ['1circle', 4.248, 1.387];
const TWO_CIRCLES = ['2circle', 3.942, 2.116];
const THREE_CIRCLES = ['3circle', 3.314, 3.373];
const ONE_DIAMOND = ['1diamond', 4.493, 1.013];
const OFFICER_PATCH = { x: 0.092, y: 1.641 };

const CERTIFICATE_TEMPLATES = {
  'Achievement 1': enlistedCertificate('ACHIEVEMENT 1', 'C/Amn', 'achievement-1', 1.679, 'amn', 2.62, 1.326),
  'Achievement 2': enlistedCertificate('ACHIEVEMENT 2', 'C/A1C', 'achievement-2', 1.715, 'a1c', 2.584, 1.326),
  'Achievement 3': enlistedCertificate('ACHIEVEMENT 3', 'C/SrA', 'achievement-3', 1.637, 'sra', 2.662, 1.326),
  'Wright Brothers': enlistedCertificate('Wright Brothers Award', 'C/SSgt', 'wright-brothers', 1.602, 'ssgt', 2.543, 1.48),
  'Achievement 4': enlistedCertificate('Achievement 4', 'C/TSgt', 'achievement-4', 1.488, 'tsgt', 2.429, 1.708),
  'Achievement 5': enlistedCertificate('Achievement 5', 'C/MSgt', 'achievement-5', 1.011, 'msgt', 2.036, 2.28, 0.449),
  'Achievement 6': enlistedCertificate('Achievement 6', 'C/SMSgt', 'achievement-6', 1.011, 'smsgt', 2.036, 2.454),
  'Achievement 7': enlistedCertificate('Achievement 7', 'C/CMSgt', 'achievement-7', 0.978, 'cmsgt', 2.003, 2.644, 0.406),
  'Achievement 8': enlistedCertificate('Achievement 8', null, 'achievement-8', 0.972, 'cmsgt', 2.003, 2.644, 0.406),
  'Billy Mitchell': officerCertificate('Billy Mitchell Award', 'C/2nd Lt', [ONE_CIRCLE], { x: 0.143, y: 2.236 }, { name: 'mitchell', y: 1.045 }),
  'Achievement 9': officerCertificate('Achievement 9', null, [ONE_CIRCLE], OFFICER_PATCH),
  'Achievement 10': officerCertificate('Achievement 10', 'C/1st Lt', [ONE_CIRCLE, TWO_CIRCLES], OFFICER_PATCH),
  'Achievement 11': officerCertificate('Achievement 11', null, [ONE_CIRCLE, TWO_CIRCLES], OFFICER_PATCH),
  'Amelia Earhart': officerCertificate('Amelia Earhart Award', 'C/Capt', [THREE_CIRCLES], { x: 0.082, y: 2.201 }, { name: 'earhart', y: 1.081 }),
  'Achievement 12': officerCertificate('Achievement 12', null, [THREE_CIRCLES], OFFICER_PATCH),
  'Achievement 13': officerCertificate('Achievement 13', null, [THREE_CIRCLES], OFFICER_PATCH),
  'Achievement 14': officerCertificate('Achievement 14', 'C/Maj', [ONE_DIAMOND], OFFICER_PATCH),
  'Achievement 15': officerCertificate('Achievement 15', null, [ONE_DIAMOND], OFFICER_PATCH),
  'Achievement 16': officerCertificate('Achievement 16', null, [ONE_DIAMOND], OFFICER_PATCH),
  'Gen Ira C Eaker': officerCertificate('Gen Ira C. Eaker', 'C/Lt Col', [['2diamond', 4.255, 1.489]], { x: 0.092, y: 2.201 }, { name: 'eaker', y: 1.081 }),
  'Gen Carl A Spaatz': officerCertificate('Gen Carl A. Spaatz Award', 'C/Col', [['3diamond', 3.945, 2.11]], { x: 0.092, y: 2.242 }, { name: 'spaatz', y: 1.039 })
};
const ATTENDANCE_LISTS = [
  {
    key: 'main',
    label: 'Attendance',
    checkboxId: 'attendanceTargetMain',
    countId: 'attendanceMainCount',
    listId: 'attendanceMainList'
  },
  {
    key: 'noUniform',
    label: 'NO UNIFORM',
    checkboxId: 'attendanceTargetNoUniform',
    countId: 'attendanceNoUniformCount',
    listId: 'attendanceNoUniformList'
  },
  {
    key: 'noForm',
    label: 'NO FORM',
    checkboxId: 'attendanceTargetNoForm',
    countId: 'attendanceNoFormCount',
    listId: 'attendanceNoFormList'
  }
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
Gen Carl A Spaatz,C/Col,Pass,Pass,None,Pass,None,None,None,None,None,None,None,None,None,None`;

let cadets = [];
let requirements = parseCSV(BUILT_IN_REQUIREMENTS_CSV);
let excludedCadetKeys = loadExcludedCadets();
let excludedMilestoneKeys = loadMilestoneExclusions();
let excludedSdaKeys = loadSdaExclusions();
let excludedDrillKeys = loadDrillExclusions();
let excludedUniformKeys = loadUniformExclusions();
let excludedCertificateKeys = loadCertificateExclusions();
let attendanceLists = loadAttendanceLists();
let loadedFileName = '';
let globalScanBuffer = '';
let globalScanBufferOverflowed = false;
let globalScanLastTime = 0;
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
const changelogPage = document.getElementById('changelogPage');
const uploadDropZone = document.getElementById('uploadDropZone');
const uploadFileName = document.getElementById('uploadFileName');
const loadedReportName = document.getElementById('loadedReportName');

cadetFileInput.addEventListener('change', handleCadetFileChange);
document.getElementById('chooseFileButton').addEventListener('click', () => cadetFileInput.click());
document.getElementById('uploadAnotherButton').addEventListener('click', () => cadetFileInput.click());
document.getElementById('viewChangelogButton').addEventListener('click', showChangelogPage);
document.getElementById('backToUploadButton').addEventListener('click', showUploadPage);
document.addEventListener('click', handleActionClick);
document.addEventListener('keydown', handleGlobalAttendanceScan, true);
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
  document.getElementById('attendanceView').classList.toggle('hidden', btn.dataset.view !== 'attendance');
  document.getElementById('printReportsView').classList.toggle('hidden', btn.dataset.view !== 'printReports');
  document.getElementById('requirementsView').classList.toggle('hidden', btn.dataset.view !== 'requirements');

  if (btn.dataset.view === 'attendance') {
    window.setTimeout(() => document.getElementById('attendanceScanInput').focus(), 0);
  }
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
document.getElementById('attendanceEntryForm').addEventListener('submit', handleAttendanceEntrySubmit);
document.getElementById('promotionCertificatePreset').addEventListener('change', handlePromotionCertificateFilterChange);
document.getElementById('promotionCertificateMonths').addEventListener('input', renderPromotionCertificateReport);
document.getElementById('promotionCertificateCustomPicker').addEventListener('change', renderPromotionCertificateReport);
document.getElementById('printPromotionCertificatesButton').addEventListener('click', handlePrintPromotionCertificatesReport);
document.getElementById('printReportType').addEventListener('change', applyPrintReportType);
document.getElementById('stalledMinDays').addEventListener('input', renderStalledCadetsReport);
document.getElementById('printStalledCadetsButton').addEventListener('click', handlePrintStalledCadetsReport);
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
    const report = groupCadetReport(rows);
    cadets = report.cadets.map(entry => analyzeCadet(entry.raw, entry.history));
    loadedFileName = file.name;
    populateAchievementFilter();
    populateDrillAchievementFilter();
    populateUniformAchievementFilter();
    renderAll();
    showDashboard();

    const visibleCount = getDashboardCadets().length;
    const reportTypeText = report.isAllPromotions
      ? `All promotions report (${report.rowCount} rows).`
      : 'Latest promotion report.';
    setStatusMessage(
      `${cadets.length} cadets loaded from ${file.name}. ${reportTypeText} ${visibleCount} currently shown on the main dashboard.`,
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

// eServices exports the full-track report two ways: "latest only" has one row per cadet
// for the achievement they are working on, and "all promotions" adds a row for every
// earlier achievement with its approval date. Either way the dashboard tracks the
// highest achievement per cadet; the earlier rows are kept as promotion history.
function groupCadetReport(rows) {
  const groups = new Map();
  rows.forEach(raw => {
    const groupKey = clean(raw.CAPID) ||
      `${clean(raw.NameLast).toLowerCase()}|${clean(raw.NameFirst).toLowerCase()}`;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(raw);
  });

  const isAllPromotions = [...groups.values()].some(group => group.length > 1);
  const groupedCadets = [...groups.values()].map(group => {
    const ordered = [...group].sort((left, right) =>
      achievementOrder(clean(left.AchvName)) - achievementOrder(clean(right.AchvName))
    );

    return {
      raw: ordered[ordered.length - 1],
      history: isAllPromotions
        ? ordered.map(row => ({ achievement: clean(row.AchvName), approvalDate: parseDate(row.AprDate) }))
        : null
    };
  });

  return { isAllPromotions, rowCount: rows.length, cadets: groupedCadets };
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

  if (action === 'clear-attendance') {
    handleClearAttendanceLists();
    return;
  }

  if (action === 'export-attendance') {
    handleExportAttendanceList(button.dataset.list);
    return;
  }

  if (action === 'select-all-certificate-promotions') {
    setAllPromotionCertificateCheckboxes(true);
    return;
  }

  if (action === 'clear-certificate-promotions') {
    setAllPromotionCertificateCheckboxes(false);
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
    return;
  }

  if (action === 'exclude-certificate') {
    excludedCertificateKeys.add(key);
    persistCertificateExclusions();
    renderAll();
    setStatusMessage('Cadet excluded from promotion certificates.', 'info');
    return;
  }

  if (action === 'include-certificate') {
    excludedCertificateKeys.delete(key);
    persistCertificateExclusions();
    renderAll();
    setStatusMessage('Cadet re-added to promotion certificates.', 'success');
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
  clearPrintReports();
  renderPrintableMilestonesReport();
  document.body.classList.add('printing-report');
  window.print();
}

function handlePromotionCertificateFilterChange() {
  const customPicker = document.getElementById('promotionCertificateCustomPicker');
  customPicker.classList.toggle('hidden', document.getElementById('promotionCertificatePreset').value !== 'custom');
  renderPromotionCertificateReport();
}

async function handlePrintPromotionCertificatesReport() {
  const rows = getPromotionCertificateRows();
  if (!rows.length) {
    setStatusMessage('No promotion certificates match the current report filters.', 'error');
    return;
  }

  // The font must be ready before the text is measured, and the artwork before the
  // print dialog snapshots the pages.
  setStatusMessage(`Preparing ${formatCertificateCount(rows.length)} for printing...`, 'info');
  await loadCertificateFonts();
  clearPrintReports();
  renderPrintablePromotionCertificatesReport(rows);
  await waitForImages(document.getElementById('printReportsPrintReport'));
  setStatusMessage(`${formatCertificateCount(rows.length)} ready to print.`, 'success');
  document.body.classList.add('printing-report');
  window.print();
}

function clearPrintReports() {
  document.querySelectorAll('.print-report').forEach(report => {
    report.innerHTML = '';
  });
}

function handleGlobalAttendanceScan(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    resetGlobalScanBuffer();
    return;
  }

  const isDigit = event.key.length === 1 && event.key >= '0' && event.key <= '9';
  const isTerminator = event.key === 'Enter' || event.key === 'Tab';

  if (!isDigit && !isTerminator) {
    resetGlobalScanBuffer();
    return;
  }

  const now = event.timeStamp;
  if (globalScanBuffer && now - globalScanLastTime > SCANNER_MAX_KEY_GAP_MS) {
    resetGlobalScanBuffer();
  }

  if (isDigit) {
    globalScanLastTime = now;
    if (!globalScanBufferOverflowed) {
      globalScanBuffer += event.key;
      if (globalScanBuffer.length > 6) {
        globalScanBufferOverflowed = true;
      }
    }
    return;
  }

  // Terminator key: only a run of exactly six digits typed at scanner speed counts as a scan.
  const scannedNumber = globalScanBuffer;
  const wasCompleteScan = !globalScanBufferOverflowed && scannedNumber.length === 6;
  resetGlobalScanBuffer();
  if (!wasCompleteScan) return;

  event.preventDefault();
  event.stopPropagation();

  const activeElement = document.activeElement;
  addAttendanceNumber(scannedNumber);

  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    activeElement.value = '';
  }
}

function resetGlobalScanBuffer() {
  globalScanBuffer = '';
  globalScanBufferOverflowed = false;
}

function handleAttendanceEntrySubmit(event) {
  event.preventDefault();

  const input = document.getElementById('attendanceScanInput');
  const attendanceNumber = normalizeAttendanceNumber(input.value);

  if (addAttendanceNumber(attendanceNumber)) {
    input.value = '';
  }

  input.focus();
}

function addAttendanceNumber(attendanceNumber) {
  if (!/^\d{6}$/.test(attendanceNumber)) {
    setStatusMessage('Enter exactly one 6-digit number.', 'error');
    return false;
  }

  const targets = getSelectedAttendanceTargets();
  if (!targets.length) {
    setStatusMessage('Choose at least one attendance list before adding a number.', 'error');
    return false;
  }

  const addedLabels = [];
  const duplicateLabels = [];

  targets.forEach(target => {
    const list = attendanceLists[target.key];
    if (list.has(attendanceNumber)) {
      duplicateLabels.push(target.label);
      return;
    }

    list.add(attendanceNumber);
    addedLabels.push(target.label);
  });

  if (!addedLabels.length) {
    setStatusMessage(`${attendanceNumber} is already in ${formatLabelList(duplicateLabels)}.`, 'error');
    return false;
  }

  persistAttendanceLists();
  renderAttendanceScanner();

  const duplicateText = duplicateLabels.length
    ? ` Already in ${formatLabelList(duplicateLabels)}.`
    : '';
  setStatusMessage(`${attendanceNumber} added to ${formatLabelList(addedLabels)}.${duplicateText}`, 'success');
  return true;
}

function handleClearAttendanceLists() {
  const totalCount = ATTENDANCE_LISTS.reduce((sum, item) => sum + attendanceLists[item.key].size, 0);
  if (!totalCount) {
    setStatusMessage('Attendance scanner lists are already empty.', 'info');
    return;
  }

  if (!window.confirm('Clear all Attendance Scanner lists? This cannot be undone.')) {
    setStatusMessage('Attendance scanner lists were not cleared.', 'info');
    return;
  }

  ATTENDANCE_LISTS.forEach(item => attendanceLists[item.key].clear());
  persistAttendanceLists();
  renderAttendanceScanner();
  document.getElementById('attendanceExportOutput').value = '';
  setStatusMessage('All attendance scanner lists cleared.', 'success');
}

function handleExportAttendanceList(listKey) {
  const listConfig = ATTENDANCE_LISTS.find(item => item.key === clean(listKey));
  if (!listConfig) return;

  const numbers = [...attendanceLists[listConfig.key]];
  const output = numbers.join(',');
  const outputElement = document.getElementById('attendanceExportOutput');
  outputElement.value = output;
  outputElement.focus();
  outputElement.select();

  if (!numbers.length) {
    setStatusMessage(`${listConfig.label} is empty; nothing to export.`, 'error');
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(output)
      .then(() => setStatusMessage(`${listConfig.label} export copied to clipboard.`, 'success'))
      .catch(() => setStatusMessage(`${listConfig.label} export is ready below. Clipboard copy was blocked.`, 'info'));
    return;
  }

  setStatusMessage(`${listConfig.label} export is ready below.`, 'success');
}

function normalizeAttendanceNumber(value) {
  return clean(value).replace(/\D/g, '');
}

function getSelectedAttendanceTargets() {
  return ATTENDANCE_LISTS.filter(item => {
    const checkbox = document.getElementById(item.checkboxId);
    return checkbox && checkbox.checked;
  });
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

function analyzeCadet(raw, promotionHistory = null) {
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
  const awardComplete = ready && isTerminalAchievement(achievement);

  let status = 'Future';
  if (awardComplete) status = 'Completed';
  else if (ready) status = 'Ready';
  else if (daysUntil !== null && daysUntil < 0) status = 'Overdue';
  else if (daysUntil !== null && daysUntil <= SOON_DAYS) status = 'Due Soon';
  else status = 'Not Ready';

  const inGradeSince = findInGradeSince(raw, promotionHistory);
  const lastActivity = findLastActivitySince(raw, inGradeSince);

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
    awardComplete,
    checks,
    completed,
    total,
    missing,
    promotionHistory,
    inGradeSince,
    daysInGrade: inGradeSince ? Math.floor((today - startOfDay(inGradeSince)) / 86400000) : null,
    lastActivity,
    progress: Math.round((completed / total) * 100)
  };
}

// A cadet holds their grade from the approval of the achievement before the one they are
// working on. An all-promotions report has that date; otherwise eServices sets the next
// approval date 56 days after it, and a cadet still on Achievement 1 counts from joining.
function findInGradeSince(raw, promotionHistory) {
  const previous = promotionHistory && promotionHistory.length > 1
    ? promotionHistory[promotionHistory.length - 2]
    : null;
  if (previous && previous.approvalDate) return previous.approvalDate;

  return lastPromotionFromNextApproval(raw) || parseDate(raw.JoinDate);
}

// eServices sets the next approval date 56 days after the last promotion, except for a
// cadet working on Spaatz, where it is the Eaker approval date itself.
function lastPromotionFromNextApproval(raw) {
  const nextApprovalDate = parseDate(raw.NextApprovalDate);
  if (!nextApprovalDate) return null;
  return isTerminalAchievement(clean(raw.AchvName)) ? nextApprovalDate : addDays(nextApprovalDate, -56);
}

// Requirement dates on the current row that fall after the last promotion show the cadet
// is still working; older dates carry over from earlier achievements.
const ACTIVITY_DATE_FIELDS = [
  'PhyFitTest', 'LeadLabDateP', 'LeadershipInteractiveDate', 'AEDateP', 'AEInteractiveDate',
  'CharacterDevelopment', 'ActiveParticipationDate', 'CadetOathDate', 'LeadershipExpectationsDate',
  'UniformDate', 'SpecialActivityDate', 'DrillDate', 'WelcomeCourseDate', 'EssayDate', 'SpeechDate',
  'StaffServiceDate', 'OralPresentationDate', 'TechnicalWritingAssignmentDate'
];

function findLastActivitySince(raw, sinceDate) {
  if (!sinceDate) return null;
  const since = startOfDay(sinceDate);

  return ACTIVITY_DATE_FIELDS
    .map(field => parseDate(raw[field]))
    .filter(date => date && startOfDay(date) > since)
    .reduce((latest, date) => (!latest || date > latest ? date : latest), null);
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
  renderAttendanceScanner();
  renderPromotionCertificateReport();
  renderStalledCadetsReport();
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
    ['Completed', dashboardCadets.filter(cadet => cadet.status === 'Completed').length],
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

// Certificates print with no cover header so every sheet is a certificate on its own,
// behind one blank leading sheet.
function renderPrintablePromotionCertificatesReport(rows) {
  const report = document.getElementById('printReportsPrintReport');

  report.innerHTML = '<section class="certificate-blank-page" aria-hidden="true"></section>' +
    rows.map(renderCertificatePage).join('');
}

function renderCertificatePage(row) {
  const template = CERTIFICATE_TEMPLATES[row.promotionName] || { title: row.promotionName, layout: 'officer', art: [] };
  const isOfficer = template.layout === 'officer';
  const title = template.title || row.promotionName || 'Unknown';
  const name = row.name || 'Unknown';
  const requirementsText = template.rank
    ? `Has satisfactorily completed all requirements and is entitled to promotion to ${template.rank}`
    : 'Has satisfactorily completed all requirements';
  const textTop = isOfficer ? CERTIFICATE_TEXT_BOX.officerTop : CERTIFICATE_TEXT_BOX.enlistedTop;

  return `<section class="certificate-page">
    <div class="certificate-sheet">
      ${[...template.art, ...CERTIFICATE_SEAL_AND_WINGS].map(renderCertificateArt).join('')}
      <div class="cert-text" style="left:${CERTIFICATE_TEXT_BOX.x}in;top:${textTop}in;width:${CERTIFICATE_TEXT_BOX.w}in">
        <p class="cert-large">CIVIL AIR PATROL</p>
        <p class="cert-large" style="font-size:${fitCertificateFontSize(title, 26)}pt">${esc(title)}</p>
        <p class="cert-large">&nbsp;</p>
        <p class="cert-small">This certificate is presented to</p>
        <p class="cert-small">&nbsp;</p>
        <p class="cert-large cert-name" style="font-size:${fitCertificateFontSize(name, 26)}pt">${esc(name)}</p>
        <p class="cert-small">&nbsp;</p>
        <p class="cert-small cert-requirements">${esc(requirementsText)}</p>
        <p class="cert-small">&nbsp;</p>
        <p class="cert-large">${row.awardDateText ? esc(row.awardDateText) : '&nbsp;'}</p>
      </div>
    </div>
  </section>`;
}

function renderCertificateArt(item) {
  const box = `left:${item.x}in;top:${item.y}in;width:${item.w}in;height:${item.h}in`;
  const src = esc(CERTIFICATE_ART + item.src);
  if (!item.crop) return `<img class="cert-art" src="${src}" alt="" style="${box}" />`;

  // A cropped picture keeps its frame; the image is enlarged and shifted so only the
  // uncropped part shows, matching how the slide deck crops it.
  const { l, r, t, b } = item.crop;
  const imageWidth = item.w / (1 - (l + r) / 100);
  const imageHeight = item.h / (1 - (t + b) / 100);
  return `<div class="cert-art cert-art-cropped" style="${box}">
    <img src="${src}" alt="" style="width:${imageWidth}in;height:${imageHeight}in;left:${-imageWidth * l / 100}in;top:${-imageHeight * t / 100}in" />
  </div>`;
}

// The deck sets each line in one text box, so a long title or name shrinks to stay on
// one line instead of wrapping into the lines below it.
function fitCertificateFontSize(text, basePoints, minPoints = 14) {
  const maxWidthPx = (CERTIFICATE_TEXT_BOX.w - 0.2) * 96;
  const context = (fitCertificateFontSize.canvas ||= document.createElement('canvas')).getContext('2d');
  context.font = `700 ${basePoints}pt ${CERTIFICATE_FONT_FAMILY}`;
  const widthPx = context.measureText(clean(text)).width;
  if (widthPx <= maxWidthPx) return basePoints;
  return Math.max(minPoints, Math.floor(basePoints * (maxWidthPx / widthPx) * 10) / 10);
}

async function loadCertificateFonts() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.all([
      document.fonts.load(`700 26pt ${CERTIFICATE_FONT_FAMILY}`),
      document.fonts.load(`700 12pt ${CERTIFICATE_FONT_FAMILY}`)
    ]);
  } catch (error) {
    console.warn('Certificate font did not load; printing with the fallback font.', error);
  }
}

// Waits for every picture to load or fail, giving up after a few seconds so a stalled
// image can never keep the print dialog from opening.
async function waitForImages(container, timeoutMs = 5000) {
  const loads = [...container.querySelectorAll('img')].map(image => (
    image.complete
      ? Promise.resolve()
      : new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      })
  ));
  await Promise.race([
    Promise.all(loads),
    new Promise(resolve => window.setTimeout(resolve, timeoutMs))
  ]);
}

function renderPrintableMilestonesReport() {
  const report = document.getElementById('milestonesPrintReport');
  const printedOn = dateFormatter.format(new Date());

  const milestoneRows = sortPrintableDueRows(getVisibleMilestoneRows()).map(cadet => [
    cadet.name || 'Unknown',
    cadet.achievement || 'Unknown',
    weeksFromDueText(cadet),
    getMissingMilestoneRequirementLabels(cadet).join(', ') || 'None',
    ...MILESTONE_DISPLAY_CHECKS.map(item => getCheckStatusPrintCell(cadet, item.sourceName))
  ]);
  const sdaRows = sortPrintableDueRows(getVisibleSdaRows()).map(cadet => [
    cadet.name || 'Unknown',
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
  return `<td>${esc(cell)}</td>`;
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
  return getCheckStatusLabel(cadet, sourceName);
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
  return getSdaRequirementStatusLabel(cadet, item);
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

function renderPromotionCertificateReport() {
  renderPromotionCertificatePicker();

  const rows = getPromotionCertificateRows();
  renderPromotionCertificatePreview(rows);
  renderCertificateExclusions();
  updatePrintReportCount();
}

function getPrintReportType() {
  return document.getElementById('printReportType').value;
}

// The Print Reports card shows the controls and preview for whichever report is chosen.
function applyPrintReportType() {
  const reportType = getPrintReportType();
  document.querySelectorAll('[data-report-type]').forEach(element => {
    element.classList.toggle('hidden', element.dataset.reportType !== reportType);
  });
  updatePrintReportCount();
}

function updatePrintReportCount() {
  const badge = document.getElementById('printReportCount');
  badge.textContent = getPrintReportType() === 'stalledCadets'
    ? formatCadetCount(getStalledCadetRows().length)
    : formatCertificateCount(getPromotionCertificateRows().length);
}

function getStalledMinDays() {
  const days = Number.parseInt(document.getElementById('stalledMinDays').value, 10);
  return Number.isFinite(days) && days > 0 ? days : 120;
}

function getStalledCadetRows() {
  const minDays = getStalledMinDays();

  return getDashboardCadets()
    .filter(cadet => cadet.status !== 'Completed' && cadet.daysInGrade !== null && cadet.daysInGrade >= minDays)
    .sort((left, right) => (right.daysInGrade - left.daysInGrade) || compareText(left.name, right.name));
}

// A cadet who has met every requirement is waiting on approval, not on their own work.
function getStalledBlockers(cadet) {
  return cadet.ready ? ['Awaiting approval'] : cadet.missing;
}

function countStalledBlockers(rows) {
  const counts = new Map();
  rows.forEach(cadet => getStalledBlockers(cadet).forEach(blocker => {
    counts.set(blocker, (counts.get(blocker) || 0) + 1);
  }));
  return [...counts].sort((left, right) => (right[1] - left[1]) || left[0].localeCompare(right[0]));
}

function renderStalledCadetsReport() {
  const rows = getStalledCadetRows();
  const minDays = getStalledMinDays();
  const noActivity = rows.filter(cadet => !cadet.lastActivity).length;
  const awaitingApproval = rows.filter(cadet => cadet.ready).length;

  document.getElementById('stalledSummary').innerHTML = [
    [rows.length, `In grade ${minDays}+ days`],
    [noActivity, 'No activity since promotion'],
    [awaitingApproval, 'Awaiting approval'],
    [rows.length ? formatDuration(rows[0].daysInGrade) : 'None', 'Longest in grade']
  ].map(([value, label]) => `<div class="summary-card">
      <div class="summary-num">${esc(value)}</div>
      <div class="summary-label">${esc(label)}</div>
    </div>`).join('');

  const blockers = countStalledBlockers(rows);
  document.getElementById('stalledBlockers').innerHTML = blockers.length
    ? `<strong>Most common blockers</strong>
      <div class="missing-list">${blockers.map(([blocker, count]) =>
    `<span class="pill ${blocker === 'Awaiting approval' ? 'pill-complete' : 'pill-incomplete'}">${esc(blocker)} <b>${count}</b></span>`
  ).join('')}</div>`
    : '';

  const table = document.getElementById('stalledCadetsTable');
  if (!cadets.length) {
    table.innerHTML = '<tr><td class="empty">Upload a cadet full-track report to find stalled cadets.</td></tr>';
  } else if (!rows.length) {
    table.innerHTML = `<tr><td class="empty">No cadets have been in grade ${minDays} days or more.</td></tr>`;
  } else {
    table.innerHTML = `<thead><tr>
        <th>Cadet</th>
        <th>Working On</th>
        <th>In Grade Since</th>
        <th>Last Activity</th>
        <th>Still Needs</th>
      </tr></thead><tbody>` +
      rows.map(cadet => `<tr>
        <td><strong>${esc(cadet.name || 'Unknown')}</strong><br><span class="note">CAPID ${esc(cadet.capid || '')}</span></td>
        <td><strong class="achievement-name">${esc(cadet.achievement || 'Unknown')}</strong>${cadet.rank ? `<br><span class="achievement-rank">${esc(cadet.rank)}</span>` : ''}</td>
        <td>${formatDate(cadet.inGradeSince)}<br><span class="note">${formatDuration(cadet.daysInGrade)}</span></td>
        <td>${renderLastActivity(cadet)}</td>
        <td><div class="missing-list">${getStalledBlockers(cadet).map(blocker =>
    `<span class="pill ${cadet.ready ? 'pill-complete' : 'pill-incomplete'}">${esc(blocker)}</span>`
  ).join('')}</div></td>
      </tr>`).join('') +
      '</tbody>';
  }

  updatePrintReportCount();
}

function renderLastActivity(cadet) {
  if (!cadet.lastActivity) return '<span class="badge overdue">None since promotion</span>';
  return `${formatDate(cadet.lastActivity)}<br><span class="note">${formatDuration(daysSince(cadet.lastActivity))} ago</span>`;
}

function lastActivityText(cadet) {
  return cadet.lastActivity
    ? `${formatDate(cadet.lastActivity)} (${formatDuration(daysSince(cadet.lastActivity))} ago)`
    : 'None since promotion';
}

function daysSince(date) {
  return Math.floor((today - startOfDay(date)) / 86400000);
}

function formatDuration(days) {
  if (days === null || days === undefined) return 'Unknown';
  if (days < 60) return `${days} day${days === 1 ? '' : 's'}`;
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months} months`;
  const years = Math.floor(months / 12);
  const extraMonths = months % 12;
  return `${years} years${extraMonths ? `, ${extraMonths} mo` : ''}`;
}

function handlePrintStalledCadetsReport() {
  const rows = getStalledCadetRows();
  if (!rows.length) {
    setStatusMessage('No stalled cadets match the current threshold.', 'error');
    return;
  }

  clearPrintReports();
  renderPrintableStalledCadetsReport(rows);
  document.body.classList.add('printing-report');
  window.print();
}

function renderPrintableStalledCadetsReport(rows) {
  const minDays = getStalledMinDays();
  const blockers = countStalledBlockers(rows)
    .slice(0, 6)
    .map(([blocker, count]) => `${blocker} (${count})`)
    .join(', ');

  document.getElementById('printReportsPrintReport').innerHTML = `
    <div class="print-report-header">
      <h1>Stalled Cadets</h1>
      <p>${esc(loadedFileName || 'No report file loaded')} | Printed ${esc(dateFormatter.format(new Date()))}</p>
      <p>${esc(formatCadetCount(rows.length))} in grade ${minDays} days or more. Most common blockers: ${esc(blockers || 'None')}.</p>
    </div>
    ${renderPrintTable(
      'Longest in grade first',
      ['Name', 'Working On', 'In Grade Since', 'Time in Grade', 'Last Activity', 'Still Needs'],
      rows.map(cadet => [
        cadet.name || 'Unknown',
        cadet.rank ? `${cadet.achievement} (${cadet.rank})` : cadet.achievement,
        formatDate(cadet.inGradeSince),
        formatDuration(cadet.daysInGrade),
        lastActivityText(cadet),
        getStalledBlockers(cadet).join(', ')
      ]),
      'No stalled cadets.'
    )}
  `;
}

function renderCertificateExclusions() {
  const excludedRows = getExcludedCertificateRows();
  const countBadge = document.getElementById('certificateExcludedCount');
  if (countBadge) countBadge.textContent = `${excludedRows.length} excluded`;

  renderScopedExclusionList({
    containerId: 'excludedCertificatesList',
    rows: excludedRows.map(row => ({ key: row.key, name: row.name, capid: row.capid, achievement: row.promotionName })),
    emptyMessage: 'No cadets are excluded from promotion certificates.',
    noDataMessage: 'Upload a cadet report to manage certificate exclusions.',
    action: 'include-certificate',
    buttonLabel: 'Re-add to Certificates'
  });
}

function renderPromotionCertificatePicker() {
  const container = document.getElementById('promotionCertificateCustomPicker');
  if (container.dataset.rendered === 'true') return;

  container.innerHTML = `<div class="promotion-picker-heading">
      <strong>Pick Promotions</strong>
      <div>
        <button class="action-chip include" type="button" data-action="select-all-certificate-promotions">Select All</button>
        <button class="action-chip exclude" type="button" data-action="clear-certificate-promotions">Clear All</button>
      </div>
    </div>
    <div class="promotion-picker-grid">
      ${requirements.map(row => {
        const promotionName = clean(row.Achievement);
        return `<label>
          <input type="checkbox" value="${esc(promotionName)}" data-certificate-promotion checked />
          <span>${esc(promotionName)}${row.Rank ? ` - ${esc(row.Rank)}` : ''}</span>
        </label>`;
      }).join('')}
    </div>`;
  container.dataset.rendered = 'true';
}

function renderPromotionCertificatePreview(rows) {
  const table = document.getElementById('promotionCertificatePreviewTable');
  if (!cadets.length) {
    table.innerHTML = '<tr><td class="empty">Upload a cadet full-track report to preview promotion certificates.</td></tr>';
    return;
  }

  if (!rows.length) {
    table.innerHTML = '<tr><td class="empty">No promotion certificates match the current filters.</td></tr>';
    return;
  }

  table.innerHTML = `<thead><tr>
      <th>New Grade</th>
      <th>Name</th>
      <th>Promotion Name</th>
      <th>Date of Award</th>
      <th></th>
    </tr></thead><tbody>` +
    rows.map(row => `<tr>
      <td>${esc(row.newGrade || 'Unknown')}</td>
      <td><strong>${esc(row.name || 'Unknown')}</strong>${row.capid ? `<br><span class="note">CAPID ${esc(row.capid)}</span>` : ''}</td>
      <td>${esc(row.promotionName || 'Unknown')}</td>
      <td>${row.awardDateText ? esc(row.awardDateText) : '<span class="note">No date</span>'}</td>
      <td><button class="action-chip exclude" type="button" data-action="exclude-certificate" data-key="${esc(row.key)}">Exclude</button></td>
    </tr>`).join('') +
    '</tbody>';
}

function renderAttendanceScanner() {
  ATTENDANCE_LISTS.forEach(item => {
    const numbers = [...attendanceLists[item.key]];
    const count = document.getElementById(item.countId);
    const list = document.getElementById(item.listId);

    if (count) count.textContent = formatNumberCount(numbers.length);
    if (!list) return;

    list.innerHTML = numbers.length
      ? numbers.map(numberValue => `<span class="attendance-number">${esc(numberValue)}</span>`).join('')
      : '<div class="empty">No numbers yet.</div>';
  });
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

// The last row of the requirements matrix is the top of the ladder, so a cadet who
// finishes every requirement there has completed the award rather than earned a
// promotion into something further on.
function isTerminalAchievement(achievement) {
  if (!requirements.length) return false;

  const finalAchievement = clean(requirements[requirements.length - 1].Achievement).toLowerCase();
  return finalAchievement !== '' && clean(achievement).toLowerCase() === finalAchievement;
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

function getPromotionCertificateRows() {
  return getAllPromotionCertificateRows().filter(row => !excludedCertificateKeys.has(row.key));
}

function buildPromotionCertificateRows(cadet) {
  // A finished top of the ladder is certified for itself. There is no promotion
  // approval behind it, so it carries no award date.
  const terminalRows = cadet.awardComplete
    ? [{ ...buildCertificateRow(cadet, cadet.achievement, null), datelessAward: true }]
    : [];

  // An all-promotions report carries the real approval date of every earlier
  // achievement, so each one gets its own certificate.
  if (cadet.promotionHistory) {
    const approvedRows = cadet.promotionHistory
      .filter(entry => entry.approvalDate && !isTerminalAchievement(entry.achievement))
      .map(entry => buildCertificateRow(cadet, entry.achievement, entry.approvalDate));
    return [...approvedRows, ...terminalRows];
  }

  // A latest-only report shows just the achievement in progress, so the certificate is
  // for the promotion just left, dated from the next approval date.
  if (cadet.awardComplete) return terminalRows;

  const currentIndex = requirements.findIndex(row =>
    clean(row.Achievement).toLowerCase() === clean(cadet.achievement).toLowerCase()
  );
  if (currentIndex <= 0) return [];

  const awardDate = lastPromotionFromNextApproval(cadet.raw);
  return [buildCertificateRow(cadet, requirements[currentIndex - 1].Achievement, awardDate)];
}

function buildCertificateRow(cadet, achievement, awardDate) {
  const requirementRow = findRequirementForAchievement(achievement);

  return {
    key: cadet.key,
    capid: cadet.capid,
    name: cadet.name,
    newGrade: clean(requirementRow.Rank || requirementRow.Grade),
    promotionName: clean(requirementRow.Achievement || achievement),
    awardDate,
    awardDateText: awardDate ? formatDate(awardDate) : '',
    datelessAward: false
  };
}

function getAllPromotionCertificateRows() {
  const selectedPromotions = getSelectedCertificatePromotions();
  const cutoffDate = getPromotionCertificateCutoffDate();

  return cadets
    .flatMap(buildPromotionCertificateRows)
    .filter(row => selectedPromotions.has(row.promotionName))
    .filter(row => !cutoffDate || row.datelessAward || (row.awardDate && startOfDay(row.awardDate) >= cutoffDate))
    .sort((left, right) =>
      comparePromotionCertificateRows(left, right)
    );
}

function getExcludedCertificateRows() {
  // An all-promotions report can give one cadet several certificates; list them once.
  const seenKeys = new Set();
  return getAllPromotionCertificateRows().filter(row => {
    if (!excludedCertificateKeys.has(row.key) || seenKeys.has(row.key)) return false;
    seenKeys.add(row.key);
    return true;
  });
}

function getSelectedCertificatePromotions() {
  const preset = document.getElementById('promotionCertificatePreset').value;

  if (preset === 'milestonesCurry') {
    return new Set(CERTIFICATE_MILESTONE_AND_CURRY_PROMOTIONS);
  }

  if (preset === 'custom') {
    return new Set([...document.querySelectorAll('[data-certificate-promotion]:checked')]
      .map(input => clean(input.value))
      .filter(Boolean));
  }

  return new Set(requirements.map(row => clean(row.Achievement)).filter(Boolean));
}

function getPromotionCertificateCutoffDate() {
  const months = Number.parseInt(document.getElementById('promotionCertificateMonths').value, 10);
  if (!Number.isFinite(months) || months <= 0) return null;
  return startOfDay(addMonths(today, -months));
}

function comparePromotionCertificateRows(left, right) {
  return achievementOrder(left.promotionName) - achievementOrder(right.promotionName) ||
    compareText(left.name, right.name) ||
    normalizedDateValue(right.awardDate) - normalizedDateValue(left.awardDate);
}

function setAllPromotionCertificateCheckboxes(checked) {
  document.querySelectorAll('[data-certificate-promotion]').forEach(input => {
    input.checked = checked;
  });
  renderPromotionCertificateReport();
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

function loadCertificateExclusions() {
  return loadStoredSet(CERTIFICATE_EXCLUDED_STORAGE_KEY, 'stored certificate exclusions');
}

function loadAttendanceLists() {
  const fallback = Object.fromEntries(ATTENDANCE_LISTS.map(item => [item.key, new Set()]));

  try {
    const stored = JSON.parse(localStorage.getItem(ATTENDANCE_STORAGE_KEY) || '{}');
    ATTENDANCE_LISTS.forEach(item => {
      const values = Array.isArray(stored[item.key]) ? stored[item.key] : [];
      fallback[item.key] = new Set(values.map(normalizeAttendanceNumber).filter(value => /^\d{6}$/.test(value)));
    });
  } catch (error) {
    console.warn('Unable to read stored attendance scanner lists.', error);
  }

  return fallback;
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

function persistCertificateExclusions() {
  persistStoredSet(CERTIFICATE_EXCLUDED_STORAGE_KEY, excludedCertificateKeys, 'certificate exclusions');
}

function persistAttendanceLists() {
  try {
    const payload = Object.fromEntries(ATTENDANCE_LISTS.map(item => [item.key, [...attendanceLists[item.key]]]));
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Unable to save attendance scanner lists.', error);
  }
}

function persistStoredSet(storageKey, values, description) {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...values]));
  } catch (error) {
    console.warn(`Unable to save ${description}.`, error);
  }
}

function renderChangelog() {
  document.getElementById('changelogEntries').innerHTML = CHANGELOG.map((entry, index) => `
    <article class="card changelog-entry">
      <div class="changelog-entry-heading">
        <div>
          <h2>Version ${esc(entry.version)}${entry.title ? ` &mdash; ${esc(entry.title)}` : ''}</h2>
          <p class="note">${esc(entry.date)}</p>
        </div>
        <span class="badge ${index === 0 ? 'ready' : 'future'}">${index === 0 ? 'Current' : 'Previous'}</span>
      </div>
      <ul class="changelog-list">
        ${entry.changes.map(change => `<li>${esc(change)}</li>`).join('')}
      </ul>
    </article>
  `).join('');
}

function applyAppVersion() {
  document.querySelectorAll('.version-badge').forEach(badge => {
    badge.textContent = `Version ${APP_VERSION}`;
  });
}

function showDashboard() {
  uploadPage.classList.add('hidden');
  changelogPage.classList.add('hidden');
  dashboardPage.classList.remove('hidden');
  loadedReportName.textContent = loadedFileName || 'Cadet report loaded';
}

function showUploadPage() {
  dashboardPage.classList.add('hidden');
  changelogPage.classList.add('hidden');
  uploadPage.classList.remove('hidden');
  loadedReportName.textContent = 'No report loaded';
}

// The changelog is reachable only from the upload page, so it never hides the dashboard.
function showChangelogPage() {
  uploadPage.classList.add('hidden');
  changelogPage.classList.remove('hidden');
  window.scrollTo(0, 0);
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
  if (status === 'Completed') return 'complete';
  if (status === 'Future') return 'future';
  return 'notready';
}

function formatCadetCount(count) {
  return `${count} cadet${count === 1 ? '' : 's'}`;
}

function formatNumberCount(count) {
  return `${count} number${count === 1 ? '' : 's'}`;
}

function formatCertificateCount(count) {
  return `${count} certificate${count === 1 ? '' : 's'}`;
}

function formatLabelList(labels) {
  if (labels.length <= 1) return labels[0] || '';
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
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

function addMonths(date, months) {
  return date ? new Date(date.getFullYear(), date.getMonth() + months, date.getDate()) : null;
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

applyAppVersion();
renderChangelog();
renderAll();
