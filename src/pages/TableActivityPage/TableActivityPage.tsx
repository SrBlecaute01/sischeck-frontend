import { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import api from '../../config/api';
import './TableActivityPage.css';
import { FaEdit, FaTrash, FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { IoQrCodeSharp } from 'react-icons/io5';

interface Activity {
  id: number;
  activityName: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

const TableActivityPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

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

  const handleEdit = (activityId: number) => {
    console.log('Editar atividade:', activityId);
  };

  const handleDelete = async (activityId: number, activityName: string) => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir a atividade "${activityName}"?`);

    if (!confirmed) return;

    setDeleteLoading(activityId);
    try {
      await api.delete(`/activity/${activityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Remove a atividade da lista local
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      alert('Atividade excluída com sucesso!');
    } catch (err) {
      alert('Erro ao excluir atividade.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDownloadPDF = (activityId: number) => {
    // Implementar download PDF
    console.log('Download PDF da atividade:', activityId);
    // Exemplo: window.open(`/api/activity/${activityId}/pdf`, '_blank');
  };

  const handleDownloadExcel = (activityId: number) => {
    // Implementar download Excel
    console.log('Download Excel da atividade:', activityId);
    // Exemplo: window.open(`/api/activity/${activityId}/excel`, '_blank');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="table-page-container">
        <Header />
        <div className="loading-container">
          <p>Carregando atividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-page-container">
      <Header />

      <div className="page-header">
        <h1>Gerenciar Atividades</h1>
        <p>Tabela completa com todas as atividades cadastradas</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchActivities} className="retry-btn">
            Tentar novamente
          </button>
        </div>
      )}

      <div className="table-container">
        <div className="table-wrapper">
          <table className="activities-table">
            <thead>
              <tr>
                <th>Nome da Atividade</th>
                <th>Descrição</th>
                <th>Data de Início</th>
                <th>Data de Término</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data">
                    Nenhuma atividade encontrada
                  </td>
                </tr>
              ) : (
                activities.map(activity => (
                  <tr key={activity.id}>
                    <td className="name-cell">
                      <div className="activity-name">
                        {activity.activityName}
                      </div>
                    </td>
                    <td className="description-cell">
                      <div className="description-text">
                        {activity.description}
                      </div>
                    </td>
                    <td className="date-cell">
                      {formatDate(activity.startDate)}
                    </td>
                    <td className="date-cell">
                      {formatDate(activity.endDate)}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${activity.isActive ? 'active' : 'inactive'}`}>
                        {activity.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(activity.id)}
                          className="action-btn edit-btn"
                          title="Editar atividade"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => handleDelete(activity.id, activity.activityName)}
                          className="action-btn delete-btn"
                          title="Excluir atividade"
                          disabled={deleteLoading === activity.id}
                        >
                          {deleteLoading === activity.id ? '...' : <FaTrash />}
                        </button>

                        <button
                          onClick={() => handleDownloadPDF(activity.id)}
                          className="action-btn download-btn pdf-btn"
                          title="Download QRCode Entrada"
                        >
                          <IoQrCodeSharp />
                        </button>

                        <button
                          onClick={() => handleDownloadExcel(activity.id)}
                          className="action-btn download-btn excel-btn"
                          title="Download QRCode Saída"
                        >
                          <IoQrCodeSharp />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-footer">
        <p>Total de atividades: <strong>{activities.length}</strong></p>
      </div>
    </div>
  );
};

export default TableActivityPage;
