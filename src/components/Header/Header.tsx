import { useNavigate } from 'react-router-dom';
import './Header.css';
import sisweeklogo from '../../assets/sisweek-logo.png'
import { useEffect, useState } from 'react';

const Header = () => {
   const navigate = useNavigate()

   const [roleUser, setRoleUser] = useState('')


   const navigateToAdminPage = () => {
      navigate('/admin')
   };

    const navigateToParticipantPage = () => {
      navigate('/participante')
   };

   const navigateToActivityPage = () => {
      navigate('/atividades')
   };

   const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      navigate('/')
   }

   useEffect(() => {
      setRoleUser(localStorage.getItem('role') || '')
   }, []);


   return (
      <header className="header-container">
         <div className='img-content'>
            <img src={sisweeklogo} />
         </div>

         <nav>
            <ul>
               <li onClick={navigateToParticipantPage}>Área do Participante</li>
               <li onClick={navigateToActivityPage}>Atividades</li>
               {roleUser === 'ADMIN' ? (
                  <li onClick={navigateToAdminPage}>Área do Administrador</li>
               ) : (
                  ''
               )}
            </ul>
         </nav>

         <div className='right-content'>
            <button onClick={handleLogout}>Sair</button>
         </div>
      </header>
   );
};

export default Header;