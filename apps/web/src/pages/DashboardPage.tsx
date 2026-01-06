import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Welcome, {user?.name}!</h2>
        <p>Email: {user?.email}</p>
        <p style={{ marginTop: '20px', color: '#6c757d' }}>
          This is your dashboard. Test run features will be added in future epics.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
