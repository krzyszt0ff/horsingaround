<template>
  <div class="message-wrapper">
    <div v-if="showDateSeparator" class="date-separator">
      {{ formattedDate }}
    </div>

    <div 
      class="message-box" 
      :class="{ 
        'mine': isMine, 
        'show-time': isClicked
      }"
      @click="$emit('toggle-timestamp')"
    >
      <div class="message-bubble">{{ message.content }}</div>
      
      <span class="message-time" v-if="isClicked">
        {{ formattedTime }}
      </span>
    </div>
  </div>
</template>

<script setup>

    import { computed } from 'vue';

    const props = defineProps({         // Dane
        message: Object,                // Obiekt wiadomości
        isMine: Boolean,                // Flaga do sprawdzania nadawcy
        isClicked: Boolean,             // Flaga czy wiadomość jest do inspekcji (sprawdzanie godziny wsyłania)
        showDateSeparator: Boolean,     // Flaga czy dana wiadomość jest z kolejnego dnia (i potrzebuje separatora)
        formattedDate: String           // Sformatowana data
    });

    defineEmits(['toggle-timestamp']);  // Deklracja sygnału możliwego do wysłania do komponentu nadrzędnego w celu inspekcji wiadomości

    // Fortmatowanie dat
    const formattedTime = computed(() => {
        if (!props.message.created_at) return '';
        return new Date(props.message.created_at).toLocaleTimeString('pl-PL', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    });

</script>

<style scoped> /* Powodzenia krzysiek */ /* Dzk */

    .message-wrapper {
        display: contents;
    }

    .date-separator {
        text-align: center;
        margin: 20px 0;
        font-size: 0.75rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 1px;
        width: 100%;
    }

    .message-box {
        display: grid;
        align-items: end;
        max-width: 90%;
        transition: gap 0.2s ease;
        margin-bottom: 4px;
    }

    .message-box {
        grid-template-columns: auto auto;
        justify-content: start;
        align-self: flex-start;
    }

    .message-box .message-bubble { 
        grid-column: 1; 
        background: #f0f0f0; 
        color: #333;
        border-radius: 18px 18px 18px 4px; 
    }

    .message-box .message-time { grid-column: 2; }

    .message-box.mine {
        grid-template-columns: auto auto;
        justify-content: end;
        align-self: flex-end;
    }

    .message-box.mine .message-bubble { 
        grid-column: 2; 
        background: var(--pink3); 
        color: white; 
        border-radius: 18px 18px 4px 18px; 
    }

    .message-box.mine .message-time { grid-column: 1; }

    .message-box.show-time {
        column-gap: 8px;
    }

    .message-bubble {
        padding: 10px 15px;
        font-size: 0.95rem;
        line-height: 1.4;
        cursor: pointer;
        user-select: none;
        word-break: break-word;
    }

    .message-time {
        font-size: 0.65rem;
        color: #999;
        padding-bottom: 4px;
        white-space: nowrap;
        animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
</style>