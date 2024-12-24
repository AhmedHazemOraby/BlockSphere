const Loader = ({ message }) => (
    <div className="flex items-center justify-center min-h-screen">
      <p>{message || 'Loading...'}</p>
    </div>
  );  