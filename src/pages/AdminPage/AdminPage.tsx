import Card from '../../components/Card/Card';
import Header from '../../components/Header/Header';
import './AdminPage.css';

const AdminPage = () => {

   return (
      <div className="admin-page-container">
         <Header />
         <div className='main-content'>
            <div className='list-cards'>
               <Card
                  title="Cadastrar Atividade"
                  description="Cadastrar atividades do SisWeek"
                  link='/cadastro-atividades'
               />

               <Card
                  title="Listar Atividades"
                  description="Listar atividades do SisWeek"
                  link='/lista-atividades'
               />
            </div>
         </div>
      </div>
   );
};

export default AdminPage;