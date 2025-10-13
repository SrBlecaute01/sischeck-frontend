import { useState } from 'react';
import Header from '../../components/Header/Header';
import api from '../../config/api';
import './RegisterActivityPage.css';

const RegisterActivityPage = () => {
  const [form, setForm] = useState<any>({
    activityName: '',
    description: '',
    keyword_entry: '',
    keyword_exit: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'keyword_entry' || name === 'keyword_exit') {
      setForm({ ...form, [name]: value.toUpperCase() });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      setError('A data de término não pode ser anterior à data de início.');
      setLoading(false);
      return;
    }

    try {
      const bodyRequest = {
        ...form,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      }
      await api.post('/activity', bodyRequest, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccess('Atividade cadastrada com sucesso!');
      setForm({ activityName: '', description: '', keyword_entry: '', keyword_exit: '', startDate: '', endDate: '' });
    } catch (err) {
      setError('Erro ao cadastrar atividade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <Header />
      <div className='title-name'>
        <h1>Cadastro de Atividade</h1>
      </div>
      <form className="register-activity-form" onSubmit={handleSubmit}>
        <div className="form-group-register">
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
        <div className="form-group-register">
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
        <div className="form-group-register">
          <label htmlFor="keyword_entry">Palavra-Chave Entrada</label>
          <input
            id="keyword_entry"
            name="keyword_entry"
            type='text'
            value={form.keyword_entry}
            onChange={handleChange}
            required
            placeholder="PENEDO"
          />
        </div>
        <div className="form-group-register">
          <label htmlFor="keyword_exit">Palavra-Chave Saída</label>
          <input
            id="keyword_exit"
            name="keyword_exit"
            type='text'
            value={form.keyword_exit}
            onChange={handleChange}
            required
            placeholder="ROCHEDO"
          />
        </div>
        <div className="form-group-register">
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
        <div className="form-group-register">
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