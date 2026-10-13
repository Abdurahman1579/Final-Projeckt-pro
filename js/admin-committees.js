/* ============================================================
   ADMIN — Committees Manager (with photo upload)
   ------------------------------------------------------------
   - CRUD for committees
   - Multi-language fields
   - Photo upload for leader + each member
   - Members can be added / edited / removed
   ============================================================ */

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") setTimeout(fn, 400);
    else
      document.addEventListener("DOMContentLoaded", () => setTimeout(fn, 400));
  }

  ready(function () {
    if (!window.mknBackend || !window.adminPanel) {
      console.warn("[Committees] Dependencies not ready");
      return;
    }

    document
      .querySelectorAll('#adminNav a[data-view="committees"]')
      .forEach((link) => {
        link.addEventListener("click", () => setTimeout(loadCommittees, 250));
      });

    window.addEventListener("langchange", () =>
      setTimeout(loadCommittees, 200),
    );

    loadCommittees();
  });

  /* ============================================================
     HELPERS
     ============================================================ */
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

  function getLang() {
    return window.i18n && window.i18n.getLang ? window.i18n.getLang() : "en";
  }

  function getName(item, prefix) {
    const lang = getLang();
    return item[`${prefix}_${lang}`] || item[`${prefix}_en`] || "";
  }

  function initialsOf(name) {
    if (!name) return "??";
    return name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  /* ============================================================
     LOAD + RENDER
     ============================================================ */
  async function loadCommittees() {
    const grid = document.getElementById("committeesManagerGrid");
    if (!grid) return;

    const res = await window.mknBackend.fetchCommittees({});
    if (!res.success) {
      grid.innerHTML =
        '<p style="text-align:center;color:#c0392b;padding:30px;">Error: ' +
        escapeHtml(res.error) +
        "</p>";
      return;
    }

    if (!res.data || res.data.length === 0) {
      grid.innerHTML =
        '<p style="text-align:center;color:var(--ink500);padding:30px;">No committees yet. Click "+ Add Committee" to create one.</p>';
      return;
    }

    grid.innerHTML = res.data
      .map((c) => {
        const memberCount = (c.members || []).length;
        const leaderPhoto = c.leader_photo;
        const leaderInitials =
          c.leader_initials || initialsOf(c.leader_name || "");

        return `
        <div class="committee-mgr-card" data-committee-id="${c.id}">
          <div class="cmc-head">
            <div class="cmc-icon">${c.icon || "📋"}</div>
            <div class="cmc-titles">
              <div class="cmc-sub">${escapeHtml(getName(c, "sub"))}</div>
              <h3>${escapeHtml(getName(c, "title"))}</h3>
            </div>
          </div>
          <p class="cmc-desc">${escapeHtml(getName(c, "desc")).slice(0, 120)}${getName(c, "desc").length > 120 ? "..." : ""}</p>
          <div class="cmc-meta">
            <span class="cmc-leader-meta">
              <span class="cmc-leader-avatar">
                ${leaderPhoto ? `<img src="${escapeAttr(leaderPhoto)}" alt="" />` : leaderInitials}
              </span>
              <strong>${escapeHtml(c.leader_name || "—")}</strong>
            </span>
            <span>👥 <strong>${memberCount}</strong> <span data-i18n="admin.committees.members"></span></span>
          </div>
          <div class="cmc-actions">
            <button class="icon-btn edit" data-committee-edit="${c.id}" title="Edit">✏️</button>
            <button class="icon-btn danger" data-committee-delete="${c.id}" title="Delete">🗑️</button>
          </div>
        </div>
      `;
      })
      .join("");

    if (window.i18n && window.i18n.applyTranslations) {
      window.i18n.applyTranslations();
    }

    console.log("[Committees] ✓ Loaded", res.data.length, "committees");
  }

  /* ============================================================
     OPEN MODAL (Add / Edit)
     ============================================================ */
  async function openCommitteeModal(mode, id) {
    const modalOverlay = document.getElementById("modalOverlay");
    const modalBox = document.getElementById("modalBox");
    const modalBody = document.getElementById("modalBody");
    const modalTitleText = document.getElementById("modalTitleText");
    const modalSave = document.getElementById("modalSave");
    if (!modalOverlay || !modalBody) return;

    modalBox.classList.remove("confirm");
    modalTitleText.textContent =
      mode === "edit"
        ? window.i18n
          ? window.i18n.t("admin.committees.edit")
          : "Edit Committee"
        : window.i18n
          ? window.i18n.t("admin.committees.add")
          : "Add Committee";
    modalSave.textContent = window.i18n
      ? window.i18n.t("admin.modal.save")
      : "Save";
    modalSave.className = "modal-btn primary";

    let record = null;
    if (mode === "edit" && id) {
      const res = await window.mknBackend.fetchCommittees({});
      if (res.success) record = res.data.find((x) => x.id === id);
    }

    window.__mknCommitteeModal = {
      mode,
      id: id || null,
      members:
        record && Array.isArray(record.members)
          ? JSON.parse(JSON.stringify(record.members))
          : [],
      leaderPhoto: record ? record.leader_photo || "" : "",
    };

    renderModal(record);
    modalOverlay.classList.add("show");
  }

  function renderModal(record) {
    const modalBody = document.getElementById("modalBody");
    const r = record || {};

    modalBody.innerHTML = `
      <div class="form-group">
        <label class="form-label">Icon (emoji)</label>
        <input class="form-input" type="text" id="cIcon" maxlength="4" value="${escapeAttr(r.icon || "📋")}" style="font-size:20px;text-align:center;" />
      </div>

      <div class="form-group">
        <label class="form-label">Title — English *</label>
        <input class="form-input" type="text" id="cTitleEn" value="${escapeAttr(r.title_en)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Title — አማርኛ</label>
        <input class="form-input" type="text" id="cTitleAm" value="${escapeAttr(r.title_am)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Title — Oromoo</label>
        <input class="form-input" type="text" id="cTitleOm" value="${escapeAttr(r.title_om)}" />
      </div>

      <div class="form-group">
        <label class="form-label">Subtitle — English</label>
        <input class="form-input" type="text" id="cSubEn" value="${escapeAttr(r.sub_en)}" placeholder="e.g. Oversight" />
      </div>
      <div class="form-group">
        <label class="form-label">Subtitle — አማርኛ</label>
        <input class="form-input" type="text" id="cSubAm" value="${escapeAttr(r.sub_am)}" />
      </div>

      <div class="form-group">
        <label class="form-label">Description — English</label>
        <textarea class="form-textarea" id="cDescEn" rows="2">${escapeHtml(r.desc_en || "")}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Description — አማርኛ</label>
        <textarea class="form-textarea" id="cDescAm" rows="2">${escapeHtml(r.desc_am || "")}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Description — Oromoo</label>
        <textarea class="form-textarea" id="cDescOm" rows="2">${escapeHtml(r.desc_om || "")}</textarea>
      </div>

      <hr style="border:none;border-top:1px dashed rgba(13,59,46,.15);margin:22px 0;" />

      <h4 style="font-size:14px;font-weight:700;color:var(--g900);margin-bottom:14px;">Committee Leader</h4>

      <!-- Leader photo upload -->
      <div class="form-group">
        <label class="form-label">Leader Photo</label>
        <div class="photo-upload-box" data-photo-box="leader">
          <input type="file" accept="image/*" data-photo-input="leader" />
          <div class="photo-upload-preview" data-photo-preview="leader">
            ${r.leader_photo ? `<img src="${escapeAttr(r.leader_photo)}" alt="" />` : "<span>📷</span>"}
          </div>
          <div class="photo-upload-text">
            <strong data-i18n="admin.committees.uploadPhoto"></strong>
            <small data-i18n="admin.committees.photoHint"></small>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Leader Name</label>
        <input class="form-input" type="text" id="cLeaderName" value="${escapeAttr(r.leader_name)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Leader Role</label>
        <input class="form-input" type="text" id="cLeaderRole" value="${escapeAttr(r.leader_role)}" placeholder="e.g. Committee Chair" />
      </div>

      <hr style="border:none;border-top:1px dashed rgba(13,59,46,.15);margin:22px 0;" />

      <div class="form-group">
        <label class="form-label" style="display:flex;justify-content:space-between;align-items:center;">
          <span>Members</span>
          <button type="button" class="admin-btn" id="cAddMember" style="padding:5px 10px;font-size:12px;">+ Add Member</button>
        </label>
        <div id="cMembersList" class="members-list-edit"></div>
      </div>

      <div class="form-group">
        <label class="form-label">Status</label>
        <div class="form-status-row" id="cStatusRow">
          <button type="button" class="status-pill published ${r.status === "published" || !r.status ? "active" : ""}" data-pill="published">Published</button>
          <button type="button" class="status-pill draft ${r.status === "draft" ? "active" : ""}" data-pill="draft">Draft</button>
          <input type="hidden" id="cStatus" value="${r.status || "published"}" />
        </div>
      </div>
    `;

    // Status pills
    modalBody.querySelectorAll("#cStatusRow .status-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        modalBody
          .querySelectorAll("#cStatusRow .status-pill")
          .forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        document.getElementById("cStatus").value = pill.dataset.pill;
      });
    });

    // Leader photo upload setup
    setupLeaderPhotoUpload();

    // Members render
    renderMembersList();

    // Add member button
    document.getElementById("cAddMember").addEventListener("click", () => {
      if (!window.__mknCommitteeModal) return;
      window.__mknCommitteeModal.members.push({
        name: "",
        role: "",
        initials: "",
        photo: "",
      });
      renderMembersList();
    });
  }

  /* ============================================================
     LEADER PHOTO UPLOAD
     ============================================================ */
  function setupLeaderPhotoUpload() {
    const box = document.querySelector('[data-photo-box="leader"]');
    if (!box) return;
    const input = box.querySelector('[data-photo-input="leader"]');
    const preview = box.querySelector('[data-photo-preview="leader"]');
    if (!input || !preview) return;

    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        if (window.showToast)
          window.showToast("Image too large (max 5MB)", "error");
        input.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        if (window.__mknCommitteeModal) {
          window.__mknCommitteeModal.leaderPhoto = dataUrl;
        }
        preview.innerHTML = `<img src="${dataUrl}" alt="" />`;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ============================================================
     MEMBERS LIST
     ============================================================ */
  function renderMembersList() {
    const list = document.getElementById("cMembersList");
    if (!list || !window.__mknCommitteeModal) return;
    const members = window.__mknCommitteeModal.members || [];

    if (members.length === 0) {
      list.innerHTML =
        '<p style="color:var(--ink500);font-size:13px;text-align:center;padding:12px;">No members yet. Click "+ Add Member" above.</p>';
      return;
    }

    list.innerHTML = members
      .map(
        (m, i) => `
      <div class="member-edit-row" data-index="${i}">
        <div class="member-edit-photo">
          <input type="file" accept="image/*" data-member-photo-input="${i}" />
          <div class="member-edit-av" data-member-av="${i}">
            ${m.photo ? `<img src="${escapeAttr(m.photo)}" alt="" />` : m.initials || initialsOf(m.name)}
          </div>
          <span class="member-photo-hint">📷</span>
        </div>
        <div class="member-edit-fields">
          <input type="text" class="form-input member-name" data-field="name" data-index="${i}" placeholder="Member name" value="${escapeAttr(m.name || "")}" />
          <input type="text" class="form-input member-role" data-field="role" data-index="${i}" placeholder="Role (optional)" value="${escapeAttr(m.role || "")}" />
        </div>
        <button type="button" class="member-remove" data-remove-member="${i}" title="Remove">×</button>
      </div>
    `,
      )
      .join("");

    // Bind name/role changes
    list.querySelectorAll(".member-name, .member-role").forEach((input) => {
      input.addEventListener("input", () => {
        const idx = parseInt(input.dataset.index, 10);
        const field = input.dataset.field;
        if (!window.__mknCommitteeModal) return;
        const m = window.__mknCommitteeModal.members[idx];
        if (!m) return;
        m[field] = input.value;
        if (field === "name") {
          m.initials = initialsOf(input.value);
          const av = list.querySelector(`[data-member-av="${idx}"]`);
          if (av && !m.photo) av.textContent = m.initials;
        }
      });
    });

    // Bind member photo uploads
    list.querySelectorAll("[data-member-photo-input]").forEach((input) => {
      input.addEventListener("change", () => {
        const idx = parseInt(input.dataset.memberPhotoInput, 10);
        const file = input.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          if (window.showToast)
            window.showToast("Image too large (max 5MB)", "error");
          input.value = "";
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          if (!window.__mknCommitteeModal) return;
          const m = window.__mknCommitteeModal.members[idx];
          if (!m) return;
          m.photo = dataUrl;
          const av = list.querySelector(`[data-member-av="${idx}"]`);
          if (av) av.innerHTML = `<img src="${dataUrl}" alt="" />`;
        };
        reader.readAsDataURL(file);
      });
    });

    // Bind remove
    list.querySelectorAll("[data-remove-member]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.removeMember, 10);
        if (!window.__mknCommitteeModal) return;
        window.__mknCommitteeModal.members.splice(idx, 1);
        renderMembersList();
      });
    });
  }

  /* ============================================================
     SAVE COMMITTEE
     ============================================================ */
  document.addEventListener(
    "click",
    async (e) => {
      const saveBtn = e.target.closest("#modalSave");
      if (!saveBtn) return;
      if (!window.__mknCommitteeModal) return;
      e.preventDefault();
      e.stopPropagation();

      const state = window.__mknCommitteeModal;

      const payload = {
        icon: document.getElementById("cIcon")?.value.trim() || "📋",
        title_en: document.getElementById("cTitleEn")?.value.trim(),
        title_am: document.getElementById("cTitleAm")?.value.trim(),
        title_om: document.getElementById("cTitleOm")?.value.trim(),
        sub_en: document.getElementById("cSubEn")?.value.trim(),
        sub_am: document.getElementById("cSubAm")?.value.trim(),
        desc_en: document.getElementById("cDescEn")?.value.trim(),
        desc_am: document.getElementById("cDescAm")?.value.trim(),
        desc_om: document.getElementById("cDescOm")?.value.trim(),
        leader_name: document.getElementById("cLeaderName")?.value.trim(),
        leader_role: document.getElementById("cLeaderRole")?.value.trim(),
        leader_initials: initialsOf(
          document.getElementById("cLeaderName")?.value.trim(),
        ),
        leader_photo: state.leaderPhoto || "",
        members: state.members.filter((m) => m.name && m.name.trim()),
        status: document.getElementById("cStatus")?.value || "published",
      };

      if (!payload.title_en) {
        if (window.showToast)
          window.showToast("English title is required", "error");
        return;
      }

      saveBtn.disabled = true;

      let res;
      if (state.mode === "edit" && state.id) {
        res = await window.mknBackend.updateCommittee(state.id, payload);
      } else {
        res = await window.mknBackend.createCommittee(payload);
      }

      saveBtn.disabled = false;

      if (res.success) {
        if (window.showToast) window.showToast("✓ Saved", "success");
        document.getElementById("modalOverlay").classList.remove("show");
        window.__mknCommitteeModal = null;
        loadCommittees();
      } else {
        if (window.showToast) window.showToast(res.error || "Failed", "error");
      }
    },
    true,
  );

  /* ============================================================
     EDIT / DELETE / ADD
     ============================================================ */
  document.addEventListener(
    "click",
    (e) => {
      const editBtn = e.target.closest("[data-committee-edit]");
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        openCommitteeModal("edit", editBtn.dataset.committeeEdit);
        return;
      }

      const delBtn = e.target.closest("[data-committee-delete]");
      if (delBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Delete this committee?")) return;
        const id = delBtn.dataset.committeeDelete;
        delBtn.disabled = true;
        window.mknBackend.deleteCommittee(id).then((res) => {
          if (res.success) {
            if (window.showToast) window.showToast("✓ Deleted", "success");
            loadCommittees();
          } else {
            delBtn.disabled = false;
            if (window.showToast)
              window.showToast(res.error || "Failed", "error");
          }
        });
        return;
      }

      const addBtn = e.target.closest('[data-add="committee"]');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        openCommitteeModal("add", null);
        return;
      }
    },
    true,
  );

  console.log("[Committees] ✓ Manager loaded");
})();
