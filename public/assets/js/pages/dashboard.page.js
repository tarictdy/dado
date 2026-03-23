import { logout } from '../core/auth.js';
import { requireAuth } from '../core/guards.js';

const roleActionsMap = {
  CLIENT: ['Consulter les annonces récentes', 'Gérer les favoris', 'Mettre à jour le profil'],
  PRESTATAIRE: ['Créer une annonce', 'Gérer la galerie photos', 'Activer un abonnement premium'],
  VENDEUR_PRODUIT: ['Créer un produit', 'Gérer le catalogue', 'Booster la visibilité'],
};

async function initDashboard() {
  const profileResponse = await requireAuth();
  if (!profileResponse) return;

  const { user } = profileResponse;
  document.getElementById('dashboard-title').textContent = `Bienvenue ${user.fullName}`;
  document.getElementById('dashboard-subtitle').textContent = `Rôle: ${user.role} · Téléphone vérifié: ${user.isVerified ? 'Oui' : 'Non'}`;
  document.getElementById('profile-summary').textContent = user.isProfileCompleted
    ? `${user.city || 'Ville non renseignée'} · ${user.bio || 'Bio à compléter'}`
    : 'Profil incomplet. Complétez votre profil pour débloquer toutes les actions.';
  document.getElementById('subscription-summary').textContent = `Statut abonnement: ${user.subscriptionStatus}. Publication premium ${user.subscriptionStatus === 'ACTIVE' ? 'débloquée' : 'bloquée'}.`;

  const roleActions = document.getElementById('role-actions');
  roleActions.innerHTML = '';
  (roleActionsMap[user.role] || []).forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    roleActions.appendChild(li);
  });
}

document.getElementById('logout-button')?.addEventListener('click', async () => {
  await logout();
  window.location.href = '/login.html';
});

initDashboard();
