<template>
  <div id="app">
    <nav class="navigation">
      <router-link to="/sales" class="nav-link">💰 Продажи</router-link>
      <router-link to="/orders" class="nav-link">📦 Заказы</router-link>
      <router-link to="/incomes" class="nav-link">📈 Доходы</router-link>
      <router-link to="/stocks" class="nav-link">🏪 Склады</router-link>
    </nav>
    
    <router-view />
  </div>
</template>

<style>
.navigation {
  background: #2c3e50;
  padding: 1rem;
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #34495e;
}
</style>