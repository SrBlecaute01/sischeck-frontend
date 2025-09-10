import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import './QRCodeReader.css';

const QRCodeReader = () => {
  const [scanResult, setScanResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
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
      // Primeiro, listar devices disponíveis
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);

      // Tentar acessar câmera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setHasPermission(true);
      setError('');
      // Parar o stream imediatamente
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

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError('');

      if (codeReader.current && videoRef.current) {
        // Tentar encontrar câmera traseira
        let deviceId = undefined;

        if (devices.length > 0) {
          // Procurar por câmera traseira
          const backCamera = devices.find(device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );

          if (backCamera) {
            deviceId = backCamera.deviceId;
          } else if (devices.length > 1) {
            // Se não encontrar, usar a segunda câmera (geralmente é a traseira)
            deviceId = devices[1].deviceId;
          }
        }

        const result = await codeReader.current.decodeOnceFromVideoDevice(
          deviceId,
          videoRef.current
        );

        if (result) {
          setScanResult(result.getText());
          await sendQRData(result.getText());
          stopScanning();
        }
      }
    } catch (err: any) {
      console.error('Erro ao iniciar scan:', err);
      setError(`Erro ao iniciar escaneamento: ${err.message}`);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setIsScanning(false);
  };

  const sendQRData = async (qrCodeContent: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        qrCode: parseInt(qrCodeContent) || 1,
        activityId: 2
      };

      const token = localStorage.getItem('token');

      const response = await fetch('http://192.168.1.110:3056/attendance/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('QR Code processado com sucesso!');
        console.log('Resposta:', data);
      } else {
        setError('Erro ao processar QR Code');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
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

            {!isScanning && (
              <div className="start-scanning">
                <button onClick={startScanning} className="scan-button">
                  📱 Iniciar Escaneamento
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
                <p>📷 Escaneando... Aponte para o QR Code</p>
                <button onClick={stopScanning} className="stop-button">
                  ⏹️ Parar Escaneamento
                </button>
              </div>
            )}
          </div>
        )}

        {scanResult && (
          <div className="scan-result">
            <strong>QR Code lido:</strong> {scanResult}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            Processando QR Code...
          </div>
        )}

        {error && !hasPermission && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeReader;