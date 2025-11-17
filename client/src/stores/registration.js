import { defineStore } from 'pinia'

export const useRegistrationStore = defineStore('registration', {
    state: () => ({
        step1: {},
        step2: {},
        step3: {},
    }),
    getters: {
        allData: (state) => ({...state.step1, ...state.step2, ...state.step3})
    },
    actions: {
        updateStep(step, data) {
            this[step] = { ...this[step], ...data}
        },
        reset() {
            this.step1 = {}
            this.step2 = {}
            this.step3 = {}
        }
    }
})