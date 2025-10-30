import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import './QRCodeReader.css';
import api from '../../config/api';
import { jwtDecode } from 'jwt-decode';
import {useNavigate} from "react-router-dom";

interface MyJwtPayload {
  id: number;
  email: string,
  role: string
}

const QRCodeReader = () => {
  const [, setScanResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [showReadConfirmation, setShowReadConfirmation] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    checkCameraPermission();

    return () => stopScanning();
  }, []);

  useEffect(() => {
    if (success) setShowSuccessModal(true);
  }, [success]);

  useEffect(() => {
    if (error) setShowErrorModal(true);
  }, [error]);

  const getErrorMessage = (err: unknown) => {
    if (!err) return 'Erro desconhecido';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    try {
      const anyErr = err as any;
      if (anyErr && anyErr.message) return String(anyErr.message);
      return JSON.stringify(err);
    } catch {
      return 'Erro desconhecido';
    }
  };

  const checkCameraPermission = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter((device) => device.kind === 'videoinput');
      setDevices(videoDevices);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setHasPermission(true);
      setError('');

      const tracks = stream.getVideoTracks();
      if (tracks.length > 0) {
        const settings = tracks[0].getSettings();
        if (settings.facingMode) setIsFrontCamera(settings.facingMode === 'user');
      }

      stream.getTracks().forEach((track) => track.stop());
    } catch (err: unknown) {
      setHasPermission(false);
      console.error('Erro ao acessar câmera:', err);

      const msg = getErrorMessage(err);
      if (msg.includes('NotAllowedError') || msg.toLowerCase().includes('permission')) {
        setError('Permissão de câmera negada. Por favor, permita o acesso à câmera.');
      } else if (msg.includes('NotFoundError')) {
        setError('Nenhuma câmera encontrada no dispositivo.');
      } else if (msg.includes('NotSupportedError')) {
        setError('Navegador não suporta acesso à câmera.');
      } else {
        setError('Erro ao acessar câmera. Tente usar HTTPS ou um navegador diferente.');
      }
    }
  };

  const isDeviceFrontByLabel = (label: string) => {
    const l = label.toLowerCase();
    if (!l) return null;
    if (l.includes('front') || l.includes('user') || l.includes('selfie') || l.includes('frontal')) return true;
    if (l.includes('back') || l.includes('rear') || l.includes('environment') || l.includes('traseira')) return false;
    return null;
  };

  useEffect(() => {
    if (showReadConfirmation) {
      const timer = setTimeout(() => {
        setShowReadConfirmation(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showReadConfirmation]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError('');

      if (codeReader.current && videoRef.current) {
        let deviceId = undefined;
        let chosenDevice: MediaDeviceInfo | undefined;

        if (devices.length > 0) {
          const backCamera = devices.find(device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );

          if (backCamera) {
            deviceId = backCamera.deviceId;
            chosenDevice = backCamera;
          } else if (devices.length > 1) {
            deviceId = devices[1].deviceId;
            chosenDevice = devices[1];
          } else {
            deviceId = devices[0].deviceId;
            chosenDevice = devices[0];
          }
        }

        if (chosenDevice && chosenDevice.label) {
          const heuristic = isDeviceFrontByLabel(chosenDevice.label);
          if (heuristic !== null) setIsFrontCamera(heuristic);
        }

        const result = await codeReader.current.decodeOnceFromVideoDevice(deviceId, videoRef.current);
        if (result) {
          const qrCodeContent = result.getText();

          if (!qrCodeContent.includes(';')) {
            setError('QR Code inválido. Tente novamente.');
            stopScanning();
            return;
          }

          setScanResult(result.getText());
          setShowReadConfirmation(true)

          const parts = qrCodeContent.split(';')
          const firstContentQrCode = parts[0] ? parts[0].trim() : '';
          const secondContentQrCode = parts[1] ? parts[1].trim() : '';

          await sendQRData(firstContentQrCode, secondContentQrCode);
          stopScanning();
        }
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (!msg.includes('Video stream has ended')) {
        console.error('Erro ao iniciar scan:', err);
        setError(`Erro ao iniciar escaneamento: ${msg}`);
      } else {
        console.log('Scan interrompido pelo usuário.');
      }
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  const sendQRData = async (activityId: string, keyword: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    let userIdSession = 0;
    if (token) {
      const decoded = jwtDecode<MyJwtPayload>(token);
      userIdSession = decoded.id
      console.log('content: ', decoded)
    }

    try {
      const requestData = {
        qrCode: userIdSession,
        activityId: parseInt(activityId),
        keyword
      };

      const token = localStorage.getItem('token');
      const response = await api.post('/attendance/qr', requestData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSuccess('QR Code processado com sucesso!');
      } else {
        setError(response.data.error || 'Ocorreu um erro desconhecido.');
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      try {
        const anyErr = err as any;
        if (anyErr.response && anyErr.response.data && anyErr.response.data.error) {
          setError(anyErr.response.data.error);
        } else {
          setError('Erro de conexão com o servidor.');
        }
      } catch {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setError('');
    setSuccess('');
    setShowErrorModal(false);
    setShowSuccessModal(false);
  }

  const errorMappings: Array<[string, string]> = [
    ["Entrada já registrada", "A sua entrada já foi registrada!"],
    ["Saída já registrada", "A sua saída já foi registrada!"],
    ["saída sem entrada", "Não é possível registrar a saída sem o registro da entrada"],
  ];

  const getFriendlyErrorMessage = (err: string) => {
    if (!err) return "Erro desconhecido";
    const lower = err.toLowerCase();
    for (const [key, msg] of errorMappings) {
      if (lower.includes(key.toLowerCase())) return msg;
    }
    return err;
  };

  return (
    <div className="qr-container">
      <div className="qr-card">
        <h2>Leitor de QR Code</h2>

        {hasPermission === null && (
          <div className="loading-message">
            Verificando permissões da câmera...
          </div>
        )}

        {hasPermission === false && (
          <div className="permission-error">
            <p>❌ Erro de acesso à câmera</p>
            <p>{error}</p>
            <button onClick={checkCameraPermission} className="retry-button">
              Tentar Novamente
            </button>
            <div className="help-text">
              <p><strong>Dicas:</strong></p>
              <ul>
                <li>Certifique-se de permitir acesso à câmera</li>
                <li>Tente usar Chrome ou Firefox</li>
                <li>No celular, use a URL com HTTPS se possível</li>
              </ul>
            </div>
          </div>
        )}

        {hasPermission === true && (
          <div className="qr-reader-wrapper">
            <video
              ref={videoRef}
              className="qr-video"
              style={{
                display: isScanning ? 'block' : 'none',
                transform: isFrontCamera ? 'scaleX(-1)' : 'none',
              }}
              playsInline
              muted
              autoPlay
            />

            {isScanning && (
              <>
                <div className="scan-frame"></div>
                <div className="scan-corners"><span></span></div>
                <div className="scan-line"></div>
              </>
            )}
          </div>
        )}

        {!isScanning && (
          <div className="start-scanning">
            <button onClick={startScanning} className="scan-button">
              Iniciar Escaneamento
            </button>
            {devices.length > 0 && (
              <p className="device-info">
                {devices.length} câmera(s) encontrada(s)
              </p>
            )}
          </div>
        )}

        {isScanning && (
          <div className="scanning-controls">
            <p>Escaneando... Aponte para o QR Code</p>
            <button onClick={stopScanning} className="stop-button">
              Parar Escaneamento
            </button>
          </div>
        )}

        {loading && (
          <div className="loading-message">
            Processando QR Code...
          </div>
        )}

        {showErrorModal && (
            <div className="error-modal-overlay" role="alertdialog" aria-modal="true">
              <div className="error-modal">
                <h3>Erro</h3>
                <p className="error-modal-text">{getFriendlyErrorMessage(error)}
                </p>
                <div className="error-modal-actions">
                  <button
                      className="retry-button"
                      onClick={() => {
                        setError('');
                        setShowErrorModal(false);
                        startScanning();
                      }}>
                    Tentar Novamente
                  </button>
                  <button
                      className="stop-button"
                      onClick={() => {
                        closeModals();
                        navigate("/minhas-atividades");
                      }}>
                    Fechar
                  </button>
                </div>
              </div>
            </div>
        )}

        {showSuccessModal && (
            <div className="success-modal-overlay" role="dialog" aria-modal="true">
              <div className="success-modal">
                <h3>Sucesso</h3>
                <p className="success-modal-text">{success}</p>
                <div className="success-modal-actions">
                  <button
                      className="scan-button"
                      onClick={() => {
                        setShowSuccessModal(false);
                        setSuccess('');
                        startScanning();
                      }}>
                    Escanear Outro
                  </button>
                  <button
                      className="stop-button"
                      onClick={() => {
                        closeModals();
                        navigate("/minhas-atividades");
                      }}>
                    Fechar
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeReader;