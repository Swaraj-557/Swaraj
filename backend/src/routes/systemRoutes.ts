import { Router } from 'express';
import os from 'os';

const router = Router();

// Get system information
router.get('/info', (req, res) => {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const systemInfo = {
      cpu: {
        model: cpus[0].model,
        cores: cpus.length,
        speed: `${cpus[0].speed} MHz`,
      },
      memory: {
        total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        used: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        usagePercent: `${((usedMem / totalMem) * 100).toFixed(1)}%`,
      },
      platform: os.platform(),
      hostname: os.hostname(),
      uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
      nodeVersion: process.version,
    };

    res.json({ success: true, data: systemInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve system info' });
  }
});

// Get CPU info
router.get('/cpu', (req, res) => {
  try {
    const cpus = os.cpus();
    res.json({
      success: true,
      data: {
        model: cpus[0].model,
        cores: cpus.length,
        speed: `${cpus[0].speed} MHz`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve CPU info' });
  }
});

// Get memory info
router.get('/memory', (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    res.json({
      success: true,
      data: {
        total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        used: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        usagePercent: `${((usedMem / totalMem) * 100).toFixed(1)}%`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve memory info' });
  }
});

export default router;
