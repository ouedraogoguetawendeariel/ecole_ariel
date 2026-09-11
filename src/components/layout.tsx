import { Outlet } from 'react-router-dom';
import Menu from './Menu';
import Footer from './footer';

export default function Layout() {
    return (
        <div className="page-wrapper">
            <Menu />
            <main className="page-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}