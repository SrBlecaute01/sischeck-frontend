import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Header from '../../components/Header/Header';
import api from '../../config/api';
import './MyActivityPage.css';

interface Activity {
  id: number;
  activityName: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

interface AttendanceRecord {
  id: number;
  userId: number;
  activityId: number;
  registeredAt: string;
  entryTime: string | null;
  exitTime: string | null;
  isActive: boolean;
  created_at: string;
  updated_at: string;
  participant_id: null;
  activity_id: number;
}

interface AttendanceWithActivity extends AttendanceRecord {
  activity?: Activity;
}

interface MyJwtPayload {
  id: number;
  name: string;
  email: string;
}

const ITEMS_PER_PAGE = 6;

const MyActivityPage = () => {
  const [attendances, setAttendances] = useState<AttendanceWithActivity[]>([]);
  const [paginatedAttendances, setPaginatedAttendances] = useState<AttendanceWithActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        setUserName(decoded.name);
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
      }
    }

    fetchMyActivities();
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedAttendances(attendances.slice(startIndex, endIndex));
  }, [currentPage, attendances]);

  const fetchMyActivities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let userId = 0;

      if (token) {
        const decoded = jwtDecode<MyJwtPayload>(token);
        userId = decoded.id;
      }

      if (!userId) {
        setError('Usuário não autenticado.');
        return;
      }

      const attendanceResponse = await api.get(`/activity/${userId}/myActivities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const attendanceRecords: AttendanceRecord[] = attendanceResponse.data.data;

      const attendancesWithActivities = await Promise.all(
        attendanceRecords.map(async (attendance) => {
          try {
            const activityResponse = await api.get(`/activity/${attendance.activityId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            return {
              ...attendance,
              activity: activityResponse.data.data
            };
          } catch (err) {
            console.error(`Erro ao buscar atividade ${attendance.activityId}:`, err);
            return {
              ...attendance,
              activity: {
                id: attendance.activityId,
                activityName: 'Atividade não encontrada',
                description: 'Detalhes não disponíveis',
                startDate: null,
                endDate: null,
                isActive: false
              }
            };
          }
        })
      );

      setAttendances(attendancesWithActivities);
      setTotalPages(Math.ceil(attendancesWithActivities.length / ITEMS_PER_PAGE));
    } catch (err) {
      setError('Erro ao buscar suas atividades.');
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (attendance: AttendanceWithActivity) => {
    const { entryTime, exitTime } = attendance;
    const activity = attendance.activity;

    if (!activity || !activity.isActive) {
      return { text: 'Atividade Encerrada', class: 'status-finished' };
    }

    if (entryTime && exitTime) {
      return { text: 'Concluída', class: 'status-completed' };
    }

    if (entryTime && !exitTime) {
      const now = new Date();
      const activityEnd = activity.endDate ? new Date(activity.endDate) : null;

      if (activityEnd && now > activityEnd) {
        return { text: 'Presença Pendente', class: 'status-pending' };
      }

      return { text: 'Em Andamento', class: 'status-ongoing' };
    }

    return { text: 'Não Iniciada', class: 'status-not-started' };
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Não registrado';

    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Não informado';

    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="my-activity-page-container">
        <Header />
        <div className="loading-container">
          <p>Carregando suas atividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-activity-page-container">
      <Header />

      <div className="page-header">
        <h1>Minhas Atividades</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="activities-list-wrapper">
        <div className="activities-list">
          {paginatedAttendances.length > 0 ? (
            paginatedAttendances.map(attendance => {
              const status = getStatusBadge(attendance);
              const activity = attendance.activity;

              return (
                <div className="activity-card" key={attendance.id}>
                  <div className="activity-header">
                    <h2>{activity?.activityName || 'Atividade sem nome'}</h2>
                    <span className={`status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </div>

                  <div className="activity-description">
                    <p>{activity?.description || 'Sem descrição'}</p>
                  </div>

                  <div className="activity-dates">
                    <div className="date-info">
                      <span className="label">Período:</span>
                      <span className="period-value">
                        {formatDate(activity?.startDate)} até {formatDate(activity?.endDate)}
                      </span>
                    </div>
                  </div>

                  <div className="attendance-info">
                    <div className="attendance-item">
                      <span className="label">Entrada:</span>
                      <span className={`value ${attendance.entryTime ? 'registered' : 'not-registered'}`}>
                        {formatDateTime(attendance.entryTime)}
                      </span>
                    </div>
                    <div className="attendance-item">
                      <span className="label">Saída:</span>
                      <span className={`value ${attendance.exitTime ? 'registered' : 'not-registered'}`}>
                        {formatDateTime(attendance.exitTime)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-data-container">
              <p className="no-data-text">Você ainda não está participando de nenhuma atividade.</p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

export default MyActivityPage;