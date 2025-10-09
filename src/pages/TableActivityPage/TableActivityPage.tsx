import { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import api from '../../config/api';
import './TableActivityPage.css';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { IoQrCodeSharp } from 'react-icons/io5';
import { MdOutlineDisabledByDefault } from 'react-icons/md';

interface Activity {
  id: number;
  activityName: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  keyword_entry?: string;
  keyword_exit?: string;
}

const TableActivityPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [activityToDeactivate, setActivityToDeactivate] = useState<Activity | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

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

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedActivity) return;

    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';

    setSelectedActivity({
      ...selectedActivity,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    setUpdateLoading(true);
    try {
      const { id, ...updateData } = selectedActivity;

      const payload = {
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate).toISOString() : null,
        endDate: updateData.endDate ? new Date(updateData.endDate).toISOString() : null,
      };

      const response = await api.put(`/activity/${id}`, payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setActivities(prev => prev.map(act => act.id === id ? response.data.data : act));
      alert('Atividade atualizada com sucesso!');
      handleModalClose();

    } catch (err) {
      alert('Erro ao atualizar atividade.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleOpenDeactivateModal = (activity: Activity) => {
    setActivityToDeactivate(activity);
    setIsDeactivateModalOpen(true);
  };

  const handleCloseDeactivateModal = () => {
    setIsDeactivateModalOpen(false);
    setActivityToDeactivate(null);
  };

  const handleDeactivateConfirm = async () => {
    if (!activityToDeactivate) return;

    setDeactivateLoading(true);
    try {
      const payload = { ...activityToDeactivate, isActive: false };

      const response = await api.put(`/activity/${activityToDeactivate.id}`, payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setActivities(prev => prev.map(act => act.id === activityToDeactivate.id ? response.data.data : act));
      alert('Atividade desativada com sucesso!');
      handleCloseDeactivateModal();

    } catch (err) {
      alert('Erro ao desativar atividade.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleDownloadPDF = (activityId: number) => {
    console.log('Download PDF da atividade:', activityId);
  };

  const handleDownloadExcel = (activityId: number) => {
    console.log('Download Excel da atividade:', activityId);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatToDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
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
                          onClick={() => handleEdit(activity)}
                          className="action-btn edit-btn"
                          title="Editar atividade"
                        >
                          <FaEdit />
                        </button>

                        {activity.isActive ?
                          <button
                            onClick={() => handleOpenDeactivateModal(activity)}
                            className="action-btn delete-btn"
                            title="Desativar atividade"
                          >
                            <MdOutlineDisabledByDefault />
                          </button>
                          :
                          <button
                            onClick={() => handleOpenDeactivateModal(activity)}
                            className="action-btn delete-btn"
                            title="Desativar atividade"
                            disabled
                          >
                            <MdOutlineDisabledByDefault />
                          </button>
                        }

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

      {/* --- Modal de Edição (já existente) --- */}
      {isModalOpen && selectedActivity && (
        <div className="modal-backdrop" onClick={handleModalClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Atividade</h2>
              <button onClick={handleModalClose} className="modal-close-btn">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="activityName">Nome da Atividade</label>
                <input
                  id="activityName"
                  name="activityName"
                  type="text"
                  value={selectedActivity.activityName}
                  onChange={handleModalInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  name="description"
                  value={selectedActivity.description}
                  onChange={handleModalInputChange}
                  rows={4}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="startDate">Data de Início</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formatToDateTimeLocal(selectedActivity.startDate)}
                  onChange={handleModalInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">Data de Término</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formatToDateTimeLocal(selectedActivity.endDate)}
                  onChange={handleModalInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="keyword_entry">Palavra-Chave Entrada</label>
                <input
                  id="keyword_entry"
                  name="keyword_entry"
                  type="text"
                  value={selectedActivity.keyword_entry || ''}
                  onChange={handleModalInputChange}
                  placeholder="Ex: ENTRADA_PALESTRA_IA"
                />
              </div>
              <div className="form-group">
                <label htmlFor="keyword_exit">Palavra-Chave Saída</label>
                <input
                  id="keyword_exit"
                  name="keyword_exit"
                  type="text"
                  value={selectedActivity.keyword_exit || ''}
                  onChange={handleModalInputChange}
                  placeholder="Ex: SAIDA_PALESTRA_IA"
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleModalClose} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={updateLoading}>
                  {updateLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NOVO MODAL: Desativação de Atividade --- */}
      {isDeactivateModalOpen && activityToDeactivate && (
        <div className="modal-backdrop" onClick={handleCloseDeactivateModal}>
          <div className="modal-content confirmation-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Desativar Atividade</h2>
              <button onClick={handleCloseDeactivateModal} className="modal-close-btn">
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Tem certeza que deseja marcar a atividade
                <strong> "{activityToDeactivate.activityName}" </strong>
                como "Inativa"?
              </p>
              <span>Esta ação não removerá a atividade permanentemente.</span>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={handleCloseDeactivateModal} className="btn-cancel">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeactivateConfirm}
                className="btn-confirm-delete"
                disabled={deactivateLoading}
              >
                {deactivateLoading ? 'Desativando...' : 'Sim, Desativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableActivityPage;
