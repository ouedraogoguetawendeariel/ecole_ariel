import { Navigate } from 'react-router-dom';

interface Props {
    children: React.ReactNode;
}

export default function RouteAdmin({ children }: Props) {
    const userData = localStorage.getItem('user');

    if (!userData) {
        return <Navigate to="/connexion" replace />;
    }

    const user = JSON.parse(userData);

    if (user.role !== 'admin') {
        return <Navigate to="/tableau-de-bord" replace />;
    }

    return <>{children}</>;
}