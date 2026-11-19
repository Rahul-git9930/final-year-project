document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('.erp-app');
  const mobileMenu = document.getElementById('erpMobileMenu');
  const themeToggle = document.getElementById('erpThemeToggle');
  const pageTitle = document.getElementById('erpPageTitle');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  window.erpHasRole = roleList => {
    if (!roleList) return true;
    const roles = Array.isArray(roleList) ? roleList : [roleList];
    if (user.role === 'super_admin') return true;
    if (user.role === 'college_admin' && roles.includes('college_admin')) return true;
    return roles.includes(user.role);
  };
  const displayName = user.name || user.email || 'User';
  const initials = displayName
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  document.querySelectorAll('.erp-avatar').forEach(avatar => {
    avatar.textContent = initials || 'U';
  });

  const userName = document.getElementById('userName');
  if (userName) userName.textContent = displayName;

  const savedTheme = localStorage.getItem('erpTheme');
  if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      if (dark) {
        delete document.documentElement.dataset.theme;
        localStorage.setItem('erpTheme', 'light');
      } else {
        document.documentElement.dataset.theme = 'dark';
        localStorage.setItem('erpTheme', 'dark');
      }
    });
  }

  if (mobileMenu && app) {
    mobileMenu.addEventListener('click', () => {
      app.classList.toggle('sidebar-open');
    });
  }

  document.querySelectorAll('.erp-sidebar-menu li').forEach(item => {
    item.addEventListener('click', () => {
      if (app) app.classList.remove('sidebar-open');
      item.parentElement.querySelectorAll('li').forEach(link => link.classList.remove('active'));
      item.classList.add('active');
      if (pageTitle) {
        const label = item.childNodes[0].textContent.trim();
        pageTitle.textContent = label === 'Dashboard' ? 'Dashboard' : label;
      }
    });
  });

  const globalSearch = document.getElementById('erpGlobalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        const query = globalSearch.value.trim();
        if (query) window.dispatchEvent(new CustomEvent('erp-global-search', { detail: { query } }));
      }
    });
  }
});
