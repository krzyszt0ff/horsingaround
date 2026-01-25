<template>
  <div class="admin-view">
    <div class="header">
      <h2>Reports</h2>

      <div class="controls">
        <select class="select" v-model="statusFilter">
          <option value="">Wszystkie</option>
          <option value="new">new</option>
          <option value="in_progress">in_progress</option>
          <option value="resolved">resolved</option>
        </select>

        <button class="btn" @click="fetchReports" :disabled="loading">Odśwież</button>
      </div>
    </div>

    <div v-if="loading" class="info">Ładowanie…</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="list">
      <div v-if="filteredReports.length === 0" class="info">Brak zgłoszeń</div>

      <div v-for="r in filteredReports" :key="r._id" class="card">
        <div class="top">
          <div>
            <div class="title">
              {{ r.user_id?.email || "unknown user" }}
              <span class="role">({{ r.user_id?.role }})</span>
            </div>
            <div class="meta">
              ID: <span class="mono">{{ r._id }}</span>
            </div>
          </div>

          <div class="status">
            <div class="label">Status</div>
            <select class="select" v-model="r.status" @change="changeStatus(r)">
              <option value="new">new</option>
              <option value="in_progress">in_progress</option>
              <option value="resolved">resolved</option>
            </select>
          </div>
        </div>

        <button class="btn ghost" @click="toggle(r._id)">
          {{ openId === r._id ? "Ukryj szczegóły" : "Pokaż szczegóły" }}
        </button>

        <div v-if="openId === r._id" class="details">
          <pre>{{ JSON.stringify(r, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { SERVER_BASE_URL } from "@/config/env";

const ADMIN_BASE = `${SERVER_BASE_URL}/api/admin`; // <- dopasuj jeśli masz inną ścieżkę

const reports = ref([]);
const loading = ref(false);
const error = ref("");

const statusFilter = ref("");
const openId = ref(null);

const fetchReports = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await axios.get(`${ADMIN_BASE}/reports`, { withCredentials: true });
    reports.value = res.data;
  } catch (e) {
    error.value = e?.response?.data?.message || e?.response?.data?.error || e.message || "Błąd pobierania zgłoszeń";
  } finally {
    loading.value = false;
  }
};

const changeStatus = async (r) => {
  error.value = "";
  try {
    await axios.patch(
      `${ADMIN_BASE}/reports/${r._id}`,
      { status: r.status },
      { withCredentials: true }
    );
  } catch (e) {
    error.value = e?.response?.data?.message || e?.response?.data?.error || e.message || "Błąd zmiany statusu";
    await fetchReports();
  }
};

const toggle = (id) => {
  openId.value = openId.value === id ? null : id;
};

const filteredReports = computed(() => {
  if (!statusFilter.value) return reports.value;
  return reports.value.filter(r => r.status === statusFilter.value);
});

onMounted(fetchReports);
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

.controls{ display:flex; gap:.75rem; align-items:center; flex-wrap:wrap; }

.select{
  border: 1px solid #f0c4d8;
  border-radius: 14px;
  padding:.55rem .6rem;
  outline:none;
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

.btn:hover{ transform: scale(1.03); }

.btn.ghost{
  background:#f3f3f3;
  color:#a94e74;
  box-shadow:none;
  margin-top: .75rem;
  width: fit-content;
}

.btn.ghost:hover{
  background:#f7dbe7;
}

.info{ color:#777; font-weight:600; }
.error{ color:#c00; font-weight:700; }

.list{ display:flex; flex-direction:column; gap: 1rem; }

.card{
  border: 1px solid rgba(169,78,116,.15);
  border-radius: 18px;
  padding: 1rem;
}

.top{
  display:flex;
  justify-content:space-between;
  gap: 1rem;
  flex-wrap:wrap;
}

.title{ font-weight:800; color:#333; }
.role{ color:#777; font-weight:700; margin-left:.4rem; }
.meta{ color:#777; font-size:.85rem; margin-top:.25rem; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

.status .label{
  color:#a94e74;
  font-weight:800;
  font-size:.85rem;
  margin-bottom:.35rem;
}

.details{
  background:#f8f0f4;
  border-radius: 14px;
  padding: .8rem;
  margin-top: .8rem;
}

pre{ margin:0; white-space: pre-wrap; }
</style>
