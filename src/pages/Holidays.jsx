import { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { getHolidays } from '../store/dataStore';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Holidays() {
  const holidays = getHolidays();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [tab, setTab] = useState('list');

  const yearHolidays = holidays.filter(h => new Date(h.date).getFullYear() === viewYear);
  const upcoming = yearHolidays.filter(h => new Date(h.date) >= today);
  const past = yearHolidays.filter(h => new Date(h.date) < today);
  const holidayDateSet = new Set(yearHolidays.map(h => h.date));

  const byMonth = useMemo(() => {
    const map = {};
    yearHolidays.forEach(h => {
      const m = new Date(h.date).getMonth();
      if (!map[m]) map[m] = [];
      map[m].push(h);
    });
    return map;
  }, [yearHolidays]);

  return (
    <Layout title="Holiday Calendar">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Holiday Calendar</h1>
          <p>{yearHolidays.length} scheduled holidays in {viewYear}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setViewYear(v => v - 1)}>
            <ChevronLeft size={14} /> {viewYear - 1}
          </button>
          <span style={{ fontWeight: 700, color: '#4f46e5', padding: '0 10px', fontSize: 14 }}>{viewYear}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setViewYear(v => v + 1)}>
            {viewYear + 1} <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Next holiday callout */}
      {upcoming.length > 0 && (
        <div style={{ padding: '18px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', border: '1px solid #c7d2fe', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff', border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(79,70,229,0.10)' }}>
            <Calendar size={20} color="#4f46e5" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Next Holiday</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{upcoming[0].name}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {new Date(upcoming[0].date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}
              {Math.ceil((new Date(upcoming[0].date) - today) / 86400000)} day{Math.ceil((new Date(upcoming[0].date) - today) / 86400000) !== 1 ? 's' : ''} away
            </div>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab-btn ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>List View</button>
        <button className={`tab-btn ${tab === 'calendar' ? 'active' : ''}`} onClick={() => setTab('calendar')}>Year Overview</button>
      </div>

      {tab === 'list' && (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Holiday</th><th>Date</th><th>Day</th><th>Type</th><th>Status</th></tr>
              </thead>
              <tbody>
                {yearHolidays.map((h, i) => {
                  const d = new Date(h.date);
                  const isPast = d < today;
                  return (
                    <tr key={h.id} style={{ opacity: isPast ? 0.55 : 1 }}>
                      <td style={{ color: '#94a3b8', fontWeight: 500 }}>{String(i + 1).padStart(2, '0')}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{h.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{h.date}</td>
                      <td style={{ color: '#64748b' }}>{DAY_NAMES[d.getDay()]}</td>
                      <td>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: h.type === 'national' ? '#4f46e5' : '#d97706', background: h.type === 'national' ? '#eef2ff' : '#fffbeb', padding: '3px 9px', borderRadius: 6, border: `1px solid ${h.type === 'national' ? '#c7d2fe' : '#fde68a'}`, textTransform: 'capitalize' }}>
                          {h.type}
                        </span>
                      </td>
                      <td>
                        {isPast
                          ? <span className="badge badge-inactive">Past</span>
                          : <span className="badge badge-approved">Upcoming</span>}
                      </td>
                    </tr>
                  );
                })}
                {yearHolidays.length === 0 && (
                  <tr><td colSpan={6}><div className="empty-state" style={{ padding: 32 }}><Calendar size={36} color="#cbd5e1" /><p>No holidays for {viewYear}</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {MONTH_NAMES.map((monthName, monthIdx) => {
            const first = new Date(viewYear, monthIdx, 1);
            const last = new Date(viewYear, monthIdx + 1, 0);
            const cells = [];
            for (let i = 0; i < first.getDay(); i++) cells.push(null);
            for (let d = 1; d <= last.getDate(); d++) cells.push(d);
            const monthHols = byMonth[monthIdx] || [];

            return (
              <div key={monthIdx} className="card card-sm">
                <div style={{ fontWeight: 700, fontSize: 12.5, color: monthHols.length > 0 ? '#4f46e5' : '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8, display: 'flex', justifyContent: 'space-between' }}>
                  {monthName}
                  {monthHols.length > 0 && (
                    <span style={{ background: '#4f46e5', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, minWidth: 18, textAlign: 'center' }}>{monthHols.length}</span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                  {DAY_NAMES.map(d => (
                    <div key={d} style={{ fontSize: 8.5, color: '#94a3b8', textAlign: 'center', padding: '3px 0', fontWeight: 600 }}>{d[0]}</div>
                  ))}
                  {cells.map((day, i) => {
                    const dateStr = day ? `${viewYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                    const isHol = dateStr && holidayDateSet.has(dateStr);
                    const isToday = day && monthIdx === today.getMonth() && viewYear === today.getFullYear() && day === today.getDate();
                    const hol = isHol ? yearHolidays.find(h => h.date === dateStr) : null;
                    return (
                      <div key={i} title={hol?.name} style={{ aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, borderRadius: 3, fontWeight: isHol || isToday ? 700 : 400, background: isHol ? '#eef2ff' : isToday ? '#4f46e5' : 'transparent', color: isHol ? '#4f46e5' : isToday ? '#fff' : '#64748b', cursor: hol ? 'default' : 'default' }}>
                        {day}
                      </div>
                    );
                  })}
                </div>
                {monthHols.length > 0 && (
                  <div style={{ marginTop: 8, borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
                    {monthHols.map(h => (
                      <div key={h.id} style={{ fontSize: 10, color: '#4f46e5', fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
