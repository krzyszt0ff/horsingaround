# Horsing Around 🐴

Aplikacja webowa HORSING aAROUND typu “dating app” z systemem rejestracji/logowania, tworzeniem profilu, przeglądaniem profili w formie swipe według swoich preferencji, polubieniami i matchami, czatem oraz panelem administratora (zarządzanie użytkownikami i zgłoszeniami).

## Funkcje

### Użytkownik
- Rejestracja i logowanie 
- Tworzenie profilu (multipart/form-data)
- Edycja profilu (tekst + zdjęcia)
- Aktualizacja lokalizacji
- Przeglądanie profili (filtrowanie po preferencjach + dystans + wiek)
- Like użytkownika + tworzenie matchy
- Zgłaszanie użytkownika (Report)

### Admin panel
- Widok użytkowników: lista, zmiana roli (User/Admin), soft delete i restore
- Widok zgłoszeń (Reports): podgląd zgłoszeń i obsługa statusu/inspekcji (zależnie od implementacji)

## Tech stack
**Frontend**
- Vue 3 + Vue Router
- Pinia (store)
- Axios / fetch
- Vite

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT (auth)
- cookie-parser

---

---

## Demo
- **Live:** https://horsingaround-0ito.onrender.com

