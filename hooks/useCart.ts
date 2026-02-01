'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, LocalCartItem } from '@/types'

interface CartState {
  items: LocalCartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (product: Product, size?: string | null, color?: string | null, quantity?: number) => void
  removeItem: (productId: string, size?: string | null, color?: string | null) => void
  updateQuantity: (productId: string, size?: string | null, color?: string | null, quantity?: number) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product, size = null, color = null, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product_id === product.id &&
              item.size === size &&
              item.color === color
          )

          if (existingIndex > -1) {
            const newItems = [...state.items]
            newItems[existingIndex].quantity += quantity
            return { items: newItems, isOpen: true }
          }

          return {
            items: [
              ...state.items,
              {
                product_id: product.id,
                product,
                size,
                color,
                quantity,
              },
            ],
            isOpen: true,
          }
        })
      },

      removeItem: (productId, size = null, color = null) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.product_id === productId &&
                item.size === size &&
                item.color === color)
          ),
        }))
      },

      updateQuantity: (productId, size, color, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) =>
                  !(item.product_id === productId &&
                    item.size === size &&
                    item.color === color)
              ),
            }
          }

          return {
            items: state.items.map((item) =>
              item.product_id === productId &&
              item.size === size &&
              item.color === color
                ? { ...item, quantity }
                : item
            ),
          }
        })
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'nextlook-cart',
    }
  )
)
