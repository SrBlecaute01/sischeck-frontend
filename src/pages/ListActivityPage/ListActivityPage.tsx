import { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import api from '../../config/api';
import './ListActivityPage.css';

interface Activity {
  id: number;
  activityName: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

const ListActivityPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get('/activity', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setActivities(response.data.data);
      } catch (err) {
        setError('Erro ao buscar atividades.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="admin-page-container">
      <Header />
      <h1>Lista de Atividades</h1>
      {loading && <p>Carregando...</p>}
      {error && <div className="error-message">{error}</div>}
      <div className="activity-list">
        {activities.map(activity => (
          <div className="activity-card" key={activity.id}>
            <h2>{activity.activityName}</h2>
            <p>{activity.description}</p>
            <p>
              <strong>Início:</strong>{' '}
              {activity.startDate ? new Date(activity.startDate).toLocaleString() : 'Não informado'}
            </p>
            <p>
              <strong>Término:</strong>{' '}
              {activity.endDate ? new Date(activity.endDate).toLocaleString() : 'Não informado'}
            </p>
            <span className={activity.isActive ? 'active' : 'inactive'}>
              {activity.isActive ? 'Ativa' : 'Inativa'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListActivityPage;