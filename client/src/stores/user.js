import { defineStore } from "pinia";
import { SERVER_BASE_URL } from "@/config/env";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null
  }),
  //teraz getter przechowuje age ze state, bo to wartość wyliczana, a nie przechowywana
  getters: {
    age: (state) => {
      // Jeśli nie ma usera lub daty, nie ma wieku
      if (!state.user || !state.user.date_of_birth) return null;
      // Pobieramy daty
      const birthDate = new Date(state.user.date_of_birth);
      const today = new Date();
      // Obliczamy różnicę lat
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      return calculatedAge;
    }
  },
  actions: {
    async loadUser() {
      try {
        const res = await fetch(`${SERVER_BASE_URL}/api/users/me`, {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        });

        console.log("loadUser() status:", res.status);

        if (!res.ok) {
          this.user = null;
          return;
        }
        console.log(res)
        const data = await res.json();
        this.user = data.data.user;
        //teraz age zajmuje się getter wyżej

      } catch (err) {
        console.error("loadUser() error:", err);
        this.user = null;
      }
    },
    logout() {
      this.token = null;
    }
  }
});

