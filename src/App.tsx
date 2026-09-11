import { Routes, Route, Navigate } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Formations from './pages/Formations';
import Situation from './pages/Situation';
import Contacter from './pages/Contacter';
import Layout from './components/layout';
import Actualites from './pages/Actualites';
import Utilisateur from './pages/Utilisateur';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import TableauDeBord from './pages/TableauDeBord';
import RouteAdmin from './components/RouteAdmin';
import AdminBulletin from './pages/AdminBulletin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEleves from './pages/AdminEleves';
import AdminNotes from './pages/AdminNotes';
import Resultats from './pages/Resultats';

import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/accueil" replace />} />
        <Route path="/accueil" element={<Accueil />} />
        <Route path="/formations" element={<Formations />}/>
        <Route path="/actualites" element={<Actualites />} />
        <Route path="/localisation" element={<Situation />} />
        <Route path="/contacter" element={<Contacter />} />
        <Route path="/utilisateur" element={<Utilisateur />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        
      </Route>

      <Route path="/tableau-de-bord" element={<TableauDeBord />} />

      <Route 
        path="/admin/bulletins" 
        element={
          <RouteAdmin>
            <AdminBulletin />
          </RouteAdmin>
        }/>

      <Route
    path="/admin"
    element={
        <RouteAdmin>
            <AdminDashboard />
        </RouteAdmin>
    }/>
<Route
  path="/admin/eleves"
  element={
    <RouteAdmin>
      <AdminEleves />
    </RouteAdmin>
  }/>
  <Route
  path="/admin/notes"
  element={
    <RouteAdmin>
      <AdminNotes />
    </RouteAdmin>
  }/>

  <Route
  path="/resultats"
  element={<Resultats />}
/>

    </Routes>
  );
}

export default App;