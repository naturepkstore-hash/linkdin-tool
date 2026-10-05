import { runDueScheduledPosts } from './src/lib/scheduler';

console.log('----------------------------------------------------');
console.log('🚀 PostFlow AI Background Publishing Worker Started');
console.log('Checking for due scheduled LinkedIn posts every 15s');
console.log('----------------------------------------------------');

let isRunning = false;

async function checkAndProcess() {
  if (isRunning) return;
  isRunning = true;
  try {
    const processed = await runDueScheduledPosts();
    if (processed > 0) {
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Processed and published ${processed} post(s).`);
    }
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Worker tick error:`, err);
  } finally {
    isRunning = false;
  }
}

// Initial run
checkAndProcess();

// Recurring loop every 15 seconds
setInterval(checkAndProcess, 15000);
