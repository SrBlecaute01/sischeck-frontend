import Card from '../../components/Card/Card';
import Header from '../../components/Header/Header';
import { FaRegEdit, FaListUl } from 'react-icons/fa';
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
                  icon={<FaRegEdit size={20} />}
               />

               <Card
                  title="Listar Atividades"
                  description="Listar atividades do SisWeek"
                  link='/acoes-atividades'
                  icon={<FaListUl size={20} />}
               />
            </div>
         </div>
      </div>
   );
};

export default AdminPage;