import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { role } = useUser();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs');
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.statusText}`);
        }
        const data = await response.json();
        setJobs(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Available Jobs</h1>

      {role === 'organization' && (
        <Link
          to="/create-job"
          className="mb-6 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded"
        >
          + Create Job Listing
        </Link>
      )}

      {loading && <p className="text-gray-500">Loading jobs...</p>}

      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <p className="text-gray-500">No jobs available at the moment.</p>
      )}

      <ul className="w-full max-w-2xl space-y-6">
        {jobs.map((job) => (
          <li key={job._id} className="bg-white p-4 rounded-xl shadow border">
            <h2 className="text-xl font-semibold text-black">{job.title}</h2>
            <p className="text-gray-700 mb-2">{job.description}</p>

            {job.organizationId?.name && (
              <p className="text-sm text-gray-500 mb-1">
                Posted by: {job.organizationId.name}
              </p>
            )}

            <Link
              to={`/jobs/${job._id}`}
              className="text-blue-500 hover:underline text-sm"
            >
              View Details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobList;