import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import './QRCodeReader.css';
import api from '../../config/api';
import { jwtDecode } from 'jwt-decode';

interface MyJwtPayload {
  id: number;
  email: string,
  role: string
}

const QRCodeReader = () => {
  const [, setScanResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [showReadConfirmation, setShowReadConfirmation] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    checkCameraPermission();

    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setHasPermission(true);
      setError('');
      stream.getTracks().forEach(track => track.stop());
    } catch (err: any) {
      setHasPermission(false);
      console.error('Erro ao acessar câmera:', err);

      if (err.name === 'NotAllowedError') {
        setError('Permissão de câmera negada. Por favor, permita o acesso à câmera.');
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera encontrada no dispositivo.');
      } else if (err.name === 'NotSupportedError') {
        setError('Navegador não suporta acesso à câmera.');
      } else {
        setError('Erro ao acessar câmera. Tente usar HTTPS ou um navegador diferente.');
      }
    }
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

        if (devices.length > 0) {
          const backCamera = devices.find(device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );

          if (backCamera) {
            deviceId = backCamera.deviceId;
          } else if (devices.length > 1) {
            deviceId = devices[1].deviceId;
          }
        }

        const result = await codeReader.current.decodeOnceFromVideoDevice(
          deviceId,
          videoRef.current
        );

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
    } catch (err: any) {
      if (err && err.message && !err.message.includes('Video stream has ended')) {
        console.error('Erro ao iniciar scan:', err);
        setError(`Erro ao iniciar escaneamento: ${err.message}`);
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
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro de conexão com o servidor.');
      }
    } finally {
      setLoading(false);
    }
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
              style={{ display: isScanning ? 'block' : 'none' }}
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

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={startScanning} className="retry-button">
              Tentar Novamente
            </button>
          </div>
        )}

        {success && (
          <div className="success-message">
            <p>{success}</p>
            <button onClick={startScanning} className="scan-button">
              Escanear Outro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeReader;