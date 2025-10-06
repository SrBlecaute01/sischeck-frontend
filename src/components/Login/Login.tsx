import { useState } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { jwtDecode } from 'jwt-decode';
import { maskCPF, removeCPFMask } from '../../utils/format-cpf';

interface LoginPageProps {
  onLoginSuccess: (token: string, role: string) => void;
}

const Login = ({ onLoginSuccess }: LoginPageProps) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    cpf: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setFormData({
        ...formData,
        cpf: maskCPF(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanCpf = removeCPFMask(formData.cpf)
      const response = await api.post('/auth/login', { ...formData, cpf: cleanCpf }, {
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

      window.location.reload();
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
              <label htmlFor='cpf'>CPF</label>
              <input
                id="cpf"
                type="tel"
                name="cpf"
                placeholder="CPF"
                value={maskCPF(formData.cpf)}
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
          <div className='register-link'>
            <span>Não possui uma conta? </span>
            <Link to="/cadastro">Cadastre-se</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;