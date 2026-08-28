const fs = require('fs');
const file = 'd:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/ThanhHinh/MayThanhHinhDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                  const statusLower = String(item.StatusName || '').toLowerCase();
                  const isRunning = item.MachineStatus === 1 || statusLower === 'chạy' || statusLower === 'run';
                  const isStop = item.MachineStatus === 0 || statusLower === 'dừng' || statusLower === 'stop';
                  const isDisconnect = item.MachineStatus === -1 || statusLower === 'mất kết nối';
                  
                  let bgColor = '#94a3b8'; // default grey
                  let label = item.StatusName || 'Unknown';
                  if (isRunning) { bgColor = '#22c55e'; label = 'Run'; }
                  else if (isStop) { bgColor = '#facc15'; label = 'Stop'; }
                  else if (isDisconnect) { bgColor = '#ef4444'; label = 'Disconnect'; }`;

const replacement = `                  const statusNum = Number(item.MachineStatus);
                  let bgColor = '#94a3b8';
                  let label = item.StatusName || 'Unknown';
                  let isRunning = false;
                  let isDisconnect = false;
                  
                  switch(statusNum) {
                    case 0: bgColor = '#fff2cc'; label = 'N/A'; break;
                    case 1: bgColor = '#22c55e'; label = 'Run'; isRunning = true; break;
                    case 2: bgColor = '#facc15'; label = 'Stop'; break;
                    case 3: bgColor = '#ef4444'; label = 'Error'; break;
                    case 4: bgColor = '#f97316'; label = 'Disconn'; isDisconnect = true; break;
                    case 5: bgColor = '#f8cbad'; label = 'PLC Init'; break;
                    case 6: bgColor = '#b4c6e7'; label = 'No Plan'; break;
                    case 7: bgColor = '#c55a11'; label = 'App Off'; break;
                    case 8: bgColor = '#833c0c'; label = 'Svr Off'; break;
                    default: 
                      const statusLower = String(item.StatusName || '').toLowerCase();
                      if (statusLower === 'chạy' || statusLower === 'run') { bgColor = '#22c55e'; label = 'Run'; isRunning = true; }
                      else if (statusLower === 'dừng' || statusLower === 'stop') { bgColor = '#facc15'; label = 'Stop'; }
                      else if (statusLower === 'mất kết nối') { bgColor = '#ef4444'; label = 'Disconnect'; isDisconnect = true; }
                      break;
                  }`;

content = content.replace(target.replace(/\r\n/g, '\n'), replacement);
content = content.replace(target, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log("Colors fixed");
