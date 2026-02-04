
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cgznmxcecljfybcgujjb.supabase.co';
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnem5teGNlY2xqZnliY2d1ampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNTMsImV4cCI6MjA4MzM0MTI1M30.e2SjA1IBFrxd4KkLrT6DYpeuHPiRSg64Jk-M3pPGC6w";

const supabase = createClient(supabaseUrl, ANON_KEY);

async function inspectMetrics() {
    console.log("Fetching unique metric names...");
    
    // We can't do distinct easily with just JS client without RPC or getting all rows.
    // Let's get a sample of 500 rows and extract names.
    const { data, error } = await supabase
        .from('raw_tms_metrics')
        .select('metric_name, report_type')
        .limit(1000);

    if (error) {
        console.error(error);
        return;
    }

    const uniqueMetrics = new Set();
    data.forEach(r => uniqueMetrics.add(`[${r.report_type}] ${r.metric_name}`));

    console.log("Found Metrics:");
    uniqueMetrics.forEach(m => console.log(m));
}

inspectMetrics();
