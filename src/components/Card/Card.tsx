import './Card.css';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
   title: string;
   description: string;
   link: string;
   icon?: React.ReactNode;
}

const Card = ({ title, description, link, icon }: LoginProps) => {

   const navigate = useNavigate()

   const navigateToPageLink = () => {
      navigate(link);
   };


   return (
      <div onClick={navigateToPageLink} className="card-container">
         <div className="card-header">
            {icon && <div className="card-icon">{icon}</div>}
            <h1>{title}</h1>
         </div>
         <p>{description}</p>
      </div>
   );
};

export default Card;