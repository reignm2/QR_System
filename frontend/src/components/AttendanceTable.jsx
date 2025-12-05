import React from 'react';

function AttendanceTable({ records }) {
  return (
    <table className="table table-bordered mt-3">
      <thead>
        <tr>
          <th>Employee</th>
          <th>Time In</th>
          <th>Time Out</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {records.map(r => (
          <tr key={r.attendanceID}>
            <td>{r.first_name} {r.last_name}</td>
            <td>{r.time_in ? r.time_in.slice(11, 16) : '-'}</td>
            <td>{r.time_out ? r.time_out.slice(11, 16) : '-'}</td>
            <td>
              {r.status && r.status.toLowerCase() === 'present' && (
                <span style={{
                  background: '#111',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '2px 12px',
                  fontWeight: 600
                }}>Present</span>
              )}
              {r.status && r.status.toLowerCase() === 'late' && (
                <span style={{
                  background: '#f66',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '2px 12px',
                  fontWeight: 600
                }}>Late</span>
              )}
              {r.status && r.status.toLowerCase() === 'absent' && (
                <span style={{
                  background: '#888',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '2px 12px',
                  fontWeight: 600
                }}>Absent</span>
              )}
              {r.status && !['present', 'late', 'absent'].includes(r.status.toLowerCase()) && (
                <span>{r.status}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AttendanceTable;