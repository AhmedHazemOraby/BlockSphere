import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const CreateJob = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    jobType: 'Remote',
    pay: '',
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, organizationId: user._id }),
      });

      if (!response.ok) throw new Error('Failed to create job');

      alert('Job created successfully!');
      navigate('/my-jobs');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a Job Listing</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Job Title" onChange={handleChange} required className="w-full p-2 border rounded" />
        <textarea name="description" placeholder="Job Description" onChange={handleChange} required className="w-full p-2 border rounded" />
        <select name="jobType" value={form.jobType} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="Remote">Remote</option>
          <option value="On-site">On-site</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <input name="pay" placeholder="Pay (e.g., $1000/month)" onChange={handleChange} required className="w-full p-2 border rounded" />
        <div className="flex justify-between pt-4">
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 py-2 px-6 rounded text-black font-semibold"
          >
            Post Job
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-yellow-400 hover:bg-yellow-500 py-2 px-6 rounded text-black font-semibold"
          >
            ← Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;