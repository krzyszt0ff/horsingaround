<template>
  <div class="admin-view">
    <div class="header">
      <h2>Users</h2>

      <div class="controls">
        <input
          class="search"
          v-model="query"
          placeholder="Szukaj po emailu…"
        />

        <label class="chk">
          <input type="checkbox" v-model="includeDeleted" />
          Pokaż usuniętych
        </label>

        <button class="btn" @click="fetchUsers" :disabled="loading">
          Odśwież
        </button>
      </div>
    </div>

    <div v-if="loading" class="info">Ładowanie…</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="list">
      <div v-if="filteredUsers.length === 0" class="info">Brak użytkowników</div>

      <div v-for="u in filteredUsers" :key="u._id" class="row">
        <div class="col email">
          <div class="email-main">{{ u.email }}</div>
          <div class="email-sub">
            ID: <span class="mono">{{ u._id }}</span>
          </div>
        </div>

        <div class="col role">
          <div class="label">Role</div>
          <select class="select" v-model="u.role" :disabled="u.isDeleted" @change="changeRole(u)">
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div class="col status">
          <div class="label">Status</div>
          <span class="pill" :class="{ deleted: !!u.isDeleted }">
            {{ u.isDeleted ? "deleted" : "active" }}
          </span>
        </div>

        <div class="col actions">
          <button
            v-if="!u.isDeleted"
            class="btn danger"
            @click="softDelete(u)"
          >
            Soft delete
          </button>

          <button
            v-else
            class="btn"
            @click="restore(u)"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import { SERVER_BASE_URL } from "@/config/env";

const ADMIN_BASE = `${SERVER_BASE_URL}/api/admin`; // <- jeśli masz inaczej, zmień tu

const users = ref([]);
const loading = ref(false);
const error = ref("");

const includeDeleted = ref(false);
const query = ref("");

const fetchUsers = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await axios.get(`${ADMIN_BASE}/users`, {
      params: { includeDeleted: includeDeleted.value },
      withCredentials: true,
    });
    users.value = res.data;
  } catch (e) {
    error.value = e?.response?.data?.message || e?.response?.data?.error || e.message || "Błąd pobierania użytkowników";
  } finally {
    loading.value = false;
  }
};

const changeRole = async (u) => {
  error.value = "";
  try {
    await axios.patch(
      `${ADMIN_BASE}/users/${u._id}/role`,
      { role: u.role },
      { withCredentials: true }
    );
  } catch (e) {
    error.value = e?.response?.data?.message || e?.response?.data?.error || e.message || "Błąd zmiany roli";
    await fetchUsers();
  }
};

const softDelete = async (u) => {
  error.value = "";
  try {
    await axios.patch(`${ADMIN_BASE}/users/${u._id}/soft-delete`, {}, { withCredentials: true });
    await fetchUsers();
  } catch (e) {
    error.value = e?.response?.data?.message || e?.response?.data?.error || e.message || "Błąd soft delete";
  }
};

const restore = async (u) => {
  error.value = "";
  try {
    await axios.patch(`${ADMIN_BASE}/users/${u._id}/restore`, {}, { withCredentials: true });
    await fetchUsers();
  } catch (e) {
    error.value = e?.response?.data?.message || e?.response?.data?.error || e.message || "Błąd restore";
  }
};

const filteredUsers = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return users.value;
  return users.value.filter(u => (u.email || "").toLowerCase().includes(q));
});

watch(includeDeleted, fetchUsers);
onMounted(fetchUsers);
</script>

<style scoped>
h2 { margin: 0; color:#a94e74; }

.admin-view { display:flex; flex-direction:column; gap: 1rem; }

.header{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap: 1rem;
  flex-wrap:wrap;
}

.controls{
  display:flex;
  gap:.75rem;
  align-items:center;
  flex-wrap:wrap;
}

.search{
  border:1px solid #f0c4d8;
  border-radius: 14px;
  padding:.6rem .8rem;
  outline:none;
  min-width: 220px;
}

.chk{
  display:inline-flex;
  gap:.5rem;
  align-items:center;
  color:#555;
  font-weight:600;
}

.btn{
  border:none;
  border-radius: 40px;
  padding: .7rem 1.1rem;
  font-weight:700;
  cursor:pointer;
  transition:.25s;
  background: linear-gradient(90deg, #e67da8, #cf4e7d);
  color:white;
  box-shadow: 0 4px 10px rgba(230, 125, 168, 0.3);
}

.btn:disabled{
  opacity:.6;
  cursor:not-allowed;
  transform:none;
}

.btn:hover{ transform: scale(1.03); }

.btn.danger{
  background:#f3f3f3;
  color:#a94e74;
  box-shadow:none;
}

.btn.danger:hover{
  background:#f7dbe7;
}

.info{ color:#777; font-weight:600; }
.error{ color:#c00; font-weight:700; }

.list{
  display:flex;
  flex-direction:column;
  gap:.75rem;
}

.row{
  display:grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(169,78,116,.15);
}

.col{ display:flex; flex-direction:column; gap:.35rem; }

.email-main{ font-weight:800; color:#333; }
.email-sub{ color:#777; font-size:.85rem; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

.label{ color:#a94e74; font-weight:800; font-size:.85rem; }

.select{
  border: 1px solid #f0c4d8;
  border-radius: 14px;
  padding:.55rem .6rem;
  outline:none;
}

.pill{
  display:inline-flex;
  align-self:flex-start;
  padding:.25rem .6rem;
  border-radius: 999px;
  font-weight:800;
  font-size:.85rem;
  background:#eaf7ee;
  color:#2b7a3d;
}

.pill.deleted{
  background:#fdecef;
  color:#b3263c;
}

@media (width <= 900px){
  .row{
    grid-template-columns: 1fr;
  }
}
</style>
