import './Card.css';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
   title: string;
   description: string;
   link: string;
}

const Card = ({ title, description, link }: LoginProps) => {

   const navigate = useNavigate()

   const navigateToPageLink = () => {
      navigate(link);
   };


   return (
      <div onClick={navigateToPageLink} className="card-container">
         <h1>{title}</h1>
         <p>{description}</p>
      </div>
   );
};

export default Card;