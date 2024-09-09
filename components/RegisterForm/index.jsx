import React, { useState } from 'react';
import axios from 'axios';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    login_name: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post('/admin/register', formData);
      // Update application state to indicate user is logged in
      // and update the toolbar to display the user's first name
    } catch (err) {
      setError(err.response.data.error);
    }
  };

  return (
    <div>
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleChange}
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleChange}
      />
      <input
        type="text"
        name="login_name"
        placeholder="Login Name"
        value={formData.login_name}
        onChange={handleChange}
      />
      <button onClick={handleRegister}>Register</button>
      {error && <div>{error}</div>}
    </div>
  );
};

export default RegisterForm;