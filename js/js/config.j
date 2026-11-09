"use strict";
// Publishable client keys are safe in browsers; never put a secret/service-role key here.
const CONFIG = {
  supabaseUrl: "https://zvcmbjnsvkoqoycsopkm.supabase.co",
  supabasePublishableKey: "sb_publishable_EfalUd595D0IUkfQNQ-blw_P62Kpwca",
  publicTracks: { "Musafir (Urdu Drill)": "", "Mukhtalif (Lo-Fi Session)": "" },
  uploadBucket: "file_upload"
};
const client = window.supabase?.createClient(CONFIG.supabaseUrl, CONFIG.supabasePublishableKey) || null;
