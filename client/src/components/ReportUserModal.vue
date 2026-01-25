<template>
  <div class="modal">
    <h3>Report user</h3>

<textarea
  id="report-reason"
  name="report_reason"
  v-model="reportText"
  placeholder="Reason for report..."
  rows="4"
></textarea>

    <div class="actions">
      <button @click="submitReport">Send</button>
      <button @click="close">Cancel</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { SERVER_BASE_URL } from '@/config/env';

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close', 'success']);

const reportText = ref('');

function close() {
  reportText.value = '';
  emit('close');
}

async function submitReport() {
  if (!reportText.value.trim()) {
    alert('Give a reason for your report:');
    return;
  }

  const res = await fetch(
    `${SERVER_BASE_URL}/api/users/${props.userId}/report`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text_content: reportText.value
      })
    }
  );

  if (res.ok) {
    alert('Report sent!');
    reportText.value = '';
    emit('success');
    emit('close');
  } else {
    alert('Report sending error!');
  }
}
</script>

<style scoped>

.modal {
  background: #fff;
  padding: 20px;
  border-radius: 24px;
  width: 400px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

h3 {
  color: #a94e74;
  margin: 0;
  margin-bottom: 1rem;
}

.actions{
  display: flex;
  justify-content: center;
}

.actions button{
  background: #f3f3f3;
  color: #a94e74;
  border: none;
  border-radius: 40px;
  padding: 0.8rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  flex: 1; 
  max-width: 140px; 
}

.actions button:hover{
  background: #f7dbe7;
  transform: scale(1.05);
}

.modal textarea{
  width: 100%;
  margin-bottom: 1rem;
}
</style>