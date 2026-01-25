<template>
  <div class="admin-page-container">
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="brand">
          <div class="brand-title">Admin Panel</div>
          <div class="brand-sub">zarządzanie aplikacją</div>
        </div>

        <nav class="nav">
          <RouterLink class="nav-link" to="/admin/users">Users</RouterLink>
          <RouterLink class="nav-link" to="/admin/reports">Reports</RouterLink>
        </nav>
      </aside>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-page-container{
  display:flex;
  justify-content:center;
  align-items:stretch;
  width:100%;
  height:100%;
}

.admin-shell{
  width:100%;
  height:100%;
  display:grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  padding: 2rem;
}

.admin-sidebar{
  background:white;
  border-radius:24px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  padding: 1.25rem;
  display:flex;
  flex-direction:column;
  gap: 1rem;
}

.brand-title{
  font-weight:800;
  font-size: 1.3rem;
  color:#a94e74;
}
.brand-sub{
  color:#777;
  font-size: .9rem;
  margin-top: .2rem;
}

.nav{
  display:flex;
  flex-direction:column;
  gap:.6rem;
  margin-top:.5rem;
}

.nav-link{
  text-decoration:none;
  color:#a94e74;
  font-weight:700;
  padding:.8rem .9rem;
  border-radius:16px;
  transition:.2s;
  background:#f8f0f4;
}

.nav-link:hover{
  transform: scale(1.01);
  background:#f7dbe7;
}

.nav-link.router-link-active{
  background: linear-gradient(90deg, #e67da8, #cf4e7d);
  color:white;
  box-shadow: 0 4px 10px rgba(230, 125, 168, 0.3);
}

.admin-content{
  background:white;
  border-radius:24px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  padding: 1.5rem;
  overflow:auto;
}

@media (width <= 900px){
  .admin-shell{
    grid-template-columns: 1fr;
  }
}
</style>
