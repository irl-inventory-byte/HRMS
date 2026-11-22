/**
 * lib.js — shared backend helpers for the HRMS dashboard.
 * Loaded before index.html's own <script> block, so everything in here
 * (Supabase client, auth, roles, data loading/saving) is available globally
 * to every page's render functions and to access.js.
 */

/* ---------------- Supabase config ---------------- */
// Fill these in with your own project's values (Supabase dashboard → Settings → API).
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";       // e.g. https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
let supabase = null;
let backendReady = false;
if (SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  backendReady = true;
}

/* ---------------- roles & permissions ---------------- */
const ROLES = {
  admin:       { label: "Admin",       pages: ["home","directory","leave","onboarding","openings","walkin","interviews","applications","people","access"], edit: ["directory","leave","onboarding","openings","walkin","interviews","applications","people","access"] },
  hr:          { label: "HR",          pages: ["home","interviews","applications"],                                                       edit: ["interviews","applications"] },
  manager:     { label: "Manager",     pages: ["home","leave"],                                                                          edit: ["leave"] },
  interviewer: { label: "Interviewer", pages: ["home","walkin","interviews"],                                                             edit: ["walkin","interviews"] },
  employee:    { label: "Employee",    pages: ["home"],                                                                                   edit: [] },
  candidate:   { label: "Candidate",   pages: ["form"],                                                                                   edit: ["form"] },
};
let currentRole = "employee"; // real value is loaded from the profiles table after login
let currentUser = null;
function canEdit(pageKey) {
  return ROLES[currentRole].edit.includes(pageKey);
}
function applyRoleNav() {
  const allowed = ROLES[currentRole].pages;
  Object.values(PAGES).forEach(cfg => {
    const btn = document.getElementById(cfg.btn);
    if (!btn) return;
    const pageKey = Object.keys(PAGES).find(k => PAGES[k] === cfg);
    btn.style.display = allowed.includes(pageKey) ? '' : 'none';
  });
}

/* ---------------- Auth ---------------- */
function showLoginError(msg) {
  document.getElementById('loginError').innerHTML = msg ? `<div class="notebox crit" style="margin-top:4px;">${msg}</div>` : "";
}
async function handleLogin() {
  if (!backendReady) { showLoginError("Supabase isn't configured yet — fill in SUPABASE_URL and SUPABASE_ANON_KEY in lib.js first."); return; }
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { showLoginError("Enter email and password."); return; }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { showLoginError(error.message); return; }
  await onAuthenticated(data.user);
}
async function handleSignup() {
  if (!backendReady) { showLoginError("Supabase isn't configured yet — fill in SUPABASE_URL and SUPABASE_ANON_KEY in lib.js first."); return; }
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { showLoginError("Enter email and password."); return; }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) { showLoginError(error.message); return; }
  if (data.user && !data.session) {
    showLoginError("Account created — check your email to confirm, then sign in.");
  } else if (data.user) {
    await onAuthenticated(data.user);
  }
}
async function handleGoogleLogin() {
  if (!backendReady) { showLoginError("Supabase isn't configured yet — fill in SUPABASE_URL and SUPABASE_ANON_KEY in lib.js first."); return; }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href },
  });
  if (error) { showLoginError(error.message); return; }
  // On success the browser is redirected to Google, then back here — checkExistingSession()
  // (called on page load) picks up the resulting session automatically.
}
async function handleLogout() {
  if (backendReady) await supabase.auth.signOut();
  currentUser = null;
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}
async function onAuthenticated(user) {
  currentUser = user;
  // fetch this user's role from the profiles table
  const { data: profile, error } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();
  if (error || !profile) {
    currentRole = "employee";
    document.getElementById('currentUserBox').textContent = `${user.email} (role not found — defaulting to Employee)`;
  } else {
    currentRole = profile.role;
    document.getElementById('currentUserBox').textContent = `${profile.full_name} · ${ROLES[currentRole].label}`;
  }
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').style.display = '';
  await loadAllFromSheets();
  applyRoleNav();
  switchPage(ROLES[currentRole].pages[0]);
}
async function checkExistingSession() {
  if (!backendReady) {
    document.getElementById('loginConfigWarning').innerHTML =
      `<div class="notebox crit" style="margin-bottom:10px;">Supabase isn't connected yet. Open lib.js, fill in <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> near the top, and reload.</div>`;
    return;
  }
  const { data } = await supabase.auth.getSession();
  if (data.session && data.session.user) {
    await onAuthenticated(data.session.user);
  }
}


