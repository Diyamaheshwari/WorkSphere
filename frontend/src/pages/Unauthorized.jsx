import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'manager') return '/dashboard/manager';
    return '/dashboard/user';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6 text-sm">
            You do not have permission to access this page. Your role is{' '}
            <span className="font-semibold capitalize text-red-600">{user?.role || 'Guest'}</span>.
          </p>
          <Link
            to={getDashboardPath()}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow transition duration-150"
          >
            Return to Your Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
