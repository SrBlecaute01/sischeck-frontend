import Login from '../../components/Login/Login';
import './LoginPage.css';

interface LoginPageProps {
  onLoginSuccess: (token: string, role: string) => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {

  return (
    <div className="login-container">
      <Login onLoginSuccess={onLoginSuccess}></Login>
    </div>
  );
};

export default LoginPage;