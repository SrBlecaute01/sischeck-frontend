import { useState } from 'react';
import api from '../../config/api';
import './RegisterUserPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { AddCPFmask, maskCPF } from '../../utils/format-cpf';
import logoImage from '../../assets/sisweek-logo.png';

const RegisterUserPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    sobrenome: '',
    email: '',
    cpf: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    if (e.target.name === 'cpf') {
      e.target.value = maskCPF(e.target.value);
    }

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
      const bodyRequest = {
        ...formData,
        name: `${formData.name} ${formData.sobrenome}`,
      }

      const response = await api.post('/auth/register', bodyRequest, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      alert('Usuário cadastrado com sucesso! Faça o login para continuar.');
      navigate('/login');
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
      <div className="login-content">
        <div className="login-logo">
          <img src={logoImage} alt="SisWeek Logo" />
        </div>
        <div className="login-card">
          <h2>Cadastre-se</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor='name'>Nome</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Nome"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor='sobrenome'>Sobrenome</label>
              <input
                id="sobrenome"
                type="text"
                name="sobrenome"
                placeholder="Sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor='cpf'>CPF</label>
              <input
                id="cpf"
                type="text"
                name="cpf"
                placeholder="123.456.789-00"
                value={formData.cpf}
                onChange={handleChange}
                required
              />
            </div>

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
              {loading ? 'Registrando...' : 'Cadastrar'}
            </button>
          </form>
          <div className='register-link'>
            <span>Já possui uma conta? </span>
            <Link to="/login">Faça o login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUserPage;