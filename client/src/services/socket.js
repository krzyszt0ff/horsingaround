import { io } from "socket.io-client";
import { SERVER_BASE_URL } from "@/config/env";

class SocketService {
  socket = null;                                    // Połączenie

  connect() {                                       // Nawiązywanie połączenia
    if (this.socket) return;                        // Sprawdzanie istnienia danego połączenia, by nie tworzyć kilku socketów do tego samego połączenia
    this.socket = io(SERVER_BASE_URL, {
      withCredentials: true,                        // Umożliwia odczytywanie identyfiktora sesji z ciasteczek (sprawdzanie tożsamości)
      autoConnect: true                             // Automatyczna inicjalizacja sesji, umożliwia reconnect
    });
  }

  disconnect() {                                    // Rozłączanie
    if (this.socket) {
      this.socket.disconnect();                     // Zamknięcie połączenia
      this.socket = null;                           // Usunięcie zapisanego połączenia
    }
  }

  on(event, callback) {                             // Nasłuchiwanie na wydarzenie event
    if (!this.socket) return;                       // Jeżeli połączenie nie istnieje, zakończ działanie
    this.socket.on(event, callback);                // Jak usłyszysz sygnał event, wykonaj funkcję callback
  }

  off(event) {                                      // Przestań nasłuchiwać i czekać na zdarzenie event
    if (!this.socket) return;
    this.socket.off(event);
  }

  emit(event, data) {                               // Komunikacja z serwerem
    if (!this.socket) return;
    this.socket.emit(event, data);                  // Wyślij kominikat event z danymi data
  }
}

export default new SocketService();