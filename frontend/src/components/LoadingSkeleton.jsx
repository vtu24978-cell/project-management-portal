import React from 'react';

const LoadingSkeleton = ({ count = 3 }) => {
  const skeletons = Array(count).fill(null);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px',
      width: '100%'
    }}>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className="glass animate-pulse"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '220px',
            border: '1px solid var(--glass-border)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div>
            {/* Header info */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '80px',
                height: '20px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--border-color)'
              }} />
              <div style={{
                width: '100px',
                height: '20px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--border-color)'
              }} />
            </div>

            {/* Title line */}
            <div style={{
              width: '70%',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--border-color)',
              marginBottom: '12px'
            }} />

            {/* Description lines */}
            <div style={{
              width: '100%',
              height: '14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--border-color)',
              marginBottom: '8px'
            }} />
            <div style={{
              width: '90%',
              height: '14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--border-color)',
              marginBottom: '8px'
            }} />
          </div>

          {/* Action Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{
              width: '120px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--border-color)'
            }} />
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--border-color)'
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
