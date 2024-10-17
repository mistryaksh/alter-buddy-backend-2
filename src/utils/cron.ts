import {
  cleanUpOutdatedSlots,
  initializeCronJob,
} from "services/reminder.service";

// Initialize cron jobs on server startup
initializeCronJob();
cleanUpOutdatedSlots();
