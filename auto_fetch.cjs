const fs = require('fs');
const file = 'd:/CTY/cake-shop-frontend-chính-20251014T092929Z-1-001/cake-shop-frontend-chính/src/pages/ThanhHinh/MayThanhHinhDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Sync year/month with selectedDate
const t1 = `  // Tự động cập nhật idKehoach khi selectedDate hoặc selectedCa thay đổi
  useEffect(() => {
    if (selectedDate && selectedCa !== '') {
      const yyyymmdd = selectedDate.replace(/-/g, '');
      const newId = \`RA10.\${yyyymmdd}\${selectedCa}\`;
      console.log("[TEST LỖI] Cập nhật idKehoach:", newId);
      setIdKehoach(newId);
    } else {
      setIdKehoach('');
    }
  }, [selectedDate, selectedCa]);`;

const r1 = `  // Tự động cập nhật idKehoach khi selectedDate hoặc selectedCa thay đổi
  useEffect(() => {
    if (selectedDate && selectedCa !== '') {
      const yyyymmdd = selectedDate.replace(/-/g, '');
      const newId = \`RA10.\${yyyymmdd}\${selectedCa}\`;
      console.log("[TEST LỖI] Cập nhật idKehoach:", newId);
      setIdKehoach(newId);
      
      const [y, m] = selectedDate.split('-');
      if (y && m) {
        setSelectedYear(Number(y));
        setSelectedMonth(Number(m));
      }
    } else {
      setIdKehoach('');
    }
  }, [selectedDate, selectedCa]);`;

// Make fetch auto-trigger on idKehoach change
const t2 = `  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchShiftStats();
      fetchMachineStatusTimes();
    }
  }, [equipmentId, activeTab]);`;

const r2 = `  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchShiftStats();
      fetchMachineStatusTimes();
    }
  }, [equipmentId, activeTab, idKehoach]);`;

let newContent = content.replace(t1, r1);
newContent = newContent.replace(t2, r2);

if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log("Replaced successfully");
} else {
    console.log("No changes made");
}
