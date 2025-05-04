import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const JobDetails = () => {
  const { id } = useParams();
  const { uploadResumeToIPFS, applyToJob, user, role } = useUser();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [resume, setResume] = useState(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/jobs/${id}`)
      .then((res) => res.json())
      .then(setJob)
      .catch(console.error);

    if (user && user._id && role === 'individual') {
      fetch(`http://localhost:5000/api/jobs/${id}/has-applied/${user._id}`)
        .then((res) => res.json())
        .then(data => setHasApplied(data.applied))
        .catch(err => console.error('Check apply status error:', err));
    }

    if (role === 'organization') {
      fetch(`http://localhost:5000/api/jobs/${id}/applicants`)
        .then(res => res.json())
        .then(setApplicants)
        .catch(console.error);
    }
  }, [id, user, role]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume || !email || !phone) {
      return setMessage('Please fill out all fields.');
    }

    try {
      const resumeUrl = await uploadResumeToIPFS(resume);
      const result = await applyToJob(id, resumeUrl, email, phone);

      if (result.success !== false) {
        setMessage('Your application was submitted successfully!');
        setTimeout(() => {
          setHasApplied(true);
          setMessage('');
        }, 2000);
      } else {
        setMessage('You have already applied to this job.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to apply. Please try again.');
    }
  };

  const handleRemoveApplicant = async (applicantId) => {
    const confirm = window.confirm("Are you sure you want to remove this applicant?");
    if (!confirm) return;
  
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}/applicants/${applicantId}`, {
        method: 'DELETE',
      });
  
      if (!res.ok) throw new Error('Failed to remove applicant.');
  
      setApplicants(prev => prev.filter(app => app._id !== applicantId));
    } catch (err) {
      console.error(err);
      alert("Could not remove applicant.");
    }
  };
  
  if (!job) return <p className="p-8">Loading...</p>;

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 py-10">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
        <p className="mb-2">{job.description}</p>
        <p className="mb-2 font-medium">Type: {job.jobType}</p>
        <p className="mb-4 font-medium">Pay: {job.pay}</p>
        <hr className="my-4" />

        {/* User Application Form */}
        {role === 'individual' && !hasApplied && (
          <form onSubmit={handleApply} className="space-y-4 bg-white">
            <div>
              <label className="block text-sm font-medium">Email:</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone Number:</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Upload Resume (PDF, JPG, PNG):</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setResume(e.target.files[0])}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 py-2 px-4 rounded text-black font-semibold"
            >
              Apply
            </button>

            {message && (
              <p className={`text-sm mt-2 ${
                message.startsWith('') ? 'text-green-600' :
                message.startsWith('') ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {message}
              </p>
            )}
          </form>
        )}

        {role === 'individual' && hasApplied && (
           <>
           <p className="text-green-600 font-medium mt-4">
             You’ve already applied to this job.
           </p>
       
           <button
             onClick={() => window.history.back()}
             className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded"
           >
             Back
           </button>
         </>
        )}

        {/* Organization View: Applicants */}
        {role === 'organization' && (
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-4">Applicants</h3>
            {applicants.length === 0 ? (
              <p>No one has applied yet.</p>
            ) : (
              <ul className="space-y-4">
                {applicants.map((app) => (
                  <li key={app._id} className="border p-4 rounded bg-gray-50 shadow">
                    <p className="text-lg font-semibold text-gray-800">
                      <span
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() => navigate(`/user/${app.userId?._id}`)}
                      >
                        {app.userId?.name}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">Email: {app.email}</p>
                    <p className="text-sm text-gray-600">Phone: {app.phone}</p>

                    <div className="flex justify-between items-center mt-4">
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded"
                      >
                        View Resume
                      </a>
                      <button
                        onClick={() => handleRemoveApplicant(app._id)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded"
                      >
                        Remove Applicant
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => window.history.back()}
              className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;