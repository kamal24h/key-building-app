// import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from "@supabase/supabase-js";

// NOTE: You must set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your environment
// For local development you can create a .env file used by Vite (VITE_ prefix) or configure your hosting.

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "Supabase credentials are not set. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(
  SUPABASE_URL || "",
  SUPABASE_ANON_KEY || ""
);

// --- Table compatibility layer ---
export const table = {
  async getItems(tableIdOrName: string, opts: any = {}) {
    // Expect tableIdOrName to be the table name in Supabase
    const { query, limit, sort, order } = opts;
    let qb = supabase.from(tableIdOrName).select("*");

    if (query) {
      // simple equality filters only
      Object.keys(query).forEach((k) => {
        const v = query[k];
        // normalize common client-side keys to DB columns
        let col = k;
        if (k === "_id") col = "id";
        if (k === "_uid") col = "uid";
        // allow both createdAt (camelCase) and created_at (snake_case)
        if (k === "createdAt") col = "createdAt";
        if (k === "created_at") col = "created_at";
        if (k === "updatedAt") col = "updated_at";
        if (k === "user_id" || k === "issue_id") col = k; // keep as-is
        qb = qb.eq(col, v as any);
      });
    }

    if (sort) {
      // normalize sort key like '_id' -> 'id'
      let sortCol = sort;
      if (sort === "_id") sortCol = "id";
      // support both naming conventions
      if (sort === "createdAt") sortCol = "createdAt";
      if (sort === "created_at") sortCol = "created_at";
      qb = qb.order(sortCol, { ascending: order !== "desc" });
    }

    if (limit) qb = qb.limit(limit);

    const { data, error } = await qb;
    if (error) throw error;
    // Map Supabase rows to expected shape used throughout the app
    const items = (data || []).map((row: any) => {
      const mapped = { ...row };
      if (row.id && !row._id) mapped._id = row.id;
      if (row.uid && !row._uid) mapped._uid = row.uid;
      // Map both snake_case and camelCase timestamps to mapped.createdAt/updatedAt
      if ((row.created_at || row.createdAt) && !row.createdAt)
        mapped.createdAt = row.created_at || row.createdAt;
      if ((row.updated_at || row.updatedAt) && !row.updatedAt)
        mapped.updatedAt = row.updated_at || row.updatedAt;
      return mapped;
    });
    return { items };
  },

  async addItem(tableName: string, payload: any) {
    // Map payload fields to DB columns
    const payloadCopy = { ...payload } as any;
    if (payloadCopy._id) {
      // Supabase uses 'id' as PK
      payloadCopy.id = payloadCopy._id;
      delete payloadCopy._id;
    }
    if (payloadCopy._uid) {
      payloadCopy.uid = payloadCopy._uid;
      delete payloadCopy._uid;
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert([payloadCopy])
      .select();
    if (error) throw error;
    const row = data?.[0];
    if (!row) return row;
    // Map back to expected shape
    const mapped = { ...row } as any;
    if (row.id && !mapped._id) mapped._id = row.id;
    if (row.uid && !mapped._uid) mapped._uid = row.uid;
    return mapped;
  },

  async updateItem(tableName: string, payload: any) {
    // Require _id or id field to identify row
    const id = payload._id || payload.id;
    if (!id) throw new Error("updateItem requires _id or id");
    const payloadCopy = { ...payload };
    delete payloadCopy._id;
    delete payloadCopy.id;
    delete payloadCopy._uid;

    // If DB uses id, ensure we're filtering on id column
    const { data, error } = await supabase
      .from(tableName)
      .update(payloadCopy)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    // Map to expected shape
    const mapped = { ...data } as any;
    if (data.id && !mapped._id) mapped._id = data.id;
    if (data.uid && !mapped._uid) mapped._uid = data.uid;
    return mapped;
  },

  async deleteItem(tableName: string, payload: any) {
    const id = payload._id || payload.id;
    if (!id) throw new Error("deleteItem requires _id or id");
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id)
      .select();
    if (error) throw error;
    const mapped = (data || []).map((row: any) => {
      const m = { ...row };
      if (row.id && !row._id) m._id = row.id;
      if (row.uid && !row._uid) m._uid = row.uid;
      return m;
    });
    return mapped;
  },
};

// --- Upload compatibility layer ---
export const upload = {
  async uploadFile(file: File) {
    if (!file) throw new Error("No file provided");
    const bucket = "public-assets";
    const filePath = `${Date.now()}-${file.name}`;

    // Ensure bucket exists (supabase admin required for creation). Assume bucket exists.
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return { isError: true, errMsg: error.message };
    }

    // Build a public URL for the uploaded file
    const getUrl = supabase.storage.from(bucket).getPublicUrl(filePath);
    const publicURL = getUrl?.data?.publicUrl;
    return { link: publicURL };
  },

  isErrorResponse(res: any) {
    return res && (res.isError || res.error || res.errMsg);
  },
};

// --- Auth compatibility layer ---
export const auth: any = {
  async sendOTP(email: string, redirectTo?: string) {
    // Use Supabase Magic Link / OTP via email. Optionally pass a redirect URL (useful for admin flow).
    // If not provided, Supabase will use the project's configured redirect URLs.
    const options: any = {};
    if (redirectTo) options.emailRedirectTo = redirectTo;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: Object.keys(options).length
        ? { emailRedirectTo: redirectTo }
        : undefined,
    });
    if (error) throw error;
    return true;
  },

  async verifyOTP(email: string, code: string) {
    // Supabase does not expose a simple verify-by-code for magic links.
    // This compatibility function will return the currently stored session/user.
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { user: data?.session?.user || null } as any;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },
};

// Sync profile helper: upsert a record into public.users after sign-in
auth.syncProfile = async function syncProfile(user: any) {
  if (!user || !user.id) return null;
  try {
    const payload = {
      id: user.id,
      email: user.email || null,
      full_name: user.user_metadata?.full_name || null,
      metadata: user.user_metadata || {},
    };
    // upsert expects an array of rows
    const { error } = await supabase.from("users").upsert([payload]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("syncProfile failed", err);
    return null;
  }
};

// Expose a helper to listen for auth state changes; accepts a callback (event, session)
export function onAuthStateChange(cb: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    try {
      cb(event, session);
    } catch (err) {
      console.error("onAuthStateChange callback error", err);
    }
  });
}

// --- elevenlabs/stub ---
export const elevenlabs = {
  async speechToText(opts: { audio_url: string }) {
    // Call a server-side transcription endpoint to avoid exposing keys in the client
    try {
      const _meta: any = import.meta;
      const TRANSCRIBE_URL =
        (_meta.env?.VITE_TRANSCRIBE_URL as string) ||
        process.env.VITE_TRANSCRIBE_URL ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/transcribe`
          : undefined);
      if (!TRANSCRIBE_URL) return { text: "" };

      const resp = await fetch(TRANSCRIBE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioUrl: opts.audio_url }),
      });

      if (!resp.ok) {
        console.error("Transcription endpoint failed", await resp.text());
        return { text: "" };
      }

      const json = await resp.json();
      return { text: json.text || "" };
    } catch (error) {
      console.error("elevenlabs.speechToText error", error);
      return { text: "" };
    }
  },
};

export default supabase;