/* ---------------- Supabase data loading & persistence ---------------- */
function rowToEmployee(r) {
  return { id: r.id, name: r.name, title: r.title, org: r.org, manager: r.manager || "",
    join: r.join_date || "", status: r.status, contractEnd: r.contract_end || "",
    exitReason: r.exit_reason || "", officeEmail: r.office_email || "", personalEmail: r.personal_email || "", phone: r.phone || "" };
}
function employeeToRow(e) {
  return { id: e.id, name: e.name, title: e.title, org: e.org, manager: e.manager,
    join_date: e.join || null, status: e.status, contract_end: e.contractEnd || null,
    exit_reason: e.exitReason || null, office_email: e.officeEmail, personal_email: e.personalEmail, phone: e.phone };
}
function rowToLeave(r) {
  return { id: r.id, empId: r.emp_id, type: r.leave_type, from: r.from_date, to: r.to_date, days: r.days, reason: r.reason, status: r.status };
}
function rowToInterview(r) {
  return { id: r.id, name: r.candidate_name, email: r.candidate_email, phone: r.candidate_phone || "",
    position: r.position, round: r.round, date: r.interview_date, interviewer: r.interviewer || "",
    outcome: r.outcome, feedback: r.feedback || "" };
}
function interviewToRow(i) {
  return { candidate_name: i.name, candidate_email: i.email, candidate_phone: i.phone,
    position: i.position, round: i.round, interview_date: i.date, interviewer: i.interviewer,
    outcome: i.outcome, feedback: i.feedback };
}
function rowToApplication(r) {
  return { id: r.id, empId: r.emp_id, position: r.position, date: r.applied_on, result: r.result,
    candidateName: r.candidate_name || "", candidateEmail: r.candidate_email || "" };
}
function rowToOpening(r) {
  return { id: r.id, position: r.position, org: r.org, vacancies: r.vacancies, status: r.status, posted: r.posted, notes: r.notes || "" };
}
function openingToRow(o) {
  return { position: o.position, org: o.org, vacancies: o.vacancies, status: o.status, posted: o.posted, notes: o.notes };
}
function rowToOnboard(r) {
  return { id: r.id, name: r.name, position: r.position, org: r.org, startDate: r.start_date, tasks: r.tasks };
}
function onboardToRow(o) {
  return { name: o.name, position: o.position, org: o.org, start_date: o.startDate, tasks: o.tasks };
}

function rowToPerson(r) {
  return { id: r.id, name: r.full_name, role: r.role, city: r.city, email: r.email, mobile: r.mobile, status: r.status || "Active", createdAt: r.created_at };
}
function personToRow(p) {
  return { full_name: p.name, role: p.role, city: p.city, email: p.email, mobile: p.mobile, status: p.status || "Active" };
}

