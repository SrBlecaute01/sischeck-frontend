import { useNavigate } from 'react-router-dom';
import './Header.css';
import sisweeklogo from '../../assets/sisweek-newlogo.svg'
import { useEffect, useState } from 'react';

const Header = () => {
   const navigate = useNavigate()
   const [roleUser, setRoleUser] = useState('')
   const [menuOpen, setMenuOpen] = useState(false)

   const navigateToAdminPage = () => navigate('/admin');
   const navigateToParticipantPage = () => navigate('/participante');
   const navigateToActivityPage = () => navigate('/atividades');

   const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      window.location.reload()
   }

   useEffect(() => {
      setRoleUser(localStorage.getItem('role') || '')
   }, []);

   return (
      <header className="header-container">
         <div className='img-content'>
            <img src={sisweeklogo} alt="SisWeek Logo" />
         </div>

         <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
         >
            <span className="hamburger"></span>
         </button>

         <nav className={menuOpen ? "nav-menu open" : "nav-menu"}>
            <ul>
               <li onClick={navigateToParticipantPage}>Área do Participante</li>
               <li onClick={navigateToActivityPage}>Atividades</li>
               {roleUser === 'ADMIN' && (
                  <li onClick={navigateToAdminPage}>Área do Administrador</li>
               )}
               <li className="mobile-logout">
                  <button onClick={handleLogout}>Sair</button>
               </li>
            </ul>
         </nav>

         <div className='right-content'>
            <button onClick={handleLogout}>Sair</button>
         </div>
      </header>
   );
};

export default Header;