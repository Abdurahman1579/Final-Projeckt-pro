/* ============================================================
   SUPABASE CLIENT — Malka Nono Project
   ------------------------------------------------------------
   Full backend helpers:
   - Public: contact, pledge, newsletter, news, reports
   - Admin: fetch + CRUD for all resources
   - Storage: file upload for reports
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     1) CONFIGURATION
     ============================================================ */
  const SUPABASE_URL = "https://yjkgipivctdhezwvfwjx.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqa2dpcGl2Y3RkaGV6d3Zmd2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTYxODYsImV4cCI6MjEwMDk5MjE4Nn0.MaxngdvJ-SHrQ_qIok9_jU2-kxaVt_-OKOT03XKq_Kk";

  if (!window.supabase || !window.supabase.createClient) {
    console.error("[Supabase] Library not loaded. Add CDN script first.");
    return;
  }

  const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "mkn-admin-auth",
      },
    },
  );

  window.mknSupabase = supabase;

  /* ============================================================
     2) HELPERS
     ============================================================ */
  function t(key, fallback) {
    if (window.i18n && window.i18n.t) {
      const val = window.i18n.t(key);
      return val && val !== key ? val : fallback;
    }
    return fallback;
  }

  /* ============================================================
     3) CONTACT FORM
     ============================================================ */
  async function submitContact(data) {
    try {
      const payload = {
        name: String(data.name || "").trim(),
        phone: String(data.phone || "").trim(),
        email: data.email ? String(data.email).trim() : null,
        subject: data.subject ? String(data.subject).trim() : null,
        message: String(data.message || "").trim(),
      };

      if (!payload.name || !payload.phone || !payload.message) {
        return {
          success: false,
          error: t("form.error.required", "Please fill all required fields."),
        };
      }

      const { data: result, error } = await supabase
        .from("mkn_contact_messages")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("[Contact] Error:", error);
        return {
          success: false,
          error:
            error.message || t("form.error.generic", "Something went wrong."),
        };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("[Contact] Exception:", err);
      return {
        success: false,
        error: t("form.error.network", "Network error. Please try again."),
      };
    }
  }

  /* ============================================================
     4) PLEDGE
     ============================================================ */
  async function submitPledge(data) {
    try {
      const amount = parseFloat(
        String(data.amount || "").replace(/[^0-9.]/g, ""),
      );

      const payload = {
        name: String(data.name || "").trim(),
        phone: String(data.phone || "").trim(),
        email: data.email ? String(data.email).trim() : null,
        amount: amount,
        method: data.method ? String(data.method).trim() : null,
        note: data.note ? String(data.note).trim() : null,
      };

      if (!payload.name || !payload.phone) {
        return {
          success: false,
          error: t("form.error.required", "Please fill all required fields."),
        };
      }
      if (!payload.amount || isNaN(payload.amount) || payload.amount <= 0) {
        return {
          success: false,
          error: t("form.error.amount", "Please enter a valid amount."),
        };
      }

      const { data: result, error } = await supabase
        .from("mkn_pledges")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("[Pledge] Error:", error);
        return {
          success: false,
          error:
            error.message || t("form.error.generic", "Something went wrong."),
        };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("[Pledge] Exception:", err);
      return {
        success: false,
        error: t("form.error.network", "Network error. Please try again."),
      };
    }
  }

  /* ============================================================
     5) NEWSLETTER
     ============================================================ */
  async function subscribeNewsletter(email) {
    try {
      const cleanEmail = String(email || "")
        .trim()
        .toLowerCase();

      if (!cleanEmail || !cleanEmail.includes("@")) {
        return {
          success: false,
          error: t("form.error.email", "Please enter a valid email address."),
        };
      }

      const { data: result, error } = await supabase
        .from("mkn_newsletter_subscribers")
        .insert([{ email: cleanEmail }])
        .select()
        .single();

      if (error) {
        if (error.code === "23505" || error.message.includes("duplicate")) {
          return {
            success: true,
            duplicate: true,
            message: t("newsletter.already", "You're already subscribed!"),
          };
        }
        console.error("[Newsletter] Error:", error);
        return {
          success: false,
          error:
            error.message || t("form.error.generic", "Something went wrong."),
        };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("[Newsletter] Exception:", err);
      return {
        success: false,
        error: t("form.error.network", "Network error. Please try again."),
      };
    }
  }

  /* ============================================================
     6) NEWS
     ============================================================ */
  async function fetchNews(options) {
    const opts = options || {};
    let query = supabase
      .from("mkn_news")
      .select("*")
      .order("created_at", { ascending: false });
    if (opts.status) query = query.eq("status", opts.status);
    if (opts.category) query = query.eq("category", opts.category);
    if (opts.limit) query = query.limit(opts.limit);
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  }

  async function fetchFeaturedNews() {
    const { data, error } = await supabase
      .from("mkn_news")
      .select("*")
      .eq("featured", true)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }

  async function createNews(data) {
    const payload = {
      title: String(data.title || "").trim(),
      category: data.category || "announcement",
      excerpt: data.excerpt || "",
      content: data.content || "",
      author: data.author || "Council Office",
      status: data.status || "draft",
      featured: !!data.featured,
      image_url: data.image_url || null,
    };
    if (!payload.title) return { success: false, error: "Title is required" };
    const { data: result, error } = await supabase
      .from("mkn_news")
      .insert([payload])
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: result };
  }

  async function updateNews(id, data) {
    const payload = {
      title: String(data.title || "").trim(),
      category: data.category || "announcement",
      excerpt: data.excerpt || "",
      content: data.content || "",
      status: data.status || "draft",
      featured: !!data.featured,
    };
    const { data: result, error } = await supabase
      .from("mkn_news")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: result };
  }

  async function deleteNews(id) {
    const { error } = await supabase.from("mkn_news").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  /* ============================================================
     7) REPORTS (with Supabase Storage)
     ============================================================ */
  const REPORTS_BUCKET = "mkn-reports";

  async function fetchReports(options) {
    const opts = options || {};
    let query = supabase
      .from("mkn_reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (opts.status) query = query.eq("status", opts.status);
    if (opts.type) query = query.eq("type", opts.type);
    if (opts.limit) query = query.limit(opts.limit);
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  }

  function getReportPublicUrl(filePath) {
    if (!filePath) return "";
    const { data } = supabase.storage
      .from(REPORTS_BUCKET)
      .getPublicUrl(filePath);
    return data ? data.publicUrl : "";
  }

  async function uploadReportFile(file) {
    if (!file) return { success: false, error: "No file provided" };

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 40);
    const filePath = `reports/${timestamp}_${safeName}.${ext}`;

    const { data, error } = await supabase.storage
      .from(REPORTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

    if (error) {
      console.error("[Reports Upload]", error);
      return { success: false, error: error.message };
    }

    const publicUrl = getReportPublicUrl(filePath);

    return {
      success: true,
      file_path: filePath,
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
    };
  }

  async function createReport(data) {
    const payload = {
      title: String(data.title || "").trim(),
      type: data.type || "financial",
      description: data.description || "",
      status: data.status || "draft",
      report_date: data.report_date || new Date().toISOString(),
      file_url: data.file_url || null,
      file_path: data.file_path || null,
      file_name: data.file_name || null,
      file_size: data.file_size || 0,
    };
    if (!payload.title) return { success: false, error: "Title is required" };

    const { data: result, error } = await supabase
      .from("mkn_reports")
      .insert([payload])
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: result };
  }

  async function updateReport(id, data) {
    const payload = {
      title: String(data.title || "").trim(),
      type: data.type || "financial",
      description: data.description || "",
      status: data.status || "draft",
    };
    if (data.file_url) {
      payload.file_url = data.file_url;
      payload.file_path = data.file_path;
      payload.file_name = data.file_name;
      payload.file_size = data.file_size;
    }
    const { data: result, error } = await supabase
      .from("mkn_reports")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: result };
  }

  async function deleteReport(id) {
    const { data: report } = await supabase
      .from("mkn_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (report && report.file_path) {
      await supabase.storage.from(REPORTS_BUCKET).remove([report.file_path]);
    }

    const { error } = await supabase.from("mkn_reports").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  /* ============================================================
     8) ADMIN FETCH HELPERS
     ============================================================ */
  async function fetchContacts(options) {
    const opts = options || {};
    let query = supabase
      .from("mkn_contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (opts.status) query = query.eq("status", opts.status);
    if (opts.limit) query = query.limit(opts.limit);
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  }

  async function fetchPledges(options) {
    const opts = options || {};
    let query = supabase
      .from("mkn_pledges")
      .select("*")
      .order("created_at", { ascending: false });
    if (opts.status) query = query.eq("status", opts.status);
    if (opts.limit) query = query.limit(opts.limit);
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  }

  async function fetchSubscribers(options) {
    const opts = options || {};
    const query = supabase
      .from("mkn_newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(opts.limit || 1000);
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  }

  async function updateContactStatus(id, status) {
    const { data, error } = await supabase
      .from("mkn_contact_messages")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }

  async function updatePledgeStatus(id, status) {
    const { data, error } = await supabase
      .from("mkn_pledges")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }

  async function deleteRecord(table, id) {
    const allowed = [
      "mkn_contact_messages",
      "mkn_pledges",
      "mkn_newsletter_subscribers",
      "mkn_news",
      "mkn_reports",
    ];
    if (!allowed.includes(table))
      return { success: false, error: "Invalid table" };
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async function fetchStats() {
    const [contactsRes, pledgesRes, subsRes] = await Promise.all([
      supabase
        .from("mkn_contact_messages")
        .select("*", { count: "exact", head: true }),
      supabase.from("mkn_pledges").select("*"),
      supabase
        .from("mkn_newsletter_subscribers")
        .select("*", { count: "exact", head: true }),
    ]);

    let totalPledged = 0;
    if (pledgesRes.data) {
      totalPledged = pledgesRes.data.reduce(
        (sum, p) => sum + (Number(p.amount) || 0),
        0,
      );
    }

    return {
      success: true,
      stats: {
        totalMessages: contactsRes.count || 0,
        totalPledges: (pledgesRes.data && pledgesRes.data.length) || 0,
        totalPledged: totalPledged,
        totalSubscribers: subsRes.count || 0,
      },
    };
  }

  /* ============================================================
     9) EXPOSE GLOBAL API
     ============================================================ */
  window.mknBackend = {
    client: supabase,

    // Public forms
    submitContact,
    submitPledge,
    subscribeNewsletter,

    // News
    fetchNews,
    fetchFeaturedNews,
    createNews,
    updateNews,
    deleteNews,

    // Reports
    fetchReports,
    uploadReportFile,
    getReportPublicUrl,
    createReport,
    updateReport,
    deleteReport,

    // Admin
    fetchContacts,
    fetchPledges,
    fetchSubscribers,
    updateContactStatus,
    updatePledgeStatus,
    deleteRecord,
    fetchStats,
  };

  console.log("[Supabase] ✓ Backend ready — mknBackend available");
})();
