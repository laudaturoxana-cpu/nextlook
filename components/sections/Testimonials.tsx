'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface Review {
  id: string
  user_name: string
  comment: string
  rating: number
  city?: string
}

// Fallback testimonials when no reviews exist
const fallbackTestimonials: Review[] = [
  {
    id: '1',
    comment: 'Produse originale, livrare în 24h. Am comandat de 3 ori.',
    user_name: 'Andrei M.',
    rating: 5,
    city: 'București',
  },
  {
    id: '2',
    comment: 'Returul chiar e gratuit, am testat. Recomand!',
    user_name: 'Ioana P.',
    rating: 5,
    city: 'Cluj',
  },
  {
    id: '3',
    comment: 'Am probat acasă, am returnat ce nu mi-a venit. Zero stres.',
    user_name: 'Cristina L.',
    rating: 5,
    city: 'Timișoara',
  },
]

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>(fallbackTestimonials)
  const [averageRating, setAverageRating] = useState(4.8)
  const [totalReviews, setTotalReviews] = useState(500)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews/featured')
        const data = await response.json()

        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews.slice(0, 3))
          setAverageRating(data.averageRating || 4.8)
          setTotalReviews(data.totalReviews || 500)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
        // Keep fallback testimonials
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const displayReviews = reviews.slice(0, 3)

  return (
    <section className="py-16 lg:py-24 bg-cream">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Overall Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-1 mb-3" role="img" aria-label={`Rating: ${averageRating} din 5 stele`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.floor(averageRating) ? 'text-gold fill-gold' : 'text-sand'}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="font-display text-display-sm text-text">{averageRating} / 5</p>
          <p className="text-text-secondary text-sm mt-1">din {totalReviews}+ recenzii verificate</p>
        </motion.div>

        {/* Testimonials Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {isLoading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-soft animate-pulse">
                <div className="h-16 bg-cream-100 rounded mb-3" />
                <div className="h-4 bg-cream-100 rounded w-2/3 mx-auto" />
              </div>
            ))
          ) : (
            displayReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-soft text-center"
              >
                {/* Star rating */}
                <div className="flex items-center justify-center gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < review.rating ? 'text-gold fill-gold' : 'text-sand'}`}
                    />
                  ))}
                </div>
                <p className="text-text text-sm leading-relaxed mb-3">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <p className="text-xs text-text-secondary">
                  <span className="font-medium text-text">{review.user_name}</span>
                  {review.city && <> &middot; {review.city}</>}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
