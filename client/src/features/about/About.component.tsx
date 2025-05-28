import type React from "react"
import { FaWhatsapp } from "react-icons/fa"

const AboutPage: React.FC = () => {
  const whatsappNumber = "+96176951471"
  const whatsappMessage = "Hello! I'm interested in your perfume samples."

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage)
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Luxury Perfume Decants & Samples
            <span className="text-2xl ml-2">✨</span>
          </h1>

          {/* Main Content */}
          <div className="space-y-8 mb-12">
            {/* Features */}
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-xl text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Authentic, Well-stored, Affordable</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-xl text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Delivery all over Lebanon 🇱🇧</span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-6">
             
              {/* WhatsApp Button */}
              <div>
                <button
                  onClick={handleWhatsAppClick}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaWhatsapp size={24} />
                  <span>Contact us on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-xl p-6 text-gray-600">
            <p className="text-lg">
              Experience luxury fragrances without the commitment. Our carefully curated collection of perfume samples
              allows you to discover your perfect scent at an affordable price.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
