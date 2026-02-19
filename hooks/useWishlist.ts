'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'

interface WishlistState {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  toggleItem: (product: Product) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getItemCount: () => number
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id)
          if (exists) return state
          return { items: [...state.items, product] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }))
      },

      toggleItem: (product) => {
        const exists = get().items.some((item) => item.id === product.id)
        if (exists) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId)
      },

      clearWishlist: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.length
      },
    }),
    {
      name: 'nextlook-wishlist',
    }
  )
)
