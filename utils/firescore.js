// utils/fireScore.js - Giorno 8
export function calculateFireScore(p){ const avg = p.reviews ? p.reviews.reduce((s,r)=>s+r.rating,0)/p.reviews.length : 4.6; return Math.min(5, avg+0.15).toFixed(1); }
export function getScoreColor(s){ const v=parseFloat(s); if(v>=4.8) return '#00d084'; if(v>=4.5) return '#ffcc00'; return '#ff7a7a'; }