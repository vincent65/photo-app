import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
  const [loginName, setLoginName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('/admin/login', { login_name: loginName });
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
        placeholder="Login Name"
        value={loginName}
        onChange={(e) => setLoginName(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {error && <div>{error}</div>}
    </div>
  );
};

export default LoginForm;