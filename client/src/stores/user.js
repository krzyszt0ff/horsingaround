import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null
  }),

  actions: {
    async loadUser() {
      try {
        const res = await fetch("http://localhost:3000/api/users/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        });

        console.log("loadUser() status:", res.status);

        if (!res.ok) {
          this.user = null;
          return;
        }

        const data = await res.json();
        this.user = data.data.user;
        this.age = data.data.age;

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

