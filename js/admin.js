/* ============================================================
   ADMIN PANEL — Full JavaScript
   Malka Nono Islamic Affairs Council Project
   ------------------------------------------------------------
   Features:
   - Login system (session-based)
   - 8 working views
   - Full CRUD: Add / Edit / Delete with modals
   - Drag & Drop file upload for reports
   - Toast notifications
   - Language switcher (EN / AM / OM / AR)
   - Leadership widget + Manager (with photo upload)
   - localStorage persistence for leadership data
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
    setTimeout(() => {
      renderLeadershipWidget();
      renderLeadershipManager();
    }, 120);
  }

  /* ============================================================
     2) VIEW METADATA
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
      l.classList.toggle("active", l.dataset.view === viewId),
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
     4) NAV LINK CLICKS
     ============================================================ */
  navLinks.forEach((link) => {
    if (link.hasAttribute("data-external") || !link.dataset.view) return;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchView(link.dataset.view);
    });
  });

  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      switchView(el.dataset.goto);
    });
  });

  document.querySelectorAll(".quick-action[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => openAddModal(btn.dataset.add));
  });

  document.querySelectorAll(".quick-action[data-export]").forEach((btn) => {
    btn.addEventListener("click", () =>
      showToast(window.i18n.t("admin.toast.exported"), "success"),
    );
  });

  /* ============================================================
     5) TOAST
     ============================================================ */
  window.showToast = showToast;
  function showToast(msg, type = "success") {
    const c = document.getElementById("toastContainer");
    if (!c) return;
    const icons = { success: "✓", error: "✕", info: "ℹ", warn: "⚠" };
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.innerHTML =
      '<div class="ti">' +
      (icons[type] || "✓") +
      "</div><div>" +
      msg +
      "</div>";
    c.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("out");
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  /* ============================================================
     6) HELPERS
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
     7) FORM CONFIGS
     ============================================================ */
  const formConfigs = {
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
        'input:not([type="file"]),select,textarea',
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
        'input:not([type="file"]),select,textarea',
      );
      if (first) first.focus();
    }, 80);
  }

  /* ============================================================
     11) DELETE MODAL
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
     12) RENDER FIELD
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
              `<option value="${o}" ${o === value ? "selected" : ""}>${o}</option>`,
          )
          .join("") +
        `</select>`;
    } else if (f.type === "textarea") {
      inputHTML = `<textarea class="form-textarea" data-field="${f.key}" rows="3" placeholder="${f.placeholder || ""}">${value || ""}</textarea>`;
    } else if (f.type === "date") {
      let dateVal = value || "";
      if (dateVal && !/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) dateVal = d.toISOString().slice(0, 10);
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
          </button>`,
          )
          .join("") +
        `<input type="hidden" data-status-value value="${value || f.options[0]}" /></div>`;
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
          if (input.files && input.files.length)
            handleFileSelected(zone, input.files[0]);
        });
      }

      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
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
            </div>`;
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
      </div>`;
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
     15) SAVE (generic)
     ============================================================ */
  if (modalSave) {
    modalSave.addEventListener("click", () => {
      if (!currentModal.type) return;
      if (currentModal.type.startsWith("leader-")) {
        if (currentModal.mode === "delete") deleteLeader(currentModal.id);
        else saveLeader();
        return;
      }
      if (currentModal.mode === "delete") performDelete();
      else performSave();
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
        "error",
      );
      return;
    }

    const tbody = document.querySelector(
      `#view-${type} table[data-table="${type}"] tbody`,
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
     16) EVENT DELEGATION
     ============================================================ */
  document.addEventListener("click", (e) => {
    const viewFileBtn = e.target.closest("[data-view-file]");
    if (viewFileBtn) {
      const filename = viewFileBtn.dataset.viewFile;
      if (filename) showToast("📄 " + filename + " — Opening...", "info");
      else showToast("No file attached", "warn");
      return;
    }

    const editBtn = e.target.closest("[data-edit]");
    if (editBtn) {
      const type = editBtn.dataset.edit;
      const row = editBtn.closest("tr[data-id]");
      if (row) openEditModal(type, row.dataset.id);
      return;
    }

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

    const markBtn = e.target.closest('[data-mark="read"]');
    if (markBtn) {
      const card = markBtn.closest(".message-card");
      if (card) {
        card.classList.remove("unread");
        showToast("Marked as read", "info");
      }
      return;
    }

    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      e.preventDefault();
      openAddModal(addBtn.dataset.add);
      return;
    }
  });

  /* ============================================================
     17) PANEL FILTER TABS
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
     18) TOP EXPORT BUTTON
     ============================================================ */
  const topExportBtn = document.getElementById("topExportBtn");
  if (topExportBtn) {
    topExportBtn.addEventListener("click", () => {
      showToast(window.i18n.t("admin.toast.exported"), "success");
    });
  }

  /* ============================================================
     19) LEADERSHIP DATA STORE
     ============================================================ */
  const LDR_STORAGE = "malka-nono-leadership";

  function loadLeadership() {
    try {
      const saved = localStorage.getItem(LDR_STORAGE);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      /* ignore */
    }
    return null;
  }

  function saveLeadership(data) {
    try {
      localStorage.setItem(LDR_STORAGE, JSON.stringify(data));
    } catch (err) {
      /* ignore */
    }
  }

  function getDefaultLeadership() {
    return {
      top: [
        {
          id: "p1",
          color: "green",
          type: "top",
          initials: "AM",
          name_en: "Sheikh Abdurrahman Muhammad",
          name_am: "ሼክ አብዱራህማን መሐመድ",
          name_om: "Sheekh Abdurrahmaan Muhammad",
          name_ar: "الشيخ عبد الرحمن محمد",
          role_en: "Head of Council",
          role_am: "የምክር ቤቱ ኃላፊ",
          role_om: "Hoji-guddaa Mana Maree",
          role_ar: "رئيس المجلس",
          bio_en:
            "Leading the Council with years of experience in community service and religious leadership.",
          bio_am: "ምክር ቤቱን በማህበረሰብ አገልግሎትና በሃይማኖታዊ አመራር ልምድ የሚመራ።",
          bio_om:
            "Mana Maree muuxannoo tajaajila hawaasaa fi hoggansa amantii waggaa hedduu qabuun geggeessa.",
          bio_ar: "يقود المجلس بخبرة سنوات في خدمة المجتمع والقيادة الدينية.",
          icon: "👤",
          photo: "",
        },
        {
          id: "p2",
          color: "gold",
          type: "top",
          initials: "YA",
          name_en: "Sheikh Yusuf Ahmad",
          name_am: "ሼክ ዩሱፍ አህመድ",
          name_om: "Sheekh Yuusuf Ahmad",
          name_ar: "الشيخ يوسف أحمد",
          role_en: "Deputy Head",
          role_am: "ምክትል ኃላፊ",
          role_om: "Itti Aanaa Hoji-guddaa",
          role_ar: "نائب الرئيس",
          bio_en:
            "Supports the Head of Council and oversees coordination across the three districts.",
          bio_am: "የምክር ቤቱን ኃላፊ የሚደግፍና በ3 ወረዳዎች ውስጥ ቅንጅትን የሚቆጣጠር።",
          bio_om:
            "Hoji-guddaa Mana Maree deeggara, aanaalee sadan keessatti qindeessummaa to'ata.",
          bio_ar: "يدعم رئيس المجلس ويشرف على التنسيق في المناطق الثلاث.",
          icon: "👤",
          photo: "",
        },
        {
          id: "p3",
          color: "blue",
          type: "top",
          initials: "HN",
          name_en: "Mr. Hussein Nuradin",
          name_am: "አቶ ሁሴን ኑራዲን",
          name_om: "Obbo Huseen Nuuradiin",
          name_ar: "السيد حسين نور الدين",
          role_en: "Secretary General",
          role_am: "ዋና ጸሐፊ",
          role_om: "Barreessaa Ol-aanaa",
          role_ar: "الأمين العام",
          bio_en:
            "Responsible for documentation, records, and internal communication.",
          bio_am: "ሰነዶችን፣ መዝገቦችንና የውስጥ ግንኙነትን የሚያስተዳድር።",
          bio_om: "Sanada, galmee fi walqunnamtii keessoo bulcha.",
          bio_ar: "مسؤول عن التوثيق والسجلات والاتصالات الداخلية.",
          icon: "👤",
          photo: "",
        },
      ],
      sectors: [
        {
          id: "s1",
          icon: "📖",
          type: "sector",
          name_en: "Council of Scholars",
          name_am: "የዐሊማዎች ጉባኤ",
          name_om: "Gumii Ulamaa",
          name_ar: "مجلس العلماء",
          lead_en: "Sheikh Jamal Yasin",
          lead_am: "ሼክ ጃማል ያሲን",
          lead_om: "Sheekh Jamaal Yaasiin",
          lead_ar: "الشيخ جمال ياسين",
          photo: "",
        },
        {
          id: "s2",
          icon: "💰",
          type: "sector",
          name_en: "Finance Sector",
          name_am: "የፋይናንስ ዘርፍ",
          name_om: "Seektara Faayinaansii",
          name_ar: "قطاع المالية",
          lead_en: "Mr. Sukkar Khadir",
          lead_am: "አቶ ሱካር ኻዲር",
          lead_om: "Obbo Sukkaar Khadir",
          lead_ar: "السيد سكار خضر",
          photo: "",
        },
        {
          id: "s3",
          icon: "🕌",
          type: "sector",
          name_en: "Mosques & Awqaf Sector",
          name_am: "የመስጊዶችና የአውቃፍ ዘርፍ",
          name_om: "Seektara Masjiidotaa fi Awqaafaa",
          name_ar: "قطاع المساجد والأوقاف",
          lead_en: "Sheikh Abdurrahman Hajji",
          lead_am: "ሼክ አብዱራህማን ሐጂ",
          lead_om: "Sheekh Abdurrahmaan Hajjii",
          lead_ar: "الشيخ عبد الرحمن حاجي",
          photo: "",
        },
        {
          id: "s4",
          icon: "📚",
          type: "sector",
          name_en: "Madrasa & Education Quality Sector",
          name_am: "የመድረሳና የትምህርት ጥራት ዘርፍ",
          name_om: "Seektara Madrasaa fi Qulqullina Barnootaa",
          name_ar: "قطاع المدرسة وجودة التعليم",
          lead_en: "Sheikh Abdulkarim Tamam",
          lead_am: "ሼክ አብዱልካሪም ተማም",
          lead_om: "Sheekh Abdulkariim Tamaam",
          lead_ar: "الشيخ عبد الكريم تمام",
          photo: "",
        },
        {
          id: "s5",
          icon: "📢",
          type: "sector",
          name_en: "Communications & Media Sector",
          name_am: "የድርግግና ሚዲያ ዘርፍ",
          name_om: "Seektara Drgaggoo fi Miidyaa",
          name_ar: "قطاع الاتصالات والإعلام",
          lead_en: "Mr. Muhammad Yunus",
          lead_am: "አቶ መሐመድ ዩኑስ",
          lead_om: "Obbo Muhaammad Yuunus",
          lead_ar: "السيد محمد يونس",
          photo: "",
        },
        {
          id: "s6",
          icon: "👩",
          type: "sector",
          name_en: "Women's Sector",
          name_am: "የሴቶች ጉዳይ ዘርፍ",
          name_om: "Seektara Dubartootaa",
          name_ar: "قطاع المرأة",
          lead_en: "Mrs. Hawwa Ismail",
          lead_am: "ወ/ሮ ሃዋ ኢስማዒል",
          lead_om: "Aadde Hawwaa Ismaa'il",
          lead_ar: "السيدة حواء إسماعيل",
          photo: "",
        },
      ],
    };
  }

  function getLeadershipData() {
    return loadLeadership() || getDefaultLeadership();
  }

  /* ============================================================
     20) LEADERSHIP WIDGET (read-only, dashboard)
     ============================================================ */
  function renderLeadershipWidget() {
    const widget = document.getElementById("leadershipWidget");
    if (!widget) return;

    const data = getLeadershipData();
    const lang =
      window.i18n && window.i18n.getLang ? window.i18n.getLang() : "en";
    const getName = (item, prefix) =>
      item[`${prefix}_${lang}`] || item[`${prefix}_en`] || "";

    const leadersHTML = data.top
      .map(
        (l) => `
      <div class="ldr-card">
        <div class="ldr-av ${l.color || "green"}" style="${l.photo ? "padding:0;overflow:hidden;" : ""}">
          ${l.photo ? `<img src="${l.photo}" alt="${getName(l, "name")}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />` : l.initials || "??"}
        </div>
        <div class="ldr-info">
          <div class="ldr-name">${getName(l, "name")}</div>
          <div class="ldr-role">${getName(l, "role")}</div>
        </div>
      </div>
    `,
      )
      .join("");

    const sectorsHTML = data.sectors
      .map(
        (s) => `
      <div class="ldr-sector">
        <span class="ldr-sector-icon">${s.icon || "👤"}</span>
        <span class="ldr-sector-name">${getName(s, "name")} — ${getName(s, "lead")}</span>
      </div>
    `,
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

  /* ============================================================
     21) LEADERSHIP MANAGER (editable, dashboard)
     ============================================================ */
  function renderLeadershipManager() {
    const container = document.getElementById("leadershipManager");
    if (!container) return;

    const data = getLeadershipData();
    const lang =
      window.i18n && window.i18n.getLang ? window.i18n.getLang() : "en";
    const getName = (item, prefix) =>
      item[`${prefix}_${lang}`] || item[`${prefix}_en`] || "";

    const topHTML = data.top
      .map(
        (l) => `
      <div class="ldr-manager-card" data-ldr-id="${l.id}">
        <div class="ldr-manager-av ${l.color || "green"}">
          ${l.photo ? `<img src="${l.photo}" alt="${getName(l, "name")}" />` : l.initials || "??"}
        </div>
        <div class="ldr-manager-info">
          <div class="ldr-manager-name">${getName(l, "name")}</div>
          <div class="ldr-manager-role">${getName(l, "role")}</div>
        </div>
        <div class="ldr-manager-actions">
          <button class="icon-btn edit" data-ldr-edit="${l.id}" title="Edit">✏️</button>
          <button class="icon-btn danger" data-ldr-delete="${l.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `,
      )
      .join("");

    const sectorsHTML = data.sectors
      .map(
        (s) => `
      <div class="ldr-manager-card" data-ldr-id="${s.id}">
        <div class="ldr-manager-av" style="background:linear-gradient(135deg,var(--gd600),var(--gd400));">
          ${s.photo ? `<img src="${s.photo}" alt="${getName(s, "name")}" />` : s.icon || "👤"}
        </div>
        <div class="ldr-manager-info">
          <div class="ldr-manager-name">${getName(s, "name")}</div>
          <div class="ldr-manager-role">${getName(s, "lead")}</div>
        </div>
        <div class="ldr-manager-actions">
          <button class="icon-btn edit" data-ldr-edit="${s.id}" title="Edit">✏️</button>
          <button class="icon-btn danger" data-ldr-delete="${s.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `,
      )
      .join("");

    container.innerHTML = `
      <div class="ldr-section">
        <div class="ldr-section-title">${window.i18n.t("admin.dashboard.leadership.top")}</div>
        <div class="ldr-manager">${topHTML}</div>
      </div>
      <div class="ldr-section" style="margin-top:24px;">
        <div class="ldr-section-title">${window.i18n.t("admin.dashboard.leadership.sectors")}</div>
        <div class="ldr-manager">${sectorsHTML}</div>
      </div>
    `;
  }

  /* ---------- Leader edit modal ---------- */
  function openLeaderModal(mode, id) {
    const data = getLeadershipData();
    const inTop = id ? data.top.find((x) => x.id === id) : null;
    const inSector = id ? data.sectors.find((x) => x.id === id) : null;
    const leader = inTop || inSector || null;
    const type = inSector ? "sector" : "top";

    currentModal = { type: "leader-" + type, mode: mode, id: id || null };
    modalBox.classList.remove("confirm");
    modalTitleText.textContent =
      mode === "edit"
        ? window.i18n.t("admin.leadership.edit")
        : window.i18n.t("admin.leadership.add");
    modalSave.textContent = window.i18n.t("admin.modal.save");
    modalSave.className = "modal-btn primary";

    const photo = leader?.photo || "";
    const initials = leader?.initials || "??";

    modalBody.innerHTML = `
      <div class="form-group">
        <label class="form-label">${window.i18n.t("admin.leadership.photo")}</label>
        <div class="photo-upload" data-photo-zone>
          <input type="file" accept="image/*" data-photo-input />
          <div class="photo-preview" data-photo-preview>
            ${photo ? `<img src="${photo}" alt="preview" />` : initials}
          </div>
          <div class="photo-info">
            <strong>${window.i18n.t("admin.leadership.uploadPhoto")}</strong>
            <small>${window.i18n.t("admin.leadership.photoHint")}</small>
          </div>
        </div>
        <input type="hidden" data-field="photo" value="${photo}" />
      </div>

      <div class="form-group">
        <label class="form-label">${window.i18n.t("admin.leadership.name")} (EN)</label>
        <input class="form-input" type="text" data-field="name_en" value="${(leader?.name_en || "").replace(/"/g, "&quot;")}" />
      </div>
      <div class="form-group">
        <label class="form-label">${window.i18n.t("admin.leadership.name")} (አማ)</label>
        <input class="form-input" type="text" data-field="name_am" value="${(leader?.name_am || "").replace(/"/g, "&quot;")}" />
      </div>

      <div class="form-group">
        <label class="form-label">${window.i18n.t("admin.leadership.role")} (EN)</label>
        <input class="form-input" type="text" data-field="role_en" value="${(leader?.role_en || "").replace(/"/g, "&quot;")}" />
      </div>
      <div class="form-group">
        <label class="form-label">${window.i18n.t("admin.leadership.role")} (አማ)</label>
        <input class="form-input" type="text" data-field="role_am" value="${(leader?.role_am || "").replace(/"/g, "&quot;")}" />
      </div>

      <div class="form-group">
        <label class="form-label">${window.i18n.t("admin.leadership.bio")} (EN)</label>
        <textarea class="form-textarea" data-field="bio_en" rows="2">${leader?.bio_en || ""}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">${window.i18n.t("admin.leadership.bio")} (አማ)</label>
        <textarea class="form-textarea" data-field="bio_am" rows="2">${leader?.bio_am || ""}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">${window.i18n.t("admin.leadership.initials")}</label>
        <input class="form-input" type="text" maxlength="2" data-field="initials" value="${leader?.initials || ""}" />
      </div>

      <div class="form-group">
        <label class="form-label">${window.i18n.t("admin.leadership.icon")}</label>
        <input class="form-input" type="text" maxlength="4" data-field="icon" value="${leader?.icon || ""}" />
      </div>
    `;

    modalOverlay.classList.add("show");
    setTimeout(() => {
      setupPhotoUpload();
      const first = modalBody.querySelector('input[type="text"]');
      if (first) first.focus();
    }, 80);
  }

  function setupPhotoUpload() {
    const zone = modalBody.querySelector("[data-photo-zone]");
    if (!zone) return;
    const input = zone.querySelector("[data-photo-input]");
    const preview = zone.querySelector("[data-photo-preview]");
    const hidden = modalBody.querySelector('[data-field="photo"]');

    if (!input) return;
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" alt="preview" />`;
        if (hidden) hidden.value = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function saveLeader() {
    const { type, mode, id } = currentModal;
    const isSector = type === "leader-sector";
    const values = {};
    modalBody.querySelectorAll("[data-field]").forEach((el) => {
      values[el.dataset.field] = el.value.trim();
    });

    const data = getLeadershipData();
    const list = isSector ? data.sectors : data.top;

    if (mode === "add") {
      const newId = "ldr_" + Date.now();
      const colorPool = ["green", "gold", "blue", "purple"];
      const newItem = {
        id: newId,
        type: isSector ? "sector" : "top",
        initials: values.initials || "??",
        color: isSector ? null : colorPool[list.length % colorPool.length],
        icon: values.icon || "👤",
        name_en: values.name_en || "",
        name_am: values.name_am || values.name_en || "",
        name_om: values.name_en || "",
        name_ar: values.name_en || "",
        role_en: values.role_en || "",
        role_am: values.role_am || values.role_en || "",
        role_om: values.role_en || "",
        role_ar: values.role_en || "",
        bio_en: values.bio_en || "",
        bio_am: values.bio_am || values.bio_en || "",
        bio_om: values.bio_en || "",
        bio_ar: values.bio_en || "",
        lead_en: values.role_en || "",
        lead_am: values.role_am || values.role_en || "",
        lead_om: values.role_en || "",
        lead_ar: values.role_en || "",
        photo: values.photo || "",
      };
      list.push(newItem);
      showToast(window.i18n.t("admin.toast.added"), "success");
    } else {
      const item = list.find((x) => x.id === id);
      if (item) {
        item.name_en = values.name_en || item.name_en;
        item.name_am = values.name_am || item.name_am;
        item.role_en = values.role_en || item.role_en;
        item.role_am = values.role_am || item.role_am;
        item.bio_en = values.bio_en || item.bio_en;
        item.bio_am = values.bio_am || item.bio_am;
        item.initials = values.initials || item.initials;
        item.icon = values.icon || item.icon;
        item.photo = values.photo !== undefined ? values.photo : item.photo;
        item.lead_en = values.role_en || item.lead_en;
        item.lead_am = values.role_am || item.lead_am;
        showToast(window.i18n.t("admin.toast.saved"), "success");
      }
    }

    saveLeadership(data);
    renderLeadershipManager();
    renderLeadershipWidget();
    closeModal();
  }

  function deleteLeader(id) {
    const data = getLeadershipData();
    let removed = false;

    const topIdx = data.top.findIndex((x) => x.id === id);
    if (topIdx !== -1) {
      data.top.splice(topIdx, 1);
      removed = true;
    }
    const secIdx = data.sectors.findIndex((x) => x.id === id);
    if (secIdx !== -1) {
      data.sectors.splice(secIdx, 1);
      removed = true;
    }

    if (removed) {
      saveLeadership(data);
      renderLeadershipManager();
      renderLeadershipWidget();
      showToast(window.i18n.t("admin.toast.deleted"), "error");
    }
    closeModal();
  }

  /* ---------- Leadership Manager event handlers ---------- */
  document.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-ldr-edit]");
    if (editBtn) {
      e.preventDefault();
      openLeaderModal("edit", editBtn.dataset.ldrEdit);
      return;
    }
    const delBtn = e.target.closest("[data-ldr-delete]");
    if (delBtn) {
      e.preventDefault();
      const id = delBtn.dataset.ldrDelete;
      currentModal = { type: "leader-delete", mode: "delete", id };
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
      return;
    }
    const addBtn = e.target.closest("[data-ldr-add]");
    if (addBtn) {
      e.preventDefault();
      openLeaderModal("add", null);
      return;
    }
  });

  /* ============================================================
     22) LANGUAGE SWITCHERS
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
        renderLeadershipWidget();
        renderLeadershipManager();
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
    renderLeadershipWidget();
    renderLeadershipManager();
  });

  setTimeout(() => {
    const lang =
      window.i18n && window.i18n.getLang ? window.i18n.getLang() : "am";
    document.querySelectorAll(".lang-current").forEach((el) => {
      el.textContent = lang.toUpperCase();
    });
  }, 50);

  /* ============================================================
     23) INITIAL VIEW
     ============================================================ */
  if (adminApp && adminApp.classList.contains("active")) {
    switchView("dashboard");
    renderLeadershipWidget();
    renderLeadershipManager();
  }
  /* ============================================================
     24) STICKY TOPBAR — shadow on scroll
     ============================================================ */
  (function () {
    const topbar = document.querySelector(".admin-topbar");
    if (!topbar) return;

    const updateShadow = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      topbar.classList.toggle("scrolled", scrollTop > 20);
    };

    window.addEventListener("scroll", updateShadow, { passive: true });
    updateShadow();
  })();
  /* ============================================================
     24) STICKY TOPBAR shadow
     ============================================================ */
  (function () {
    const topbar = document.querySelector(".admin-topbar");
    if (!topbar) return;
    const onScroll = () => {
      topbar.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();
    /* ============================================================
     24) FIXED TOPBAR + INDEPENDENT SCROLL
     ============================================================ */
  (function () {
    const topbar = document.querySelector(".admin-topbar");
    const main = document.querySelector(".admin-main");
    if (!topbar || !main) return;

    // Add shadow to topbar when main scrolls
    const updateTopbar = () => {
      const scrollTop = main.scrollTop || window.scrollY;
      topbar.classList.toggle("scrolled", scrollTop > 20);
    };

    // Listen on both main (desktop) and window (mobile)
    main.addEventListener("scroll", updateTopbar, { passive: true });
    window.addEventListener("scroll", updateTopbar, { passive: true });
    updateTopbar();

    // Add horizontal scroll hint to tables
    document.querySelectorAll(".admin-panel > div[style*='overflow-x']").forEach((wrap) => {
      // Check if content overflows
      const checkOverflow = () => {
        if (wrap.scrollWidth > wrap.clientWidth) {
          wrap.classList.add("has-scroll");
        } else {
          wrap.classList.remove("has-scroll");
        }
      };
      checkOverflow();
      window.addEventListener("resize", checkOverflow);
    });
  })();
  window.adminPanel = {
    switchView,
    openAddModal,
    openEditModal,
    openDeleteModal,
    showToast,
    renderLeadershipWidget,
    renderLeadershipManager,
  };
})();
