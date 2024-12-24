import React, { useEffect, useState } from 'react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]); // Store fetched jobs
  const [error, setError] = useState(null); // Store any errors
  const [loading, setLoading] = useState(true); // Track loading state

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs'); // Ensure this matches your API endpoint
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }
      const data = await response.json(); // Parse JSON data
      setJobs(data); // Update state with fetched jobs
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching jobs:', err.message);
      setError(err.message); // Set error message
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  useEffect(() => {
    fetchJobs(); // Fetch jobs on component mount
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>

      {loading && <p className="text-gray-500">Loading jobs...</p>} {/* Show loading */}

      {error && (
        <p className="text-red-500">Error: {error}</p>
      )} {/* Show error message */}

      {!loading && !error && jobs.length === 0 && (
        <p className="text-gray-500">No jobs available at the moment.</p>
      )} {/* Show no jobs available */}

      <ul className="w-full max-w-2xl">
        {jobs.map((job) => (
          <li key={job.id} className="border-b py-4">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-700">{job.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Jobs;