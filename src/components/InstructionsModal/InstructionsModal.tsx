import { useEffect, useRef } from 'react';
import './InstructionsModal.css';
import { IoIosInformationCircleOutline, IoMdClose } from 'react-icons/io';

interface InstructionsModalProps {
  onClose: () => void;
}

const InstructionsModal = ({ onClose }: InstructionsModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div 
      className="instructions-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="instructions-modal" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <button 
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          <IoMdClose />
        </button>

        <div className="modal-header">
          <div className="modal-icon-wrapper">
            <IoIosInformationCircleOutline className="modal-icon" />
          </div>
          <h2>Como registrar sua presença</h2>
        </div>

        <div className="modal-content">
          <div className="instruction-item">
            <span className="instruction-number">1</span>
            <p>A sua presença nas atividades será confirmada pela leitura de QR Codes.</p>
          </div>
          
          <div className="instruction-item">
            <span className="instruction-number">2</span>
            <p>
              Durante cada atividade, serão disponibilizados dois códigos: um para <strong>entrada</strong> e outro para <strong>saída</strong>.
            </p>
          </div>
          
          <div className="instruction-item">
            <span className="instruction-number">3</span>
            <p>
              É fundamental que você realize a leitura de <strong>ambos</strong> os QR Codes para que sua presença seja validada.
            </p>
          </div>

          <div className="instruction-highlight">
            <p>
              💡 Você pode acompanhar suas atividades na seção <strong>"Minhas Atividades"</strong>.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-primary" onClick={onClose}>
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;