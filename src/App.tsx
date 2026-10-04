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
import ProfilEleve from './pages/ProfilEleve';
import ProfilParent from './pages/ProfilParent';

import RouteAdmin from './components/RouteAdmin';

import AdminBulletin from './pages/AdminBulletin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEleves from './pages/AdminEleves';
import AdminNotes from './pages/AdminNotes';
import AdminParents from './pages/AdminParents';
import AdminDevoirs from './pages/AdminDevoirs';
import AdminEmploiDuTemps from './pages/AdminEmploiDuTemps';
import AdminAbsences from './pages/AdminAbsences';
import AdminAnneesScolaires from './pages/AdminAnneesScolaires';
import AdminStatistiques from './pages/AdminStatistiques';
import AdminActualites from './pages/AdminActualites';
import ActualitesUtilisateur from './pages/ActualitesUtilisateur';

import Resultats from './pages/Resultats';
import Devoirs from './pages/Devoirs';
import EmploiDuTemps from './pages/EmploiDuTemps';
import Absences from './pages/Absences';
import AdminAdministrateurs from './pages/AdminAdministrateurs';

import './App.css';

function App() {
  return (
    <Routes>

      {/* =========================================
          PAGES PUBLIQUES
          Avec Header + Footer du site
      ========================================= */}

      <Route element={<Layout />}>

        <Route
          path="/"
          element={
            <Navigate
              to="/accueil"
              replace
            />
          }
        />

        <Route
          path="/accueil"
          element={<Accueil />}
        />

        <Route
          path="/formations"
          element={<Formations />}
        />

        <Route
          path="/actualites"
          element={<Actualites />}
        />

        <Route
          path="/localisation"
          element={<Situation />}
        />

        <Route
          path="/contacter"
          element={<Contacter />}
        />

        <Route
          path="/utilisateur"
          element={<Utilisateur />}
        />

        <Route
          path="/connexion"
          element={<Connexion />}
        />

        <Route
          path="/inscription"
          element={<Inscription />}
        />

      </Route>


      {/* =========================================
          ESPACE UTILISATEUR
          SANS Header/Footer de l'accueil
      ========================================= */}

      <Route
        path="/tableau-de-bord"
        element={<TableauDeBord />}
      />

      <Route
        path="/resultats"
        element={<Resultats />}
      />

      <Route
        path="/devoirs"
        element={<Devoirs />}
      />

      <Route
        path="/absences"
        element={<Absences />}
      />

      <Route
        path="/emploi-du-temps"
        element={<EmploiDuTemps />}
      />


      {/* =========================================
          ADMINISTRATION
      ========================================= */}

      <Route
        path="/admin"
        element={
          <RouteAdmin>
            <AdminDashboard />
          </RouteAdmin>
        }
      />

      <Route
        path="/admin/bulletins"
        element={
          <RouteAdmin>
            <AdminBulletin />
          </RouteAdmin>
        }
      />

      <Route
        path="/admin/eleves"
        element={
          <RouteAdmin>
            <AdminEleves />
          </RouteAdmin>
        }
      />

      <Route
        path="/admin/notes"
        element={
          <RouteAdmin>
            <AdminNotes />
          </RouteAdmin>
        }
      />

      <Route
        path="/admin/parents"
        element={
          <RouteAdmin>
            <AdminParents />
          </RouteAdmin>
        }
      />

      <Route
        path="/admin/devoirs"
        element={
          <RouteAdmin>
            <AdminDevoirs />
          </RouteAdmin>
        }
      />

      <Route
        path="/admin/emploi-du-temps"
        element={
          <RouteAdmin>
            <AdminEmploiDuTemps />
          </RouteAdmin>
        }
      />

      <Route
        path="/admin/absences"
        element={
          <RouteAdmin>
            <AdminAbsences />
          </RouteAdmin>
        }
      />

      <Route
        path="/admin/annees-scolaires"
        element={
          <RouteAdmin>
            <AdminAnneesScolaires />
          </RouteAdmin>
        }
      />

      <Route
        path="/admin/statistiques"
        element={
          <RouteAdmin>
            <AdminStatistiques />
          </RouteAdmin>
        }
      />

      <Route
        path="/admin/actualites"
        element={
          <RouteAdmin>
            <AdminActualites />
          </RouteAdmin>
        }
      />

      <Route
  path="/actualites-utilisateur"
  element={<ActualitesUtilisateur />}
/>

<Route path="/profil-parent" element={<ProfilParent />} />

<Route path="/profil-eleve" element={<ProfilEleve />} />

<Route
    path="/admin/administrateurs"
    element={
        <RouteAdmin>
            <AdminAdministrateurs />
        </RouteAdmin>
    }
/>

    </Routes>
  );
}

export default App;

