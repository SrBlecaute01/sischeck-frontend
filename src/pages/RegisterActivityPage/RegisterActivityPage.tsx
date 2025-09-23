import { useState } from 'react';
import Header from '../../components/Header/Header';
import api from '../../config/api';
import './RegisterActivityPage.css';

const RegisterActivityPage = () => {
  const [form, setForm] = useState({
    activityName: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await api.post('/activity', form, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccess('Atividade cadastrada com sucesso!');
      setForm({ activityName: '', description: '', startDate: '', endDate: '' });
    } catch (err) {
      setError('Erro ao cadastrar atividade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <Header />
      <h1>Cadastro de Atividade</h1>
      <form className="register-activity-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="activityName">Nome da Atividade</label>
          <input
            id="activityName"
            name="activityName"
            type="text"
            value={form.activityName}
            onChange={handleChange}
            required
            placeholder="Ex: Minicurso de Python"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            placeholder="Ex: Minicurso ministrado pelo professor Jario"
          />
        </div>
        <div className="form-group">
          <label htmlFor="startDate">Data de Início</label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">Data de Término</label>
          <input
            id="endDate"
            name="endDate"
            type="datetime-local"
            value={form.endDate}
            onChange={handleChange}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
};

export default RegisterActivityPage;