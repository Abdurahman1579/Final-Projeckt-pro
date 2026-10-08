/* ============================================================
   ADMIN DATA — Supabase Integration
   ------------------------------------------------------------
   - Loads real data from Supabase into admin dashboard
   - Renders: stats, messages, donations, donors, news, reports
   - Handles: mark-as-read, approve, delete
   - Modals: News CRUD, Reports CRUD
   ============================================================ */

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") setTimeout(fn, 200);
    else
      document.addEventListener("DOMContentLoaded", () => setTimeout(fn, 200));
  }

  ready(async function () {
    if (!window.mknBackend) {
      console.warn("[Admin Data] mknBackend not available");
      return;
    }
    if (!window.adminPanel) {
      console.warn("[Admin Data] adminPanel not available");
      return;
    }

    console.log("[Admin Data] ✓ Loading real data from Supabase...");
    await loadAllData();

    // Reload on view switch
    document.querySelectorAll("#adminNav a[data-view]").forEach((link) => {
      link.addEventListener("click", () => setTimeout(loadAllData, 200));
    });

    // Reload on language change
    window.addEventListener("langchange", () => setTimeout(loadAllData, 150));
  });

  /* ============================================================
     MAIN LOADER
     ============================================================ */
  async function loadAllData() {
    try {
      const [statsRes, contactsRes, pledgesRes, subsRes, newsRes, reportsRes] =
        await Promise.all([
          window.mknBackend.fetchStats(),
          window.mknBackend.fetchContacts({ limit: 50 }),
          window.mknBackend.fetchPledges({ limit: 100 }),
          window.mknBackend.fetchSubscribers({ limit: 100 }),
          window.mknBackend.fetchNews({ limit: 50 }),
          window.mknBackend.fetchReports({ limit: 50 }),
        ]);

      if (statsRes.success) renderStats(statsRes.stats);
      if (contactsRes.success) renderMessages(contactsRes.data);
      if (pledgesRes.success) {
        renderDonations(pledgesRes.data);
        renderDonationsFull(pledgesRes.data);
        renderDonorsFromPledges(pledgesRes.data);
      }
      if (subsRes.success) window.__mknSubscribers = subsRes.data;
      if (newsRes.success) renderNews(newsRes.data);
      if (reportsRes.success) renderReportsAdmin(reportsRes.data);

      console.log("[Admin Data] ✓ Data loaded");
    } catch (err) {
      console.error("[Admin Data] Load failed:", err);
    }
  }

  /* ============================================================
     FORMATTERS
     ============================================================ */
  function fmtMoney(n) {
    if (!n && n !== 0) return "0 ብር";
    return Number(n).toLocaleString("en-US") + " ብር";
  }

  function fmtDate(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    } catch (e) {
      return iso;
    }
  }

  function timeAgo(iso) {
    if (!iso) return "";
    try {
      const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (seconds < 60) return "Just now";
      if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
      if (seconds < 86400) return Math.floor(seconds / 3600) + " hours ago";
      if (seconds < 604800) return Math.floor(seconds / 86400) + " days ago";
      return fmtDate(iso);
    } catch (e) {
      return "";
    }
  }

  function initials(name) {
    if (!name) return "??";
    return name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  function escapeAttr(s) {
    return String(s === null || s === undefined ? "" : s).replace(
      /"/g,
      "&quot;",
    );
  }

  function formatFileSize(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2) + " " + sizes[i];
  }

  function typeIcon(type) {
    const map = {
      financial: "💰",
      progress: "📊",
      audit: "🔍",
      quarterly: "📆",
    };
    return map[type] || "📄";
  }

  function statusClass(status) {
    if (!status) return "pending";
    if (status === "approved" || status === "received") return "approved";
    if (status === "pending") return "pending";
    if (status === "review") return "review";
    if (status === "cancelled") return "draft";
    return "pending";
  }

  /* ============================================================
     STATS CARDS
     ============================================================ */
  function renderStats(stats) {
    const cards = document.querySelectorAll("#view-dashboard .dash-stat");
    if (!cards.length || !stats) return;

    if (cards[0]) {
      const num = cards[0].querySelector(".ds-num");
      if (num)
        num.innerHTML =
          Number(stats.totalPledged).toLocaleString("en-US") +
          "<small> ብር</small>";
    }

    if (cards[1]) {
      const num = cards[1].querySelector(".ds-num");
      if (num) num.textContent = stats.totalPledges;
    }

    if (cards[2]) {
      const num = cards[2].querySelector(".ds-num");
      if (num) num.textContent = Number(stats.totalMessages).toLocaleString();
    }

    if (cards[3]) {
      const num = cards[3].querySelector(".ds-num");
      if (num) num.textContent = stats.totalSubscribers;
    }
  }

  /* ============================================================
     RECENT DONATIONS (dashboard)
     ============================================================ */
  function renderDonations(pledges) {
    const dashboardPanel = document.querySelector(
      "#view-dashboard .admin-cols .admin-panel",
    );
    if (!dashboardPanel) return;
    const tbody = dashboardPanel.querySelector(".admin-table tbody");
    if (!tbody) return;

    if (!pledges || pledges.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--ink500);padding:30px;">No donations yet</td></tr>`;
      return;
    }

    tbody.innerHTML = pledges
      .slice(0, 5)
      .map(
        (p) => `
      <tr>
        <td>${escapeHtml(p.name)}</td>
        <td><strong>${fmtMoney(p.amount)}</strong></td>
        <td>${escapeHtml(p.method || "—")}</td>
        <td><span class="status-badge ${statusClass(p.status)}">${p.status || "pending"}</span></td>
      </tr>
    `,
      )
      .join("");
  }

  /* ============================================================
     MESSAGES
     ============================================================ */
  function renderMessages(messages) {
    const panel = document.querySelector("#view-messages .admin-panel");
    if (!panel) return;

    panel
      .querySelectorAll(".message-card, .empty-state")
      .forEach((c) => c.remove());

    if (!messages || messages.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.style.cssText =
        "padding:40px 20px;text-align:center;color:var(--ink500);";
      empty.innerHTML = `
        <div style="font-size:50px;opacity:.4;margin-bottom:12px;">📭</div>
        <h3 style="font-size:17px;font-weight:700;color:var(--g900);margin-bottom:6px;">No messages yet</h3>
        <p style="font-size:14px;">Messages from the contact form will appear here.</p>
      `;
      panel.appendChild(empty);
      return;
    }

    const unread = messages.filter((m) => m.status === "new").length;
    const badge = panel.querySelector(".admin-panel-head .status-badge");
    if (badge) badge.textContent = unread + " Unread";

    messages.forEach((m) => {
      const card = document.createElement("div");
      card.className = "message-card" + (m.status === "new" ? " unread" : "");
      card.dataset.id = m.id;
      card.innerHTML = `
        <div class="msg-av">${initials(m.name)}</div>
        <div class="msg-body">
          <div class="msg-head">
            <span class="msg-name">${escapeHtml(m.name)}</span>
            <span class="msg-time">${timeAgo(m.created_at)}</span>
          </div>
          <div class="msg-subject">${escapeHtml(m.subject || "General")} · ${escapeHtml(m.phone)}</div>
          <div class="msg-text">${escapeHtml(m.message)}</div>
        </div>
        <div class="row-actions" style="align-self:flex-start;">
          ${m.status === "new" ? `<button class="icon-btn view" data-sb-mark="read" title="Mark as read">✓</button>` : ""}
          <button class="icon-btn danger" data-sb-delete="contact" title="Delete">🗑️</button>
        </div>
      `;
      panel.appendChild(card);
    });
  }

  /* ============================================================
     DONATIONS VIEW
     ============================================================ */
  function renderDonationsFull(pledges) {
    const tbody = document.querySelector(
      '#view-donations table[data-table="donations"] tbody',
    );
    if (!tbody) return;

    if (!pledges || pledges.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--ink500);padding:30px;">No pledges yet</td></tr>`;
      return;
    }

    tbody.innerHTML = pledges
      .map(
        (p) => `
      <tr data-id="${p.id}">
        <td>#${(p.id || "").substring(0, 4).toUpperCase()}</td>
        <td>${escapeHtml(p.name)}</td>
        <td><strong>${fmtMoney(p.amount)}</strong></td>
        <td>${escapeHtml(p.method || "—")}</td>
        <td>${fmtDate(p.created_at)}</td>
        <td><span class="status-badge ${statusClass(p.status)}">${p.status || "pending"}</span></td>
        <td>
          <div class="row-actions">
            ${p.status !== "approved" ? `<button class="icon-btn edit" data-sb-approve="${p.id}" title="Approve">✓</button>` : ""}
            <button class="icon-btn danger" data-sb-delete="pledge" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");
  }

  /* ============================================================
     DONORS VIEW
     ============================================================ */
  function renderDonorsFromPledges(pledges) {
    const tbody = document.querySelector(
      '#view-donors table[data-table="donors"] tbody',
    );
    if (!tbody) return;

    const byPhone = {};
    (pledges || []).forEach((p) => {
      if (!p.phone) return;
      const key = p.phone;
      if (!byPhone[key]) {
        byPhone[key] = {
          name: p.name,
          phone: p.phone,
          email: p.email || "",
          total: 0,
          count: 0,
          last: p.created_at,
        };
      }
      byPhone[key].total += Number(p.amount) || 0;
      byPhone[key].count += 1;
      if (new Date(p.created_at) > new Date(byPhone[key].last)) {
        byPhone[key].last = p.created_at;
      }
    });

    const donors = Object.values(byPhone).sort((a, b) => b.total - a.total);

    if (donors.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--ink500);padding:30px;">No donors yet</td></tr>`;
      return;
    }

    tbody.innerHTML = donors
      .map(
        (d) => `
      <tr>
        <td><div class="user-cell"><div class="u-av">${initials(d.name)}</div><div class="u-info"><strong>${escapeHtml(d.name)}</strong><small>${escapeHtml(d.email)}</small></div></div></td>
        <td>${escapeHtml(d.phone)}</td>
        <td><strong>${fmtMoney(d.total)}</strong></td>
        <td>${d.count}</td>
        <td>${fmtDate(d.last)}</td>
        <td><div class="row-actions"><span style="color:var(--ink500);font-size:12px;">—</span></div></td>
      </tr>
    `,
      )
      .join("");
  }

  /* ============================================================
     NEWS VIEW
     ============================================================ */
  function renderNews(news) {
    const tbody = document.querySelector(
      '#view-news table[data-table="news"] tbody',
    );
    if (!tbody) return;

    if (!news || news.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--ink500);padding:30px;">No news articles yet. Click "+ Add News" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = news
      .map(
        (n) => `
      <tr data-id="${n.id}" data-cat="${n.category || "announcement"}">
        <td>${escapeHtml(n.title)}${n.featured ? ' <span style="color:var(--gd600);font-size:12px;">⭐</span>' : ""}</td>
        <td>${escapeHtml(n.category || "")}</td>
        <td>${fmtDate(n.created_at)}</td>
        <td><span class="status-badge ${n.status === "published" ? "approved" : "draft"}">${n.status || "draft"}</span></td>
        <td><div class="row-actions">
          <button class="icon-btn edit" data-news-edit="${n.id}" title="Edit">✏️</button>
          <button class="icon-btn danger" data-news-delete="${n.id}" title="Delete">🗑️</button>
        </div></td>
      </tr>
    `,
      )
      .join("");
  }

  /* ============================================================
     REPORTS VIEW (Admin)
     ============================================================ */
  function renderReportsAdmin(reports) {
    const tbody = document.querySelector(
      '#view-reports table[data-table="reports"] tbody',
    );
    if (!tbody) return;

    if (!reports || reports.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--ink500);padding:30px;">No reports yet. Click "📤 Upload Report" to add one.</td></tr>`;
      return;
    }

    tbody.innerHTML = reports
      .map((r) => {
        const typeLabel =
          (window.i18n
            ? window.i18n.t("reports.type." + (r.type || "financial"))
            : r.type) || r.type;
        return `
        <tr data-id="${r.id}">
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="width:32px;height:32px;border-radius:8px;background:#e8f4ff;color:#1a5fa8;display:grid;place-items:center;font-size:14px;font-weight:700;flex-shrink:0;">${typeIcon(r.type)}</span>
              <span>${escapeHtml(r.title)}</span>
            </div>
          </td>
          <td>${escapeHtml(typeLabel)}</td>
          <td>${fmtDate(r.report_date || r.created_at)}</td>
          <td>${r.file_size ? formatFileSize(r.file_size) : "—"}</td>
          <td><span class="status-badge ${r.status === "published" ? "approved" : "draft"}">${r.status || "draft"}</span></td>
          <td><div class="row-actions">
            ${r.file_url ? `<button class="icon-btn view" data-report-download="${r.id}" title="Download">📥</button>` : ""}
            <button class="icon-btn edit" data-report-edit="${r.id}" title="Edit">✏️</button>
            <button class="icon-btn danger" data-report-delete="${r.id}" title="Delete">🗑️</button>
          </div></td>
        </tr>
      `;
      })
      .join("");
  }

  /* ============================================================
     NEWS MODAL
     ============================================================ */
  function openNewsModal(mode, id) {
    const modalOverlay = document.getElementById("modalOverlay");
    const modalBox = document.getElementById("modalBox");
    const modalBody = document.getElementById("modalBody");
    const modalTitleText = document.getElementById("modalTitleText");
    const modalSave = document.getElementById("modalSave");
    if (!modalOverlay || !modalBody) return;

    modalBox.classList.remove("confirm");
    modalTitleText.textContent =
      mode === "edit" ? "Edit News Article" : "New News Article";
    modalSave.textContent = window.i18n
      ? window.i18n.t("admin.modal.save")
      : "Save";
    modalSave.className = "modal-btn primary";

    window.__mknNewsModal = { mode, id: id || null };

    const fillData = (n) => {
      const v = n || {};
      modalBody.innerHTML = `
        <div class="form-group">
          <label class="form-label">Title *</label>
          <input class="form-input" type="text" id="nTitle" value="${escapeAttr(v.title)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-select" id="nCategory">
            <option value="announcement" ${v.category === "announcement" ? "selected" : ""}>Announcement</option>
            <option value="progress" ${v.category === "progress" ? "selected" : ""}>Progress</option>
            <option value="fundraising" ${v.category === "fundraising" ? "selected" : ""}>Fundraising</option>
            <option value="community" ${v.category === "community" ? "selected" : ""}>Community</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Short Excerpt</label>
          <textarea class="form-textarea" id="nExcerpt" rows="2">${escapeHtml(v.excerpt || "")}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Full Content</label>
          <textarea class="form-textarea" id="nContent" rows="5">${escapeHtml(v.content || "")}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <div class="form-status-row" id="nStatusRow">
            <button type="button" class="status-pill published ${v.status === "published" ? "active" : ""}" data-pill="published">Published</button>
            <button type="button" class="status-pill draft ${v.status === "draft" || !v.status ? "active" : ""}" data-pill="draft">Draft</button>
            <input type="hidden" id="nStatus" value="${v.status || "draft"}" />
          </div>
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:14px;color:var(--ink700);">
            <input type="checkbox" id="nFeatured" ${v.featured ? "checked" : ""} style="width:18px;height:18px;" />
            <span>Feature this article (show prominently on news page)</span>
          </label>
        </div>
      `;

      modalBody.querySelectorAll("#nStatusRow .status-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          modalBody
            .querySelectorAll("#nStatusRow .status-pill")
            .forEach((p) => p.classList.remove("active"));
          pill.classList.add("active");
          document.getElementById("nStatus").value = pill.dataset.pill;
        });
      });
    };

    if (mode === "edit" && id) {
      window.mknBackend.fetchNews({}).then((res) => {
        if (res.success) {
          const item = res.data.find((n) => n.id === id);
          fillData(item);
        }
      });
    } else {
      fillData(null);
    }

    modalOverlay.classList.add("show");
  }

  /* ============================================================
     REPORTS MODAL (with file upload)
     ============================================================ */
  function openReportModal(mode, id) {
    const modalOverlay = document.getElementById("modalOverlay");
    const modalBox = document.getElementById("modalBox");
    const modalBody = document.getElementById("modalBody");
    const modalTitleText = document.getElementById("modalTitleText");
    const modalSave = document.getElementById("modalSave");
    if (!modalOverlay || !modalBody) return;

    modalBox.classList.remove("confirm");
    modalTitleText.textContent =
      mode === "edit" ? "Edit Report" : "Upload New Report";
    modalSave.textContent = window.i18n
      ? window.i18n.t("admin.modal.save")
      : "Save";
    modalSave.className = "modal-btn primary";

    window.__mknReportModal = { mode, id: id || null, file: null };

    const renderForm = (r) => {
      const v = r || {};
      const hasFile = !!v.file_name;
      modalBody.innerHTML = `
        <div class="form-group">
          <label class="form-label">Report Title *</label>
          <input class="form-input" type="text" id="rTitle" value="${escapeAttr(v.title)}" placeholder="e.g. Monthly Financial — Jan 2026" />
        </div>
        <div class="form-group">
          <label class="form-label">Type</label>
          <select class="form-select" id="rType">
            <option value="financial" ${v.type === "financial" ? "selected" : ""}>Financial</option>
            <option value="progress" ${v.type === "progress" ? "selected" : ""}>Progress</option>
            <option value="audit" ${v.type === "audit" ? "selected" : ""}>Audit</option>
            <option value="quarterly" ${v.type === "quarterly" ? "selected" : ""}>Quarterly</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" id="rDesc" rows="3" placeholder="Short description of the report">${escapeHtml(v.description || "")}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Report File ${mode === "add" ? "*" : ""} (PDF, DOC, XLS)</label>
          <div class="file-dropzone ${hasFile ? "has-file" : ""}" data-report-zone>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" data-report-input />
            ${
              hasFile
                ? `<div class="file-preview">
                  <div class="fp-icon pdf">📕</div>
                  <div class="fp-info">
                    <div class="fp-name">${escapeHtml(v.file_name)}</div>
                    <div class="fp-meta"><span><strong>${formatFileSize(v.file_size)}</strong></span></div>
                  </div>
                  <button type="button" class="fp-remove" data-report-remove title="Remove">×</button>
                </div>`
                : `<div class="dz-icon">📤</div>
                 <div class="dz-title">Click to browse or drop file here</div>
                 <div class="dz-hint">PDF, DOC, XLS · Max 50 MB</div>`
            }
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <div class="form-status-row" id="rStatusRow">
            <button type="button" class="status-pill published ${v.status === "published" ? "active" : ""}" data-pill="published">Published</button>
            <button type="button" class="status-pill draft ${v.status === "draft" || !v.status ? "active" : ""}" data-pill="draft">Draft</button>
            <input type="hidden" id="rStatus" value="${v.status || "draft"}" />
          </div>
        </div>
      `;

      modalBody.querySelectorAll("#rStatusRow .status-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          modalBody
            .querySelectorAll("#rStatusRow .status-pill")
            .forEach((p) => p.classList.remove("active"));
          pill.classList.add("active");
          document.getElementById("rStatus").value = pill.dataset.pill;
        });
      });

      // File upload setup
      setupReportFileUpload();
    };

    const setupReportFileUpload = () => {
      const zone = modalBody.querySelector("[data-report-zone]");
      const input = modalBody.querySelector("[data-report-input]");
      const removeBtn = modalBody.querySelector("[data-report-remove]");

      const handleFile = (file) => {
        if (!file) return;
        if (window.__mknReportModal) window.__mknReportModal.file = file;
        const size = formatFileSize(file.size);
        zone.classList.add("has-file");
        zone.innerHTML = `
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" data-report-input />
          <div class="file-preview">
            <div class="fp-icon pdf">📕</div>
            <div class="fp-info">
              <div class="fp-name">${escapeHtml(file.name)}</div>
              <div class="fp-meta"><span><strong>${size}</strong></span></div>
            </div>
            <button type="button" class="fp-remove" data-report-remove title="Remove">×</button>
          </div>
        `;
        setupReportFileUpload();
      };

      if (input) {
        input.addEventListener("change", () => {
          if (input.files[0]) handleFile(input.files[0]);
        });
      }

      if (zone && input) {
        ["dragenter", "dragover"].forEach((evt) => {
          zone.addEventListener(evt, (e) => {
            e.preventDefault();
            zone.classList.add("dragover");
          });
        });
        ["dragleave", "drop"].forEach((evt) => {
          zone.addEventListener(evt, (e) => {
            e.preventDefault();
            zone.classList.remove("dragover");
          });
        });
        zone.addEventListener("drop", (e) => {
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        });
      }

      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (window.__mknReportModal) window.__mknReportModal.file = null;
          zone.classList.remove("has-file");
          zone.innerHTML = `
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" data-report-input />
            <div class="dz-icon">📤</div>
            <div class="dz-title">Click to browse or drop file here</div>
            <div class="dz-hint">PDF, DOC, XLS · Max 50 MB</div>
          `;
          setupReportFileUpload();
        });
      }
    };

    if (mode === "edit" && id) {
      window.mknBackend.fetchReports({}).then((res) => {
        if (res.success) {
          const item = res.data.find((r) => r.id === id);
          renderForm(item);
        }
      });
    } else {
      renderForm(null);
    }

    modalOverlay.classList.add("show");
  }

  /* ============================================================
     ACTION HANDLERS — Mark read / Approve / Delete
     ============================================================ */

  // Mark message as read
  document.addEventListener(
    "click",
    async (e) => {
      const btn = e.target.closest("[data-sb-mark]");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const card = btn.closest(".message-card");
      if (!card) return;
      btn.disabled = true;
      const res = await window.mknBackend.updateContactStatus(
        card.dataset.id,
        "read",
      );
      if (res.success) {
        card.classList.remove("unread");
        btn.remove();
        if (window.showToast) window.showToast("✓ Marked as read", "success");
        loadAllData();
      } else {
        btn.disabled = false;
        if (window.showToast) window.showToast(res.error || "Failed", "error");
      }
    },
    true,
  );

  // Approve pledge
  document.addEventListener(
    "click",
    async (e) => {
      const btn = e.target.closest("[data-sb-approve]");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      btn.disabled = true;
      const res = await window.mknBackend.updatePledgeStatus(
        btn.dataset.sbApprove,
        "approved",
      );
      if (res.success) {
        if (window.showToast) window.showToast("✓ Pledge approved", "success");
        loadAllData();
      } else {
        btn.disabled = false;
        if (window.showToast) window.showToast(res.error || "Failed", "error");
      }
    },
    true,
  );

  // Delete contact/pledge
  document.addEventListener(
    "click",
    async (e) => {
      const btn = e.target.closest("[data-sb-delete]");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const type = btn.dataset.sbDelete;
      const container = btn.closest(".message-card, tr[data-id]");
      if (!container) return;
      const id = container.dataset.id;
      if (!confirm("Are you sure? / ማጥፋት እርግጠኛ ነዎት?")) return;

      const table = type === "contact" ? "mkn_contact_messages" : "mkn_pledges";
      btn.disabled = true;
      const res = await window.mknBackend.deleteRecord(table, id);
      if (res.success) {
        container.style.transition = "opacity .3s, transform .3s";
        container.style.opacity = "0";
        container.style.transform = "translateX(-20px)";
        setTimeout(() => {
          container.remove();
          if (window.showToast) window.showToast("✓ Deleted", "success");
        }, 300);
        loadAllData();
      } else {
        btn.disabled = false;
        if (window.showToast) window.showToast(res.error || "Failed", "error");
      }
    },
    true,
  );

  /* ============================================================
     NEWS ACTIONS
     ============================================================ */
  document.addEventListener(
    "click",
    (e) => {
      const editBtn = e.target.closest("[data-news-edit]");
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        openNewsModal("edit", editBtn.dataset.newsEdit);
        return;
      }

      const delBtn = e.target.closest("[data-news-delete]");
      if (delBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Delete this news article?")) return;
        delBtn.disabled = true;
        window.mknBackend.deleteNews(delBtn.dataset.newsDelete).then((res) => {
          if (res.success) {
            if (window.showToast) window.showToast("✓ Deleted", "success");
            loadAllData();
          } else {
            delBtn.disabled = false;
            if (window.showToast)
              window.showToast(res.error || "Failed", "error");
          }
        });
        return;
      }

      const addBtn = e.target.closest('[data-add="news"]');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        openNewsModal("add", null);
        return;
      }
    },
    true,
  );

  // Save news (capture modalSave click)
  document.addEventListener(
    "click",
    async (e) => {
      const saveBtn = e.target.closest("#modalSave");
      if (!saveBtn) return;
      if (!window.__mknNewsModal) return;
      e.preventDefault();
      e.stopPropagation();

      const state = window.__mknNewsModal;
      const title = document.getElementById("nTitle")?.value.trim();
      const category = document.getElementById("nCategory")?.value;
      const excerpt = document.getElementById("nExcerpt")?.value.trim();
      const content = document.getElementById("nContent")?.value.trim();
      const status = document.getElementById("nStatus")?.value;
      const featured = document.getElementById("nFeatured")?.checked;

      if (!title) {
        if (window.showToast) window.showToast("Title is required", "error");
        return;
      }

      saveBtn.disabled = true;
      let res;
      if (state.mode === "edit" && state.id) {
        res = await window.mknBackend.updateNews(state.id, {
          title,
          category,
          excerpt,
          content,
          status,
          featured,
        });
      } else {
        res = await window.mknBackend.createNews({
          title,
          category,
          excerpt,
          content,
          status,
          featured,
        });
      }
      saveBtn.disabled = false;

      if (res.success) {
        if (window.showToast) window.showToast("✓ Saved", "success");
        document.getElementById("modalOverlay").classList.remove("show");
        window.__mknNewsModal = null;
        loadAllData();
      } else {
        if (window.showToast) window.showToast(res.error || "Failed", "error");
      }
    },
    true,
  );

  /* ============================================================
     REPORTS ACTIONS
     ============================================================ */
  document.addEventListener(
    "click",
    (e) => {
      const editBtn = e.target.closest("[data-report-edit]");
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        openReportModal("edit", editBtn.dataset.reportEdit);
        return;
      }

      const delBtn = e.target.closest("[data-report-delete]");
      if (delBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Delete this report and its file?")) return;
        delBtn.disabled = true;
        window.mknBackend
          .deleteReport(delBtn.dataset.reportDelete)
          .then((res) => {
            if (res.success) {
              if (window.showToast) window.showToast("✓ Deleted", "success");
              loadAllData();
            } else {
              delBtn.disabled = false;
              if (window.showToast)
                window.showToast(res.error || "Failed", "error");
            }
          });
        return;
      }

      const dlBtn = e.target.closest("[data-report-download]");
      if (dlBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = dlBtn.dataset.reportDownload;
        window.mknBackend.fetchReports({}).then((res) => {
          if (res.success) {
            const r = res.data.find((x) => x.id === id);
            if (r && r.file_url) {
              window.open(r.file_url, "_blank", "noopener");
              if (window.showToast)
                window.showToast("📥 Opening " + r.file_name, "success");
            } else {
              if (window.showToast)
                window.showToast("No file attached", "warn");
            }
          }
        });
        return;
      }

      const addBtn = e.target.closest('[data-add="reports"]');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        openReportModal("add", null);
        return;
      }
    },
    true,
  );

  // Save report (capture modalSave click)
  document.addEventListener(
    "click",
    async (e) => {
      const saveBtn = e.target.closest("#modalSave");
      if (!saveBtn) return;
      if (!window.__mknReportModal) return;
      e.preventDefault();
      e.stopPropagation();

      const state = window.__mknReportModal;
      const title = document.getElementById("rTitle")?.value.trim();
      const type = document.getElementById("rType")?.value;
      const description = document.getElementById("rDesc")?.value.trim();
      const status = document.getElementById("rStatus")?.value;

      if (!title) {
        if (window.showToast) window.showToast("Title is required", "error");
        return;
      }

      if (state.mode === "add" && !state.file) {
        if (window.showToast)
          window.showToast("Please select a file to upload", "error");
        return;
      }

      saveBtn.disabled = true;
      const originalText = saveBtn.textContent;
      saveBtn.textContent = "⏳ Uploading...";

      try {
        let fileData = {};

        if (state.file) {
          if (window.showToast)
            window.showToast("📤 Uploading file...", "info");
          const up = await window.mknBackend.uploadReportFile(state.file);
          if (!up.success) {
            if (window.showToast)
              window.showToast("Upload failed: " + up.error, "error");
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
            return;
          }
          fileData = {
            file_url: up.file_url,
            file_path: up.file_path,
            file_name: up.file_name,
            file_size: up.file_size,
          };
        }

        let res;
        if (state.mode === "edit" && state.id) {
          res = await window.mknBackend.updateReport(state.id, {
            title,
            type,
            description,
            status,
            ...fileData,
          });
        } else {
          res = await window.mknBackend.createReport({
            title,
            type,
            description,
            status,
            ...fileData,
          });
        }

        saveBtn.disabled = false;
        saveBtn.textContent = originalText;

        if (res.success) {
          if (window.showToast) window.showToast("✓ Report saved", "success");
          document.getElementById("modalOverlay").classList.remove("show");
          window.__mknReportModal = null;
          loadAllData();
        } else {
          if (window.showToast)
            window.showToast(res.error || "Failed", "error");
        }
      } catch (err) {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
        if (window.showToast)
          window.showToast("Error: " + err.message, "error");
      }
    },
    true,
  );

  console.log("[Admin Data] ✓ Ready");
})();
