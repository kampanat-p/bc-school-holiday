
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cgznmxcecljfybcgujjb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY; // I'll inject this in the run command or use the hardcoded one from previous context if needed, but prefer env or hardcoding for this temp script.

// Reusing the key from the user's previous context since they provided it publicly in the shell script.
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNTMsImV4cCI6MjA4MzM0MTI1M30.e2SjA1IBFrxd4KkLrT6DYpeuHPiRSg64Jk-M3pPGC6w";

const supabase = createClient(supabaseUrl, ANON_KEY);

async function inspect() {
    console.log("Fetching by-week sample...");
    const { data: weekData, error: weekError } = await supabase
        .from('raw_tms_metrics')
        .select('*')
        .eq('report_type', 'by-week')
        .limit(1);

    if (weekError) console.error(weekError);
    else console.log(JSON.stringify(weekData, null, 2));

    console.log("Fetching by-topic sample...");
    const { data: topicData, error: topicError } = await supabase
        .from('raw_tms_metrics')
        .select('*')
        .eq('report_type', 'by-topic')
        .limit(1);

    if (topicError) console.error(topicError);
    else console.log(JSON.stringify(topicData, null, 2));
}

inspect();
