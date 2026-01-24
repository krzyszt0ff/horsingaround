import { defineStore } from 'pinia';
import socketService from '@/services/socket';
import axios from 'axios'; 
import { SERVER_BASE_URL } from "@/config/env";

export const API_URL = SERVER_BASE_URL;

export const useChatStore = defineStore('chat', {
  state: () => ({
    chats: [],                // Lista chatów       
    activeChat: null,         // Obecnie aktywny chat
    messages: [],             // Wiadomości obecnie otwartego chatu
    onlineUsers: new Set(),   // Lista aktywnych użytkowników
    myUserId: null,           // ID użytkownika
  }),

  getters: {
    sortedChats: (state) => {
      return [...state.chats].sort((a, b) => {                              // kopia listy chats ze state do posortowania
        const dateA = new Date(a.last_message_date || a.match_date || 0);   // Data ostatniej wiadomości/matchu w wypadku braku widomosci dla chatu A 
        const dateB = new Date(b.last_message_date || b.match_date || 0);   // --||-- dla chatu B
        return dateB - dateA;                                               // Sortowanie malejąco
      });
    }
  },

  actions: {
    initSocket(userId) {
      if (this.myUserId) return;

      this.myUserId = userId;
      socketService.connect();                            // Łączenie z serwerem

      socketService.on('active_users_list', (users) => {  // Wysłanie listy wszystkich aktywnych użytkowników
        this.onlineUsers = new Set(users);
      });

      // Obsługa aktywności użytkowników (gdy wchodzą/wychodzą)
      socketService.on('user_online', (user) => this.onlineUsers.add(user));
      socketService.on('user_offline', (user) => this.onlineUsers.delete(user));

      // Odbieranie i wysyłanie wiadomości
      socketService.on('new_message', (msg) => this.handleIncomingMessage(msg));
      socketService.on('message_sent', (msg) => this.handleIncomingMessage(msg));
    },

    // Obsługa wiadomości (listy chatów)
    handleIncomingMessage(msg) {
      if (this.activeChat && this.activeChat.match_id === msg.match_id) { this.messages.push(msg); }  // Jeżeli chat jest aktywny (otwarty) i wiadomość dotyczy tej rozmowy to dodaj widomość do listy

      const chatIndex = this.chats.findIndex(c => c.match_id === msg.match_id);                       // Szukamy indexu ddla ddanego chatu (matcha)
      if (chatIndex !== -1) {
        // Aktualizacja podglądu chatu (ostatnia wiadomość, data)
        const chat = this.chats[chatIndex];
        chat.last_message = msg.content;
        chat.last_message_date = msg.created_at;

        // Sprawdzanie nadawcy
        if (String(msg.from_user) !== String(this.myUserId)) {
          if (!this.activeChat || this.activeChat.match_id !== msg.match_id) {  // Sprawdzanie czy jakiś czat jest otwarty lub czy otarty chat dotyczy tej wiadomości
              chat.has_unread = true; // Jeżeli nie - ustaw flagę na unread
          }
        }
      } else { this.fetchChats(); } // Jeżeli chat nie istnieje (nowy match) - załaduj chaty od nowa
    },

    // Pobieranie listy chatów/matchy
    async fetchChats() {
      try {
        // Pobieranie listy chatów przez API
        const res = await axios.get(`${API_URL}/api/matches/chats`, { withCredentials: true });
        
        if (res.data.success) { // Podpięcie pobranych danych ddo listy ze state
            this.chats = res.data.data;
        }
      } catch (err) {
        console.error("Błąd pobierania chatów:", err);
      }
    },

    // Otwieranie chatu
    async selectChat(chat) {
        if (this.activeChat) {                  // Jeżeli chat jest otwarty - zamknij go
            socketService.emit('leave_chat');
        }
        
        this.activeChat = chat;               // Ustaw obecny chat na wybrany
        this.activeChat.has_unread = false;   // Zmień flagę nieodczytanych wiadomości
        this.messages = [];                   // Wyczyszczenie listy wiadomości
        
        try { // Pobieranie wiadomości przez API
            const res = await axios.get(`${API_URL}/api/matches/${chat.match_id}/messages`, { withCredentials: true });
            if (res.data.success) {
                this.messages = res.data.data.reverse();  // Posortowanie od najstarszych do najnowszych
            }
            // Prześlij serwerowi sygnał o otworzeniu danego chatu
            socketService.emit('join_chat', { matchId: chat.match_id });
        } catch (err) {
            console.error("Błąd pobierania wiadomości:", err);
        }
    },
    
    // Obsługa wysyłania wiadomości
    sendMessage(text) {
      const currentMatchId = this.activeChat.match_id || this.activeChat._id;
      if (!this.activeChat || !text.trim()) return; // Warunek do wysyłania wiadomości - wybrany chat i treść wiadomości nie złożona z samych znaków białych

      console.log("Sending message to match ID:", currentMatchId);
      socketService.emit('send_message', { // Wysyłanie wiadomości/sygnału do serwera
        matchId: currentMatchId,
        text: text
      });
    },
async deleteMatch(matchId) {
  try {
    const res = await axios.delete(`${API_URL}/api/matches`, {
      data: { ids: [matchId] },
      withCredentials: true
    });
    console.log("Serwer odpowiedział:", res.data);
    if (res.data.success) {
      this.chats = this.chats.filter(c => c.match_id !== matchId);
      this.activeChat = null;
      return true;
    }
    return false;
  } catch (err) {
    // KLUCZOWE: Wypisz błąd w konsoli!
    console.error("Pełny błąd axios:", err);
    if (err.response) {
       console.error("Status błędu:", err.response.status);
       console.error("Dane błędu:", err.response.data);
    }
    return false;
  }
}
  }
});