import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';

const MyJobs = () => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (!user?._id) return;
    fetch(`http://localhost:5000/api/my-jobs/${user._id}`)
      .then((res) => res.json())
      .then(setJobs)
      .catch(console.error);
  }, [user]);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Job Listings</h1>
      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job._id} className="border p-4 rounded-xl shadow bg-white">
              <h2 className="text-xl font-semibold text-black">{job.title}</h2>
              <p className="text-gray-700">{job.description}</p>
              <p className="text-sm text-gray-600">{job.jobType} | {job.pay}</p>
              <Link to={`/jobs/${job._id}`} className="text-blue-500 underline">View</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyJobs;