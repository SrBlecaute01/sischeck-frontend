import { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      localStorage.setItem('token', response.data.data.token);

      const token = localStorage.getItem('token');
      console.log(token)
      if (token) {
        const decoded: any = jwtDecode(token);

        const userRole = decoded.role;
        localStorage.setItem('role', userRole)
      }

      navigate('/participante');
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError('Credenciais inválidas');
      } else {
        setError('Erro ao conectar com o servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className='content-left'>
      </div>

      <div className='content-rigth'>
        <div className="login-card">
          <h2>Login com sua conta</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor='email'>Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor='password'>Senha</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Senha"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className='btn-login'>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;