async function loadAllFromSheets() {
  if (!backendReady) return;
  const [{ data: empRows }, { data: leaveRows }, { data: intRows }, { data: appRows }, { data: openRows }, { data: obRows }, { data: userRows }, { data: peopleRows }] = await Promise.all([
    supabase.from('employees').select('*').order('id'),
    supabase.from('leave_requests').select('*').order('id'),
    supabase.from('interviews').select('*').order('id'),
    supabase.from('applications').select('*').order('id'),
    supabase.from('openings').select('*').order('id'),
    supabase.from('onboarding').select('*').order('id'),
    supabase.from('profiles').select('*').order('created_at'),
    supabase.from('people').select('*').order('full_name'),
  ]);
  if (empRows) employees = empRows.map(rowToEmployee);
  if (leaveRows) leaveRequests = leaveRows.map(rowToLeave);
  if (intRows) interviews = intRows.map(rowToInterview);
  if (appRows) applications = appRows.map(rowToApplication);
  if (openRows) openings = openRows.map(rowToOpening);
  if (obRows) onboardingList = obRows.map(rowToOnboard);
  if (userRows) accounts = userRows;
  if (peopleRows) people = peopleRows.map(rowToPerson);
  renderAll();
}
async function persistPersonInsert(p) {
  if (!backendReady) return { ok: false, error: "Backend not configured." };
  const { data, error } = await supabase.from('people').insert(personToRow(p)).select().single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, row: data };
}
async function persistPersonStatus(id, status) {
  if (!backendReady) return;
  const { error } = await supabase.from('people').update({ status }).eq('id', id);
  if (error) showToast(`Update failed: ${error.message}`);
}
async function persistUserRole(userId, newRole) {
  if (!backendReady) return false;
  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
  if (error) { showToast(`Role change failed: ${error.message}`); return false; }
  return true;
}
async function persistInterviewInsert(i) {
  if (!backendReady) return null;
  const { data, error } = await supabase.from('interviews').insert(interviewToRow(i)).select().single();
  if (error) { showToast(`Supabase save failed: ${error.message}`); return null; }
  return data;
}
async function persistInterviewUpdate(i) {
  if (!backendReady || !i.id) return;
  const { error } = await supabase.from('interviews').update(interviewToRow(i)).eq('id', i.id);
  if (error) showToast(`Supabase update failed: ${error.message}`);
}
async function persistApplicationInsert(a) {
  if (!backendReady) return null;
  const { data, error } = await supabase.from('applications')
    .insert({ emp_id: a.empId || null, position: a.position, applied_on: a.date, result: a.result,
      candidate_name: a.candidateName || null, candidate_email: a.candidateEmail || null }).select().single();
  if (error) { showToast(`Supabase save failed: ${error.message}`); return null; }
  return data;
}
async function persistOpening(o) {
  if (!backendReady) return;
  const row = openingToRow(o);
  if (o.id) {
    const { error } = await supabase.from('openings').update(row).eq('id', o.id);
    if (error) showToast(`Supabase update failed: ${error.message}`);
  } else {
    const { data, error } = await supabase.from('openings').insert(row).select().single();
    if (error) { showToast(`Supabase save failed: ${error.message}`); return; }
    o.id = data.id;
  }
}
async function persistOnboarding(o) {
  if (!backendReady) return;
  const row = onboardToRow(o);
  if (o.id) {
    const { error } = await supabase.from('onboarding').update(row).eq('id', o.id);
    if (error) showToast(`Supabase update failed: ${error.message}`);
  } else {
    const { data, error } = await supabase.from('onboarding').insert(row).select().single();
    if (error) { showToast(`Supabase save failed: ${error.message}`); return; }
    o.id = data.id;
  }
}
async function persistEmployee(e) {
  if (!backendReady) return;
  const { error } = await supabase.from('employees').upsert(employeeToRow(e));
  if (error) showToast(`Supabase save failed: ${error.message}`);
}
async function persistLeaveInsert(l) {
  if (!backendReady) return null;
  const { data, error } = await supabase.from('leave_requests')
    .insert({ emp_id: l.empId, leave_type: l.type, from_date: l.from, to_date: l.to, days: l.days, reason: l.reason, status: l.status })
    .select().single();
  if (error) { showToast(`Supabase save failed: ${error.message}`); return null; }
  return data;
}
async function persistLeaveStatus(leaveRowId, status) {
  if (!backendReady) return;
  const { error } = await supabase.from('leave_requests').update({ status }).eq('id', leaveRowId);
  if (error) showToast(`Supabase update failed: ${error.message}`);
}