export default function LandingPage() {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        color: '#fff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          GPower Studio
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#aaa', marginBottom: '2rem' }}>
          A plataforma definitiva para estúdios de tatuagem e piercing
        </p>
        <p style={{ color: '#666' }}>Em breve — Coming soon</p>
      </div>
    </main>
  );
}
