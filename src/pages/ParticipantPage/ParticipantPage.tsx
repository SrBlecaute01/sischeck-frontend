import Header from '../../components/Header/Header';
import QRCodeReader from '../../components/QRCodeReader/QRCodeReader';
import './ParticipantPage.css';

const ParticipantPage = () => {

  return (
    <div className="participant-page-container">
      <Header />

      <div className='main-content'>
        <QRCodeReader />
      </div>
    </div>
  );
};

export default ParticipantPage;