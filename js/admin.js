/* ============================================================
   ADMIN PANEL — Full JavaScript
   Malka Nono Islamic Affairs Council Project
   ------------------------------------------------------------
   Features:
   - Login system (session-based)
   - 8 working views (Dashboard, News, Reports, Donations,
     Donors, Messages, Users, Settings)
   - Full CRUD: Add / Edit / Delete with modals
   - Drag & Drop file upload for reports
   - Toast notifications
   - Language switcher (EN / AM / OM / AR)
   - Status pills, date pickers, file previews
   - Leadership widget on dashboard
   - External link handling (Leadership page)
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     1) LOGIN LOGIC
     ============================================================ */
  const DEMO_USER = "admin";
  const DEMO_PASS = "malka2026";

  const loginScreen = document.getElementById("loginScreen");
  const adminApp = document.getElementById("adminApp");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");

  // Auto-login if session exists
  if (sessionStorage.getItem("adminLoggedIn") === "true") {
    showDashboard();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = document.getElementById("adminUser").value.trim();
      const p = document.getElementById("adminPass").value.trim();
      if (u === DEMO_USER && p === DEMO_PASS) {
        sessionStorage.setItem("adminLoggedIn", "true");
        showDashboard();
      } else {
        loginError.classList.add("show");
        setTimeout(() => loginError.classList.remove("show"), 4000);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("adminLoggedIn");
      adminApp.classList.remove("active");
      loginScreen.classList.remove("hidden");
      document.getElementById("adminUser").value = "";
      document.getElementById("adminPass").value = "";
    });
  }

  function showDashboard() {
    loginScreen.classList.add("hidden");
    adminApp.classList.add("active");
    window.scrollTo(0, 0);
    // Render leadership widget once logged in
    setTimeout(renderLeadershipWidget, 120);
  }

  /* ============================================================
     2) VIEW METADATA (title, subtitle, contextual add button)
     ============================================================ */
  const viewMeta = {
    dashboard: {
      title: "admin.dashboard.title",
      subtitle: "admin.dashboard.welcome",
      add: null,
    },
    news: {
      title: "admin.nav.news",
      subtitle: "admin.news.subtitle",
      add: "news",
      addLabel: "admin.news.new",
    },
    reports: {
      title: "admin.nav.reports",
      subtitle: "admin.reports.subtitle",
      add: "reports",
      addLabel: "admin.reports.upload",
    },
    donations: {
      title: "admin.nav.donations",
      subtitle: "admin.donations.subtitle",
      add: "donations",
      addLabel: "admin.donations.new",
    },
    donors: {
      title: "admin.nav.donors",
      subtitle: "admin.donors.subtitle",
      add: "donors",
      addLabel: "admin.donors.new",
    },
    messages: {
      title: "admin.nav.messages",
      subtitle: "admin.messages.subtitle",
      add: null,
    },
    users: {
      title: "admin.nav.users",
      subtitle: "admin.users.subtitle",
      add: "users",
      addLabel: "admin.users.new",
    },
    settings: {
      title: "admin.nav.settings",
      subtitle: "admin.settings.subtitle",
      add: null,
    },
  };

  const navLinks = document.querySelectorAll("#adminNav a");
  const viewTitle = document.getElementById("viewTitle");
  const viewSubtitle = document.getElementById("viewSubtitle");
  const topAddBtn = document.getElementById("topAddBtn");

  /* ============================================================
     3) VIEW SWITCHER
     ============================================================ */
  function switchView(viewId) {
    document
      .querySelectorAll(".admin-view")
      .forEach((v) => v.classList.remove("active"));
    const target = document.getElementById("view-" + viewId);
    if (target) target.classList.add("active");

    navLinks.forEach((l) =>
      l.classList.toggle("active", l.dataset.view === viewId)
    );

    const meta = viewMeta[viewId];
    if (meta && viewTitle && viewSubtitle) {
      viewTitle.setAttribute("data-i18n", meta.title);
      viewSubtitle.setAttribute("data-i18n", meta.subtitle);
      viewTitle.textContent = window.i18n.t(meta.title);
      viewSubtitle.textContent = window.i18n.t(meta.subtitle);

      if (topAddBtn) {
        if (meta.add) {
          topAddBtn.style.display = "";
          topAddBtn.setAttribute("data-add", meta.add);
          topAddBtn.innerHTML =
            "+ <span>" + window.i18n.t(meta.addLabel) + "</span>";
        } else {
          topAddBtn.style.display = "none";
        }
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ============================================================
     4) NAV LINK CLICKS (skip external links)
     ============================================================ */
  navLinks.forEach((link) => {
    // Skip external links — let browser handle them
    if (link.hasAttribute("data-external") || !link.dataset.view) return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchView(link.dataset.view);
    });
  });

  // data-goto links
  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      switchView(el.dataset.goto);
    });
  });

  // Quick actions with data-add
  document.querySelectorAll(".quick-action[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => openAddModal(btn.dataset.add));
  });

  // Quick actions with data-export
  document.querySelectorAll(".quick-action[data-export]").forEach((btn) => {
    btn.addEventListener("click", () =>
      showToast(window.i18n.t("admin.toast.exported"), "success")
    );
  });

  /* ============================================================
     5) TOAST NOTIFICATIONS
     ============================================================ */
  window.showToast = showToast;
  function showToast(msg, type = "success") {
    const c = document.getElementById("toastContainer");
    if (!c) return;
    const icons = { success: "✓", error: "✕", info: "ℹ", warn: "⚠" };
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.innerHTML =
      '<div class="ti">' + (icons[type] || "✓") + "</div><div>" + msg + "</div>";
    c.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("out");
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  /* ============================================================
     6) HELPERS — File icon + size formatter
     ============================================================ */
  function getFileIcon(filename) {
    const ext = (String(filename).split(".").pop() || "").toLowerCase();
    if (ext === "pdf") return "📕";
    if (ext === "doc" || ext === "docx") return "📘";
    if (ext === "xls" || ext === "xlsx") return "📗";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
    return "📄";
  }

  function formatFileSize(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2) + " " + sizes[i];
  }

  /* ============================================================
     7) FORM CONFIGS — one per entity type
     ============================================================ */
  const formConfigs = {
    /* ---------- NEWS ---------- */
    news: {
      icon: "📝",
      addTitle: "admin.news.new",
      editTitle: "admin.edit",
      fields: [
        {
          key: "title",
          label: "admin.news.th.title",
          type: "text",
          placeholder: "Article title",
        },
        {
          key: "category",
          label: "admin.news.th.category",
          type: "select",
          options: ["announcement", "progress", "fundraising", "community"],
        },
        { key: "date", label: "admin.tbl.date", type: "date" },
        {
          key: "status",
          label: "admin.tbl.status",
          type: "status-pills",
          options: ["published", "draft"],
        },
        {
          key: "content",
          label: "admin.settings.description",
          type: "textarea",
        },
      ],
      buildRow: (v, id) => `
        <td>${v.title || ""}</td>
        <td>${v.category || ""}</td>
        <td>${v.date || ""}</td>
        <td><span class="status-badge ${v.status === "published" ? "approved" : "draft"}">${v.status || "draft"}</span></td>
        <td><div class="row-actions">
          <button class="icon-btn edit" data-edit="news" data-id="${id}" title="Edit">✏️</button>
          <button class="icon-btn danger" data-delete="news" data-id="${id}" title="Delete">🗑️</button>
        </div></td>`,
    },

    /* ---------- REPORTS (with file upload) ---------- */
    reports: {
      icon: "📁",
      addTitle: "admin.reports.upload",
      editTitle: "admin.edit",
      fields: [
        {
          key: "title",
          label: "admin.tbl.report",
          type: "text",
          placeholder: "e.g. Monthly Financial — Jan 2026",
        },
        {
          key: "type",
          label: "admin.reports.th.type",
          type: "select",
          options: ["financial", "progress", "audit", "quarterly"],
        },
        { key: "date", label: "admin.tbl.date", type: "date" },
        {
          key: "file",
          label: "admin.reports.file",
          type: "file",
          accept: ".pdf,.doc,.docx,.xls,.xlsx",
        },
        {
          key: "status",
          label: "admin.tbl.status",
          type: "status-pills",
          options: ["published", "draft"],
        },
      ],
      buildRow: (v, id) => `
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="width:32px;height:32px;border-radius:8px;background:#fdecec;color:#c0392b;display:grid;place-items:center;font-size:14px;font-weight:700;flex-shrink:0;">${getFileIcon(v.filename || "")}</span>
            <span>${v.title || ""}</span>
          </div>
        </td>
        <td>${v.type || ""}</td>
        <td>${v.date || ""}</td>
        <td>${v.size || "—"}</td>
        <td><span class="status-badge ${v.status === "published" ? "approved" : "draft"}">${v.status || "draft"}</span></td>
        <td><div class="row-actions">
          <button class="icon-btn view" data-view-file="${v.filename || ""}" title="View">👁️</button>
          <button class="icon-btn edit" data-edit="reports" data-id="${id}" title="Edit">✏️</button>
          <button class="icon-btn danger" data-delete="reports" data-id="${id}" title="Delete">🗑️</button>
        </div></td>`,
    },

    /* ---------- DONATIONS ---------- */
    donations: {
      icon: "💰",
      addTitle: "admin.donations.new",
      editTitle: "admin.edit",
      fields: [
        {
          key: "id",
          label: "admin.donations.th.id",
          type: "text",
          placeholder: "#1025",
        },
        {
          key: "donor",
          label: "admin.tbl.donor",
          type: "text",
          placeholder: "Donor name",
        },
        {
          key: "amount",
          label: "admin.tbl.amount",
          type: "text",
          placeholder: "50,000 ብር",
        },
        {
          key: "method",
          label: "admin.tbl.method",
          type: "select",
          options: ["CBE", "Awash", "Dashen", "Telebirr", "CBE Birr"],
        },
        { key: "date", label: "admin.tbl.date", type: "date" },
        {
          key: "status",
          label: "admin.tbl.status",
          type: "status-pills",
          options: ["approved", "pending", "review"],
        },
      ],
      buildRow: (v, id) => `
        <td>${v.id || ""}</td>
        <td>${v.donor || ""}</td>
        <td><strong>${v.amount || ""}</strong></td>
        <td>${v.method || ""}</td>
        <td>${v.date || ""}</td>
        <td><span class="status-badge ${v.status || "pending"}">${v.status || "pending"}</span></td>
        <td><div class="row-actions">
          <button class="icon-btn edit" data-edit="donations" data-id="${id}" title="Edit">✏️</button>
          <button class="icon-btn danger" data-delete="donations" data-id="${id}" title="Delete">🗑️</button>
        </div></td>`,
    },

    /* ---------- DONORS ---------- */
    donors: {
      icon: "👥",
      addTitle: "admin.donors.new",
      editTitle: "admin.edit",
      fields: [
        {
          key: "name",
          label: "admin.donors.th.name",
          type: "text",
          placeholder: "Full name",
        },
        {
          key: "email",
          label: "admin.users.th.email",
          type: "text",
          placeholder: "email@example.com",
        },
        {
          key: "phone",
          label: "admin.donors.th.phone",
          type: "text",
          placeholder: "+251 91 234 5678",
        },
        {
          key: "total",
          label: "admin.donors.th.total",
          type: "text",
          placeholder: "250,000 ብር",
        },
        {
          key: "count",
          label: "admin.donors.th.count",
          type: "text",
          placeholder: "5",
        },
        { key: "last", label: "admin.donors.th.last", type: "date" },
      ],
      buildRow: (v, id) => {
        const initials = (v.name || "NN")
          .split(" ")
          .map((s) => s[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return `
          <td><div class="user-cell"><div class="u-av">${initials}</div><div class="u-info"><strong>${v.name || ""}</strong><small>${v.email || ""}</small></div></div></td>
          <td>${v.phone || ""}</td>
          <td><strong>${v.total || ""}</strong></td>
          <td>${v.count || ""}</td>
          <td>${v.last || ""}</td>
          <td><div class="row-actions">
            <button class="icon-btn edit" data-edit="donors" data-id="${id}" title="Edit">✏️</button>
            <button class="icon-btn danger" data-delete="donors" data-id="${id}" title="Delete">🗑️</button>
          </div></td>`;
      },
    },

    /* ---------- USERS ---------- */
    users: {
      icon: "🔐",
      addTitle: "admin.users.new",
      editTitle: "admin.edit",
      fields: [
        {
          key: "name",
          label: "admin.users.th.user",
          type: "text",
          placeholder: "Full name",
        },
        {
          key: "email",
          label: "admin.users.th.email",
          type: "text",
          placeholder: "user@malkanono.org",
        },
        {
          key: "role",
          label: "admin.users.th.role",
          type: "select",
          options: ["admin", "editor", "viewer"],
        },
        { key: "last", label: "admin.users.th.last", type: "date" },
        {
          key: "status",
          label: "admin.tbl.status",
          type: "status-pills",
          options: ["active", "inactive"],
        },
      ],
      buildRow: (v, id) => {
        const initials = (v.name || "NN")
          .split(" ")
          .map((s) => s[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return `
          <td><div class="user-cell"><div class="u-av">${initials}</div><div class="u-info"><strong>${v.name || ""}</strong></div></div></td>
          <td>${v.email || ""}</td>
          <td><span class="role-badge ${v.role || "viewer"}">${v.role || "viewer"}</span></td>
          <td>${v.last || ""}</td>
          <td><span class="status-badge ${v.status === "active" ? "approved" : "draft"}">${v.status || "inactive"}</span></td>
          <td><div class="row-actions">
            <button class="icon-btn edit" data-edit="users" data-id="${id}" title="Edit">✏️</button>
            <button class="icon-btn danger" data-delete="users" data-id="${id}" title="Delete">🗑️</button>
          </div></td>`;
      },
    },
  };

  /* ============================================================
     8) MODAL SYSTEM
     ============================================================ */
  const modalOverlay = document.getElementById("modalOverlay");
  const modalBox = document.getElementById("modalBox");
  const modalBody = document.getElementById("modalBody");
  const modalTitleText = document.getElementById("modalTitleText");
  const modalFoot = document.getElementById("modalFoot");
  const modalSave = document.getElementById("modalSave");
  const modalCancel = document.getElementById("modalCancel");
  const modalClose = document.getElementById("modalClose");

  let currentModal = { type: null, mode: null, id: null };

  function closeModal() {
    modalOverlay.classList.remove("show");
    modalBox.classList.remove("confirm");
    currentModal = { type: null, mode: null, id: null };
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCancel) modalCancel.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("show"))
      closeModal();
  });

  /* ============================================================
     9) OPEN ADD MODAL
     ============================================================ */
  function openAddModal(type) {
    const cfg = formConfigs[type];
    if (!cfg) return;
    currentModal = { type, mode: "add", id: null };

    modalBox.classList.remove("confirm");
    modalTitleText.textContent = window.i18n.t(cfg.addTitle);
    modalSave.textContent = window.i18n.t("admin.modal.save");
    modalSave.className = "modal-btn primary";

    modalBody.innerHTML = cfg.fields.map((f) => renderField(f, "")).join("");
    modalOverlay.classList.add("show");

    setTimeout(() => {
      setupFileDropzones();
      setupStatusPills();
      const first = modalBody.querySelector(
        'input:not([type="file"]),select,textarea'
      );
      if (first) first.focus();
    }, 80);
  }

  /* ============================================================
     10) OPEN EDIT MODAL
     ============================================================ */
  function openEditModal(type, id) {
    const cfg = formConfigs[type];
    if (!cfg) return;
    const row = document.querySelector(`#view-${type} tr[data-id="${id}"]`);
    if (!row) return;

    const values = {};
    const cells = row.children;

    if (type === "reports") {
      const titleCell = row.querySelector("td:nth-child(1)");
      const titleSpan = titleCell
        ? titleCell.querySelector("span:last-child")
        : null;
      values.title = titleSpan ? titleSpan.textContent.trim() : "";
      values.type = cells[1]?.textContent.trim() || "";
      values.date = cells[2]?.textContent.trim() || "";
      values.size = cells[3]?.textContent.trim() || "";
      const badge = row.querySelector(".status-badge");
      values.status = badge ? badge.textContent.trim().toLowerCase() : "draft";
      const viewBtn = row.querySelector("[data-view-file]");
      values.file = viewBtn ? viewBtn.dataset.viewFile : "";
      values.filename = values.file;
    } else {
      cfg.fields.forEach((f, idx) => {
        const cell = cells[idx];
        if (cell) {
          const strong = cell.querySelector("strong");
          values[f.key] = (
            strong ? strong.textContent : cell.textContent
          ).trim();
        }
      });
    }

    currentModal = { type, mode: "edit", id };
    modalBox.classList.remove("confirm");
    modalTitleText.textContent = window.i18n.t(cfg.editTitle);
    modalSave.textContent = window.i18n.t("admin.modal.save");
    modalSave.className = "modal-btn primary";

    modalBody.innerHTML = cfg.fields
      .map((f) => renderField(f, values[f.key] || ""))
      .join("");
    modalOverlay.classList.add("show");

    setTimeout(() => {
      setupFileDropzones();
      setupStatusPills();

      if (type === "reports" && values.file) {
        const zone = modalBody.querySelector("[data-file-zone]");
        if (zone) {
          zone.dataset.fileName = values.file;
          zone.dataset.fileSize = values.size || "";
          const sizeDisplay = zone.querySelector(".fp-size-display strong");
          if (sizeDisplay) sizeDisplay.textContent = values.size || "—";
        }
      }
      const first = modalBody.querySelector(
        'input:not([type="file"]),select,textarea'
      );
      if (first) first.focus();
    }, 80);
  }

  /* ============================================================
     11) OPEN DELETE CONFIRM MODAL
     ============================================================ */
  function openDeleteModal(type, id) {
    currentModal = { type, mode: "delete", id };
    modalBox.classList.add("confirm");
    modalTitleText.textContent = window.i18n.t("admin.modal.delete.title");
    modalBody.innerHTML = `
      <div class="warn-icon">⚠</div>
      <h4>${window.i18n.t("admin.modal.delete.title")}</h4>
      <p>${window.i18n.t("admin.modal.delete.text")}</p>
    `;
    modalSave.textContent = window.i18n.t("admin.modal.delete.confirm");
    modalSave.className = "modal-btn danger";
    modalOverlay.classList.add("show");
  }

  /* ============================================================
     12) RENDER FIELD (dynamic form inputs)
     ============================================================ */
  function renderField(f, value) {
    const label = window.i18n.t(f.label);
    let inputHTML = "";

    if (f.type === "select") {
      inputHTML =
        `<select class="form-select" data-field="${f.key}">` +
        f.options
          .map(
            (o) =>
              `<option value="${o}" ${o === value ? "selected" : ""}>${o}</option>`
          )
          .join("") +
        `</select>`;
    } else if (f.type === "textarea") {
      inputHTML = `<textarea class="form-textarea" data-field="${f.key}" rows="3" placeholder="${f.placeholder || ""}">${value || ""}</textarea>`;
    } else if (f.type === "date") {
      let dateVal = value || "";
      if (dateVal && !/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          dateVal = d.toISOString().slice(0, 10);
        }
      }
      inputHTML = `<input class="form-input" type="date" data-field="${f.key}" value="${dateVal}" />`;
    } else if (f.type === "file") {
      const hasFile = !!value;
      const ext = hasFile ? (value.split(".").pop() || "").toLowerCase() : "";
      const iconClass =
        ext === "pdf"
          ? "pdf"
          : ext === "doc" || ext === "docx"
            ? "doc"
            : ext === "xls" || ext === "xlsx"
              ? "xls"
              : ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
                ? "img"
                : "file";

      if (hasFile) {
        inputHTML = `
          <div class="file-dropzone has-file" data-file-zone data-field="${f.key}">
            <input type="file" accept="${f.accept || "*"}" data-file-input />
            <div class="file-preview">
              <div class="fp-icon ${iconClass}">${getFileIcon(value)}</div>
              <div class="fp-info">
                <div class="fp-name">${value}</div>
                <div class="fp-meta"><span class="fp-size-display"><strong>—</strong></span><span>${ext.toUpperCase()}</span></div>
              </div>
              <button type="button" class="fp-remove" data-file-remove title="Remove">×</button>
            </div>
          </div>`;
      } else {
        inputHTML = `
          <div class="file-dropzone" data-file-zone data-field="${f.key}">
            <input type="file" accept="${f.accept || "*"}" data-file-input />
            <div class="dz-icon">📤</div>
            <div class="dz-title">${window.i18n.t("admin.reports.dropTitle")}</div>
            <div class="dz-hint">
              <span class="dz-browse">${window.i18n.t("admin.reports.browse")}</span>
              &nbsp;·&nbsp;${f.accept || "Any file"}
            </div>
          </div>`;
      }
    } else if (f.type === "status-pills") {
      inputHTML =
        `<div class="form-status-row" data-field="${f.key}">` +
        f.options
          .map(
            (o) => `
          <button type="button" class="status-pill ${o} ${o === (value || f.options[0]) ? "active" : ""}" data-pill="${o}">
            ${window.i18n.t("admin.status." + o) || o}
          </button>`
          )
          .join("") +
        `<input type="hidden" data-status-value value="${value || f.options[0]}" />` +
        `</div>`;
    } else {
      inputHTML = `<input class="form-input" type="text" data-field="${f.key}" 
                    placeholder="${f.placeholder || ""}" 
                    value="${String(value || "").replace(/"/g, "&quot;")}" />`;
    }

    return `<div class="form-group"><label class="form-label">${label}</label>${inputHTML}</div>`;
  }

  /* ============================================================
     13) FILE DROPZONE
     ============================================================ */
  function setupFileDropzones() {
    document.querySelectorAll("[data-file-zone]").forEach((zone) => {
      const input = zone.querySelector("[data-file-input]");
      const removeBtn = zone.querySelector("[data-file-remove]");

      ["dragenter", "dragover"].forEach((evt) => {
        zone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          zone.classList.add("dragover");
        });
      });
      ["dragleave", "drop"].forEach((evt) => {
        zone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          zone.classList.remove("dragover");
        });
      });

      zone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length && input) {
          try {
            input.files = files;
          } catch (err) {
            /* ignore */
          }
          handleFileSelected(zone, files[0]);
        }
      });

      if (input) {
        input.addEventListener("change", () => {
          if (input.files && input.files.length) {
            handleFileSelected(zone, input.files[0]);
          }
        });
      }

      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          const fieldKey = zone.dataset.field;
          const acceptAttr = ".pdf,.doc,.docx,.xls,.xlsx";
          zone.classList.remove("has-file");
          zone.dataset.fileName = "";
          zone.dataset.fileSize = "";
          zone.innerHTML = `
            <input type="file" accept="${acceptAttr}" data-file-input />
            <div class="dz-icon">📤</div>
            <div class="dz-title">${window.i18n.t("admin.reports.dropTitle")}</div>
            <div class="dz-hint">
              <span class="dz-browse">${window.i18n.t("admin.reports.browse")}</span>
              &nbsp;·&nbsp;${acceptAttr}
            </div>
          `;
          setupFileDropzones();
        });
      }
    });
  }

  function handleFileSelected(zone, file) {
    const sizeStr = formatFileSize(file.size);
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const iconClass =
      ext === "pdf"
        ? "pdf"
        : ext === "doc" || ext === "docx"
          ? "doc"
          : ext === "xls" || ext === "xlsx"
            ? "xls"
            : ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
              ? "img"
              : "file";

    zone.dataset.fileName = file.name;
    zone.dataset.fileSize = sizeStr;
    zone.classList.add("has-file");

    zone.innerHTML = `
      <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" data-file-input />
      <div class="file-preview">
        <div class="fp-icon ${iconClass}">${getFileIcon(file.name)}</div>
        <div class="fp-info">
          <div class="fp-name">${file.name}</div>
          <div class="fp-meta"><span><strong>${sizeStr}</strong></span><span>${ext.toUpperCase()}</span></div>
        </div>
        <button type="button" class="fp-remove" data-file-remove title="Remove">×</button>
      </div>
    `;
    setupFileDropzones();
  }

  /* ============================================================
     14) STATUS PILLS
     ============================================================ */
  function setupStatusPills() {
    document.querySelectorAll(".form-status-row").forEach((container) => {
      const pills = container.querySelectorAll(".status-pill");
      const hidden = container.querySelector("[data-status-value]");
      pills.forEach((pill) => {
        pill.addEventListener("click", () => {
          pills.forEach((p) => p.classList.remove("active"));
          pill.classList.add("active");
          if (hidden) hidden.value = pill.dataset.pill;
        });
      });
    });
  }

  /* ============================================================
     15) SAVE
     ============================================================ */
  if (modalSave) {
    modalSave.addEventListener("click", () => {
      if (!currentModal.type) return;
      if (currentModal.mode === "delete") {
        performDelete();
      } else {
        performSave();
      }
    });
  }

  function performSave() {
    const { type, mode, id } = currentModal;
    const cfg = formConfigs[type];
    const values = {};

    modalBody.querySelectorAll("[data-field]").forEach((el) => {
      if (el.hasAttribute("data-file-zone")) {
        values.filename = el.dataset.fileName || "";
        values.size = el.dataset.fileSize || "";
        return;
      }
      if (el.classList.contains("form-status-row")) {
        const hidden = el.querySelector("[data-status-value]");
        values[el.dataset.field] = hidden ? hidden.value : "";
        return;
      }
      values[el.dataset.field] = el.value.trim();
    });

    if (type === "reports" && mode === "add" && !values.filename) {
      showToast(
        window.i18n.t("admin.reports.fileRequired") ||
          "Please select a file to upload",
        "error"
      );
      return;
    }

    const tbody = document.querySelector(
      `#view-${type} table[data-table="${type}"] tbody`
    );
    if (!tbody) return;

    if (mode === "add") {
      const newId = "new_" + Date.now();
      const tr = document.createElement("tr");
      tr.setAttribute("data-id", newId);
      tr.innerHTML = cfg.buildRow(values, newId);
      tbody.insertBefore(tr, tbody.firstChild);
      showToast(window.i18n.t("admin.toast.added"), "success");
    } else {
      const row = tbody.querySelector(`tr[data-id="${id}"]`);
      if (row) {
        row.innerHTML = cfg.buildRow(values, id);
        showToast(window.i18n.t("admin.toast.saved"), "success");
      }
    }
    closeModal();
  }

  /* ============================================================
     16) DELETE
     ============================================================ */
  function performDelete() {
    const { type, id } = currentModal;
    const row = document.querySelector(`#view-${type} tr[data-id="${id}"]`);
    if (row) {
      row.style.transition = "opacity .3s, transform .3s";
      row.style.opacity = "0";
      row.style.transform = "translateX(-20px)";
      setTimeout(() => {
        row.remove();
        showToast(window.i18n.t("admin.toast.deleted"), "error");
      }, 300);
    }
    closeModal();
  }

  /* ============================================================
     17) EVENT DELEGATION
     ============================================================ */
  document.addEventListener("click", (e) => {
    // View file
    const viewFileBtn = e.target.closest("[data-view-file]");
    if (viewFileBtn) {
      const filename = viewFileBtn.dataset.viewFile;
      if (filename) {
        showToast("📄 " + filename + " — Opening...", "info");
      } else {
        showToast("No file attached", "warn");
      }
      return;
    }

    // Edit
    const editBtn = e.target.closest("[data-edit]");
    if (editBtn) {
      const type = editBtn.dataset.edit;
      const row = editBtn.closest("tr[data-id]");
      if (row) openEditModal(type, row.dataset.id);
      return;
    }

    // Delete
    const delBtn = e.target.closest("[data-delete]");
    if (delBtn) {
      const type = delBtn.dataset.delete;
      if (type === "messages") {
        const card = delBtn.closest(".message-card");
        if (card) {
          card.style.transition = "opacity .3s";
          card.style.opacity = "0";
          setTimeout(() => {
            card.remove();
            showToast(window.i18n.t("admin.toast.deleted"), "error");
          }, 300);
        }
        return;
      }
      const row = delBtn.closest("tr[data-id]");
      if (row) openDeleteModal(type, row.dataset.id);
      return;
    }

    // Mark message as read
    const markBtn = e.target.closest('[data-mark="read"]');
    if (markBtn) {
      const card = markBtn.closest(".message-card");
      if (card) {
        card.classList.remove("unread");
        showToast("Marked as read", "info");
      }
      return;
    }

    // Add buttons
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      e.preventDefault();
      openAddModal(addBtn.dataset.add);
      return;
    }
  });

  /* ============================================================
     18) PANEL FILTER TABS
     ============================================================ */
  document.querySelectorAll(".panel-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const parent = tab.closest(".admin-panel");
      if (parent) {
        parent
          .querySelectorAll(".panel-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
      }
      showToast("Filter applied: " + tab.textContent.trim(), "info");
    });
  });

  /* ============================================================
     19) TOP EXPORT BUTTON
     ============================================================ */
  const topExportBtn = document.getElementById("topExportBtn");
  if (topExportBtn) {
    topExportBtn.addEventListener("click", () => {
      showToast(window.i18n.t("admin.toast.exported"), "success");
    });
  }

  /* ============================================================
     20) LEADERSHIP WIDGET (Dashboard)
     ============================================================ */
  function renderLeadershipWidget() {
    const widget = document.getElementById("leadershipWidget");
    if (!widget) return;

    const leaders = [
      { key: "p1", initials: "AM", color: "green" },
      { key: "p2", initials: "YA", color: "gold" },
      { key: "p3", initials: "HN", color: "blue" },
    ];

    const sectors = [
      { key: "c1", icon: "📖" },
      { key: "c2", icon: "💰" },
      { key: "c3", icon: "🕌" },
      { key: "c4", icon: "📚" },
      { key: "c5", icon: "📢" },
      { key: "c6", icon: "👩" },
    ];

    const leadersHTML = leaders
      .map(
        (l) => `
      <div class="ldr-card">
        <div class="ldr-av ${l.color}">${l.initials}</div>
        <div class="ldr-info">
          <div class="ldr-name">${window.i18n.t("leadership." + l.key + ".name")}</div>
          <div class="ldr-role">${window.i18n.t("leadership." + l.key + ".role")}</div>
        </div>
      </div>
    `
      )
      .join("");

    const sectorsHTML = sectors
      .map(
        (s) => `
      <div class="ldr-sector">
        <span class="ldr-sector-icon">${s.icon}</span>
        <span class="ldr-sector-name">${window.i18n.t("leadership.exec." + s.key + ".title")}</span>
      </div>
    `
      )
      .join("");

    widget.innerHTML = `
      <div class="ldr-section">
        <div class="ldr-section-title">${window.i18n.t("admin.dashboard.leadership.top")}</div>
        <div class="ldr-grid">${leadersHTML}</div>
      </div>
      <div class="ldr-section" style="margin-top:20px;">
        <div class="ldr-section-title">${window.i18n.t("admin.dashboard.leadership.sectors")}</div>
        <div class="ldr-sectors">${sectorsHTML}</div>
      </div>
    `;
  }

  // Re-render widget when language changes
  window.addEventListener("langchange", renderLeadershipWidget);

  /* ============================================================
     21) LANGUAGE SWITCHERS
     ============================================================ */
  function attachLangSwitcher(switcherId, btnId) {
    const switcher = document.getElementById(switcherId);
    const btn = document.getElementById(btnId);
    if (!switcher || !btn) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".lang-switcher.open").forEach((s) => {
        if (s !== switcher) s.classList.remove("open");
      });
      switcher.classList.toggle("open");
    });

    switcher.querySelectorAll(".lang-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        if (window.i18n) window.i18n.setLanguage(opt.dataset.lang);
        switcher.classList.remove("open");

        // Refresh dynamic topbar labels
        const activeNav = document.querySelector("#adminNav a.active");
        if (activeNav) {
          const meta = viewMeta[activeNav.dataset.view];
          if (meta) {
            viewTitle.textContent = window.i18n.t(meta.title);
            viewSubtitle.textContent = window.i18n.t(meta.subtitle);
            if (meta.add && topAddBtn) {
              topAddBtn.innerHTML =
                "+ <span>" + window.i18n.t(meta.addLabel) + "</span>";
            }
          }
        }
        // Re-render leadership widget with new language
        renderLeadershipWidget();
      });
    });
  }

  attachLangSwitcher("langSwitcherLogin", "langBtnLogin");
  attachLangSwitcher("langSwitcherAdmin", "langBtnAdmin");

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".lang-switcher.open")
      .forEach((s) => s.classList.remove("open"));
  });

  window.addEventListener("langchange", (e) => {
    document.querySelectorAll(".lang-current").forEach((el) => {
      el.textContent = (e.detail.lang || "am").toUpperCase();
    });
  });

  // Sync initial language label
  setTimeout(() => {
    const lang =
      window.i18n && window.i18n.getLang ? window.i18n.getLang() : "am";
    document.querySelectorAll(".lang-current").forEach((el) => {
      el.textContent = lang.toUpperCase();
    });
  }, 50);

  /* ============================================================
     22) INITIAL VIEW
     ============================================================ */
  if (adminApp && adminApp.classList.contains("active")) {
    switchView("dashboard");
    renderLeadershipWidget();
  }

  // Expose for debugging
  window.adminPanel = {
    switchView,
    openAddModal,
    openEditModal,
    openDeleteModal,
    showToast,
    renderLeadershipWidget,
  };
})();